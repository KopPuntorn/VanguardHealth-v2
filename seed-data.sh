#!/bin/bash
# Seed sample data for VanguardHealth v2

BACKEND_URL="http://localhost:50051"

echo "🌱 Seeding sample data for VanguardHealth..."
echo ""

# Create patients
echo "📋 Creating patients..."

curl -s -X POST "$BACKEND_URL/patients" -H "Content-Type: application/json" -d '{"patient_id": "P001", "name": "สมชาย ใจดี", "date_of_birth": "1975-03-15", "gender": "Male"}' > /dev/null
curl -s -X POST "$BACKEND_URL/patients" -H "Content-Type: application/json" -d '{"patient_id": "P002", "name": "สมหญิง รักสุขภาพ", "date_of_birth": "1982-07-22", "gender": "Female"}' > /dev/null
curl -s -X POST "$BACKEND_URL/patients" -H "Content-Type: application/json" -d '{"patient_id": "P003", "name": "วิชัย แข็งแรง", "date_of_birth": "1990-01-10", "gender": "Male"}' > /dev/null
curl -s -X POST "$BACKEND_URL/patients" -H "Content-Type: application/json" -d '{"patient_id": "P004", "name": "มาลี สดใส", "date_of_birth": "1968-11-30", "gender": "Female"}' > /dev/null
curl -s -X POST "$BACKEND_URL/patients" -H "Content-Type: application/json" -d '{"patient_id": "P005", "name": "ประยุทธ์ สุขใจ", "date_of_birth": "1955-05-05", "gender": "Male"}' > /dev/null

echo "✅ Created 5 patients"
echo ""

# Add health records for P001
echo "📊 Adding records for P001 (สมชาย ใจดี - Hypertension patient)..."

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P001",
  "record_type": "vitals",
  "data": {"blood_pressure": "145/92", "heart_rate": 88, "temperature": 36.8, "oxygen_saturation": 98, "weight_kg": 78}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P001",
  "record_type": "diagnosis",
  "data": {"condition": "Essential Hypertension", "icd10": "I10", "severity": "Stage 2", "notes": "Blood pressure consistently elevated above 140/90"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P001",
  "record_type": "medication",
  "data": {"name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "purpose": "Blood pressure control", "start_date": "2024-01-15"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P001",
  "record_type": "lab_results",
  "data": {"test": "Lipid Panel", "cholesterol_total": 220, "ldl": 145, "hdl": 45, "triglycerides": 180, "status": "Borderline High"}
}' > /dev/null

echo "✅ Added 4 records for P001"

# Add health records for P002
echo "📊 Adding records for P002 (สมหญิง รักสุขภาพ - Diabetes patient)..."

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P002",
  "record_type": "vitals",
  "data": {"blood_pressure": "125/80", "heart_rate": 72, "temperature": 36.5, "oxygen_saturation": 99, "weight_kg": 65, "fasting_glucose": 145}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P002",
  "record_type": "diagnosis",
  "data": {"condition": "Type 2 Diabetes Mellitus", "icd10": "E11", "severity": "Well-controlled", "hba1c": 7.2, "notes": "Diet controlled with medication support"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P002",
  "record_type": "medication",
  "data": {"name": "Metformin", "dosage": "500mg", "frequency": "Twice daily", "purpose": "Blood sugar control", "start_date": "2023-06-01"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P002",
  "record_type": "clinical_visit",
  "data": {"chief_complaint": "Follow-up for diabetes management", "assessment": "Blood sugar levels improving", "plan": "Continue current medication, recheck HbA1c in 3 months"}
}' > /dev/null

echo "✅ Added 4 records for P002"

# Add health records for P003
echo "📊 Adding records for P003 (วิชัย แข็งแรง - Healthy individual)..."

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P003",
  "record_type": "vitals",
  "data": {"blood_pressure": "118/75", "heart_rate": 65, "temperature": 36.6, "oxygen_saturation": 99, "weight_kg": 72, "bmi": 23.5}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P003",
  "record_type": "clinical_visit",
  "data": {"chief_complaint": "Annual health checkup", "assessment": "Healthy individual, no abnormalities", "plan": "Continue healthy lifestyle, return in 1 year"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P003",
  "record_type": "lab_results",
  "data": {"test": "Complete Blood Count", "hemoglobin": 14.5, "wbc": 7000, "platelets": 250000, "status": "Normal"}
}' > /dev/null

echo "✅ Added 3 records for P003"

# Add health records for P004
echo "📊 Adding records for P004 (มาลี สดใส - Heart disease patient)..."

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P004",
  "record_type": "vitals",
  "data": {"blood_pressure": "135/85", "heart_rate": 78, "temperature": 36.7, "oxygen_saturation": 96, "weight_kg": 58}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P004",
  "record_type": "diagnosis",
  "data": {"condition": "Coronary Artery Disease", "icd10": "I25.10", "severity": "Stable", "notes": "History of stent placement 2022, ejection fraction 55%"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P004",
  "record_type": "medication",
  "data": [
    {"name": "Aspirin", "dosage": "81mg", "frequency": "Once daily"},
    {"name": "Atorvastatin", "dosage": "40mg", "frequency": "Once daily at bedtime"},
    {"name": "Metoprolol", "dosage": "25mg", "frequency": "Twice daily"}
  ]
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P004",
  "record_type": "lab_results",
  "data": {"test": "Cardiac Markers", "troponin": 0.01, "bnp": 85, "status": "Within normal limits"}
}' > /dev/null

echo "✅ Added 4 records for P004"

# Add health records for P005
echo "📊 Adding records for P005 (ประยุทธ์ สุขใจ - Multiple conditions)..."

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P005",
  "record_type": "vitals",
  "data": {"blood_pressure": "155/95", "heart_rate": 82, "temperature": 36.9, "oxygen_saturation": 95, "weight_kg": 85}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P005",
  "record_type": "diagnosis",
  "data": [
    {"condition": "Essential Hypertension", "icd10": "I10", "severity": "Uncontrolled"},
    {"condition": "Type 2 Diabetes", "icd10": "E11", "severity": "Moderate"},
    {"condition": "Chronic Kidney Disease Stage 3", "icd10": "N18.3", "notes": "eGFR 45"}
  ]
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P005",
  "record_type": "medication",
  "data": [
    {"name": "Lisinopril", "dosage": "20mg", "frequency": "Once daily"},
    {"name": "Metformin", "dosage": "1000mg", "frequency": "Twice daily"},
    {"name": "Furosemide", "dosage": "40mg", "frequency": "Once daily"}
  ]
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P005",
  "record_type": "lab_results",
  "data": {"test": "Kidney Function", "creatinine": 1.8, "bun": 35, "egfr": 45, "potassium": 5.1, "status": "Kidney function impaired"}
}' > /dev/null

curl -s -X POST "$BACKEND_URL/ingest" -H "Content-Type: application/json" -d '{
  "patient_id": "P005",
  "record_type": "clinical_visit",
  "data": {"chief_complaint": "Fatigue and swollen ankles", "assessment": "Fluid retention, adjust diuretic", "plan": "Increase Furosemide to 60mg, low salt diet, follow up in 2 weeks"}
}' > /dev/null

echo "✅ Added 5 records for P005"

echo ""
echo "=========================================="
echo "🎉 Sample data seeding complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - 5 Patients created"
echo "  - 20 Health records added"
echo ""
echo "Try these searches:"
echo '  - "ผู้ป่วยความดันสูง"'
echo '  - "diabetes medication"'
echo '  - "heart disease"'
echo '  - "kidney function"'
echo '  - "normal blood pressure"'
