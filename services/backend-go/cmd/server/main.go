package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var db *pgxpool.Pool

// Models
type Patient struct {
	ID          string    `json:"id"`
	PatientID   string    `json:"patient_id"`
	Name        string    `json:"name"`
	DateOfBirth string    `json:"date_of_birth,omitempty"`
	Gender      string    `json:"gender,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type HealthRecord struct {
	ID         string          `json:"id"`
	PatientID  string          `json:"patient_id"`
	RecordType string          `json:"record_type"`
	Data       json.RawMessage `json:"data"`
	DataHash   string          `json:"data_hash"`
	CreatedAt  time.Time       `json:"created_at"`
}

type IngestRequest struct {
	PatientID  string          `json:"patient_id"`
	RecordType string          `json:"record_type"`
	Data       json.RawMessage `json:"data"`
}

type IngestResponse struct {
	Status   string `json:"status"`
	RecordID string `json:"record_id"`
	DataHash string `json:"data_hash"`
}

func main() {
	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://vanguard:vanguard_secret@localhost:5432/vanguardhealth?sslmode=disable"
	}

	var err error
	db, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	// Echo server
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}))

	// Routes
	e.GET("/health", healthCheck)

	// Patient routes
	e.POST("/patients", createPatient)
	e.GET("/patients/:id", getPatient)
	e.GET("/patients", listPatients)

	// Health records routes
	e.POST("/ingest", ingestRecord)
	e.GET("/records/:patient_id", getRecords)

	// Analytics routes
	e.GET("/stats", getStats)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "50051"
	}
	e.Logger.Fatal(e.Start(":" + port))
}

func healthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "healthy"})
}

func createPatient(c echo.Context) error {
	var patient Patient
	if err := c.Bind(&patient); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	var dob interface{}
	if patient.DateOfBirth == "" {
		dob = nil
	} else {
		dob = patient.DateOfBirth
	}

	err := db.QueryRow(context.Background(),
		`INSERT INTO patients (patient_id, name, date_of_birth, gender, created_at) 
		 VALUES ($1, $2, $3, $4, NOW()) 
		 RETURNING id, created_at`,
		patient.PatientID, patient.Name, dob, patient.Gender,
	).Scan(&patient.ID, &patient.CreatedAt)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, patient)
}

func getPatient(c echo.Context) error {
	patientID := c.Param("id")

	var patient Patient
	err := db.QueryRow(context.Background(),
		`SELECT id, patient_id, name, date_of_birth, gender, created_at 
		 FROM patients WHERE patient_id = $1 LIMIT 1`,
		patientID,
	).Scan(&patient.ID, &patient.PatientID, &patient.Name, &patient.DateOfBirth, &patient.Gender, &patient.CreatedAt)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Patient not found")
	}

	return c.JSON(http.StatusOK, patient)
}

func listPatients(c echo.Context) error {
	// Simple query to avoid DISTINCT ON issues for now, we filter unique in map if needed or just trust latest
	rows, err := db.Query(context.Background(),
		`SELECT DISTINCT ON (patient_id) id, patient_id, name, date_of_birth, gender, created_at 
		 FROM patients 
		 ORDER BY patient_id, created_at DESC`)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	patients := []Patient{} // Initialized empty slice
	for rows.Next() {
		var p Patient
		var dob sql.NullString // Handle potential nulls
		if err := rows.Scan(&p.ID, &p.PatientID, &p.Name, &dob, &p.Gender, &p.CreatedAt); err != nil {
			continue
		}
		p.DateOfBirth = dob.String
		patients = append(patients, p)
	}

	return c.JSON(http.StatusOK, patients)
}

func ingestRecord(c echo.Context) error {
	var req IngestRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	// Calculate SHA-256 hash
	h := sha256.Sum256(req.Data)
	hashStr := hex.EncodeToString(h[:])

	// Ensure patient exists (Upsert)
	_, err := db.Exec(context.Background(),
		`INSERT INTO patients (patient_id, name, created_at) 
		 VALUES ($1, $2, NOW()) 
		 ON CONFLICT (patient_id) DO NOTHING`,
		req.PatientID, "Patient "+req.PatientID,
	)
	if err != nil {
		log.Printf("Failed to ensure patient exists: %v", err)
		// Continue anyway, as it might just be a constraint issue or we proceed with record insertion
	}

	// Insert record
	var recordID string
	err = db.QueryRow(context.Background(),
		`INSERT INTO health_records (patient_id, record_type, data, data_hash) 
		 VALUES ($1, $2, $3, $4) 
		 RETURNING id`,
		req.PatientID, req.RecordType, req.Data, hashStr,
	).Scan(&recordID)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	// Log audit
	db.Exec(context.Background(),
		`INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4)`,
		"CREATE", "health_record", recordID, map[string]string{"patient_id": req.PatientID},
	)

	// Trigger vectorization in AI service (async, non-blocking)
	go func() {
		aiURL := os.Getenv("AI_SERVICE_URL")
		if aiURL == "" {
			aiURL = "http://localhost:3001"
		}

		vectorizePayload, _ := json.Marshal(map[string]interface{}{
			"record_id":   recordID,
			"patient_id":  req.PatientID,
			"record_type": req.RecordType,
			"data":        json.RawMessage(req.Data),
		})

		resp, err := http.Post(aiURL+"/vectorize", "application/json", bytes.NewBuffer(vectorizePayload))
		if err != nil {
			log.Printf("Vectorization failed for %s: %v", recordID, err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode == 200 {
			log.Printf("✅ Record %s indexed to Qdrant", recordID)
		} else {
			body, _ := io.ReadAll(resp.Body)
			log.Printf("⚠️ Vectorization warning for %s: %s", recordID, string(body))
		}
	}()

	return c.JSON(http.StatusOK, IngestResponse{
		Status:   "success",
		RecordID: recordID,
		DataHash: hashStr,
	})
}

func getRecords(c echo.Context) error {
	patientID := c.Param("patient_id")
	recordType := c.QueryParam("type")

	query := `SELECT id, patient_id, record_type, data, data_hash, created_at 
			  FROM health_records WHERE patient_id = $1`
	args := []interface{}{patientID}

	if recordType != "" {
		query += " AND record_type = $2"
		args = append(args, recordType)
	}
	query += " ORDER BY created_at DESC"

	rows, err := db.Query(context.Background(), query, args...)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	var records []HealthRecord
	for rows.Next() {
		var r HealthRecord
		if err := rows.Scan(&r.ID, &r.PatientID, &r.RecordType, &r.Data, &r.DataHash, &r.CreatedAt); err != nil {
			continue
		}
		records = append(records, r)
	}

	return c.JSON(http.StatusOK, records)
}

// Analytics types
type RecordTypeStat struct {
	RecordType string `json:"record_type"`
	Count      int    `json:"count"`
}

type PatientRecordStat struct {
	PatientID string `json:"patient_id"`
	Name      string `json:"name"`
	Count     int    `json:"count"`
}

type StatsResponse struct {
	TotalPatients    int                 `json:"total_patients"`
	TotalRecords     int                 `json:"total_records"`
	RecordsByType    []RecordTypeStat    `json:"records_by_type"`
	RecordsByPatient []PatientRecordStat `json:"records_by_patient"`
	RecentRecords    int                 `json:"recent_records"`
	DiagnosisCounts  []DiagnosisStat     `json:"diagnosis_counts"`
}

type DiagnosisStat struct {
	Diagnosis string `json:"diagnosis"`
	Count     int    `json:"count"`
}

func getStats(c echo.Context) error {
	var stats StatsResponse

	// Total patients
	db.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM patients`).Scan(&stats.TotalPatients)

	// Total records
	db.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM health_records`).Scan(&stats.TotalRecords)

	// Recent records (last 7 days)
	db.QueryRow(context.Background(),
		`SELECT COUNT(*) FROM health_records WHERE created_at > NOW() - INTERVAL '7 days'`).Scan(&stats.RecentRecords)

	// Records by type
	rows, err := db.Query(context.Background(),
		`SELECT record_type, COUNT(*) as count FROM health_records GROUP BY record_type ORDER BY count DESC`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var stat RecordTypeStat
			if rows.Scan(&stat.RecordType, &stat.Count) == nil {
				stats.RecordsByType = append(stats.RecordsByType, stat)
			}
		}
	}

	// Records by patient (top 10)
	rows2, err := db.Query(context.Background(),
		`SELECT p.patient_id, p.name, COUNT(hr.id) as count 
		 FROM patients p 
		 LEFT JOIN health_records hr ON p.patient_id = hr.patient_id 
		 GROUP BY p.patient_id, p.name 
		 ORDER BY count DESC 
		 LIMIT 10`)
	if err == nil {
		defer rows2.Close()
		for rows2.Next() {
			var stat PatientRecordStat
			if rows2.Scan(&stat.PatientID, &stat.Name, &stat.Count) == nil {
				stats.RecordsByPatient = append(stats.RecordsByPatient, stat)
			}
		}
	}

	// Diagnosis counts (extract from diagnosis records)
	rows3, err := db.Query(context.Background(),
		`SELECT data->>'condition' as diagnosis, COUNT(*) as count 
		 FROM health_records 
		 WHERE record_type = 'diagnosis' AND data->>'condition' IS NOT NULL
		 GROUP BY data->>'condition' 
		 ORDER BY count DESC 
		 LIMIT 10`)
	if err == nil {
		defer rows3.Close()
		for rows3.Next() {
			var stat DiagnosisStat
			if rows3.Scan(&stat.Diagnosis, &stat.Count) == nil {
				stats.DiagnosisCounts = append(stats.DiagnosisCounts, stat)
			}
		}
	}

	return c.JSON(http.StatusOK, stats)
}
