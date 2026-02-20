/**
 * VanguardHealth Mock Data Seeder
 * Generates 50 patients with diverse health records
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:50051';

// Thai first names
const thaiFirstNames = [
    'สมชาย', 'สมหญิง', 'วิชัย', 'วิภา', 'ประเสริฐ', 'ประภา', 'สุชาติ', 'สุภาพร',
    'อนันต์', 'อรุณ', 'พิชัย', 'พิมพ์', 'ชัยวัฒน์', 'ชุติมา', 'ธนากร', 'ธนิดา',
    'กิตติ', 'กมลา', 'ณัฐพล', 'ณัฐธิดา', 'ภาณุวัฒน์', 'ภัทรา', 'ศักดิ์ชัย', 'ศิริพร',
    'อภิชาติ', 'อภิญญา', 'วรพล', 'วราภรณ์', 'ปิยะ', 'ปิยนุช', 'เกรียงศักดิ์', 'เกศรินทร์',
    'มานะ', 'มณี', 'บุญมี', 'บุญมา', 'สมศักดิ์', 'สมใจ', 'ไพโรจน์', 'ไพลิน',
    'ชาญชัย', 'ชาลิสา', 'ธวัชชัย', 'ธัญญา', 'นิรันดร์', 'นิภา', 'พงษ์ศักดิ์', 'พรทิพย์',
    'ราเชนทร์', 'รุ่งนภา'
];

// Thai last names
const thaiLastNames = [
    'สุขใจ', 'มั่นคง', 'ศรีสุข', 'วงศ์ไพศาล', 'พิทักษ์', 'สว่างจิต', 'เจริญสุข', 'รุ่งเรือง',
    'สถาพร', 'ประสิทธิ์', 'มงคล', 'ชัยชนะ', 'ศิริวัฒน์', 'พัฒนา', 'อุดม', 'สมบูรณ์',
    'เกษม', 'วิไล', 'ศรีโสภา', 'ทองดี', 'แก้วมณี', 'พลอยงาม', 'รักษ์ไทย', 'เพชรดี',
    'ธรรมรักษ์', 'บุญส่ง', 'ศรีทอง', 'วิเชียร', 'ชูศรี', 'ประเสริฐสุข'
];

// Diagnoses with ICD-10 codes
const diagnoses = [
    { condition: 'Essential Hypertension', icd10: 'I10', severity: 'moderate' },
    { condition: 'Type 2 Diabetes Mellitus', icd10: 'E11', severity: 'moderate' },
    { condition: 'Hyperlipidemia', icd10: 'E78.5', severity: 'mild' },
    { condition: 'Coronary Artery Disease', icd10: 'I25.10', severity: 'severe' },
    { condition: 'Chronic Kidney Disease Stage 3', icd10: 'N18.3', severity: 'moderate' },
    { condition: 'Asthma', icd10: 'J45.20', severity: 'mild' },
    { condition: 'GERD', icd10: 'K21.0', severity: 'mild' },
    { condition: 'Osteoarthritis', icd10: 'M19.90', severity: 'moderate' },
    { condition: 'Major Depressive Disorder', icd10: 'F32.1', severity: 'moderate' },
    { condition: 'Anxiety Disorder', icd10: 'F41.1', severity: 'mild' },
    { condition: 'Hypothyroidism', icd10: 'E03.9', severity: 'mild' },
    { condition: 'Atrial Fibrillation', icd10: 'I48.91', severity: 'moderate' },
    { condition: 'Heart Failure', icd10: 'I50.9', severity: 'severe' },
    { condition: 'COPD', icd10: 'J44.9', severity: 'moderate' },
    { condition: 'Migraine', icd10: 'G43.909', severity: 'mild' }
];

// Medications
const medications = [
    { name: 'Metformin 500mg', dosage: '500mg twice daily', indication: 'Diabetes' },
    { name: 'Lisinopril 10mg', dosage: '10mg once daily', indication: 'Hypertension' },
    { name: 'Atorvastatin 20mg', dosage: '20mg at bedtime', indication: 'Hyperlipidemia' },
    { name: 'Aspirin 81mg', dosage: '81mg once daily', indication: 'Cardiovascular prevention' },
    { name: 'Omeprazole 20mg', dosage: '20mg before breakfast', indication: 'GERD' },
    { name: 'Amlodipine 5mg', dosage: '5mg once daily', indication: 'Hypertension' },
    { name: 'Metoprolol 25mg', dosage: '25mg twice daily', indication: 'Heart rate control' },
    { name: 'Levothyroxine 50mcg', dosage: '50mcg in the morning', indication: 'Hypothyroidism' },
    { name: 'Sertraline 50mg', dosage: '50mg once daily', indication: 'Depression/Anxiety' },
    { name: 'Gabapentin 300mg', dosage: '300mg three times daily', indication: 'Neuropathy' }
];

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear, endYear) {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function generatePatientId(index) {
    return `P${String(index).padStart(3, '0')}`;
}

function generateNationalId() {
    let id = '';
    for (let i = 0; i < 13; i++) {
        id += randomInt(0, 9);
    }
    return id;
}

// Generate vitals based on health conditions
function generateVitals(hasHypertension, hasDiabetes, age) {
    const baseHR = randomInt(60, 80);
    const baseSystolic = hasHypertension ? randomInt(140, 180) : randomInt(110, 130);
    const baseDiastolic = hasHypertension ? randomInt(90, 110) : randomInt(70, 85);
    const baseGlucose = hasDiabetes ? randomInt(140, 250) : randomInt(80, 110);

    return {
        blood_pressure: `${baseSystolic}/${baseDiastolic}`,
        heart_rate: baseHR + randomInt(-5, 10),
        temperature: randomFloat(36.2, 37.2, 1),
        respiratory_rate: randomInt(14, 20),
        oxygen_saturation: randomInt(95, 100),
        weight: randomFloat(50, 100, 1),
        height: randomFloat(150, 185, 0),
        glucose: baseGlucose
    };
}

// Generate lab results
function generateLabResults(hasHypertension, hasDiabetes, hasKidneyDisease, hasHighCholesterol) {
    return {
        hemoglobin: randomFloat(11.5, 16.5, 1),
        hematocrit: randomFloat(35, 50, 1),
        wbc: randomFloat(4.0, 11.0, 1),
        platelets: randomInt(150000, 400000),
        glucose: hasDiabetes ? randomInt(140, 280) : randomInt(70, 110),
        hba1c: hasDiabetes ? randomFloat(7.0, 10.5, 1) : randomFloat(4.5, 5.7, 1),
        creatinine: hasKidneyDisease ? randomFloat(1.5, 3.0, 2) : randomFloat(0.7, 1.2, 2),
        bun: hasKidneyDisease ? randomInt(25, 50) : randomInt(7, 20),
        egfr: hasKidneyDisease ? randomInt(30, 59) : randomInt(90, 120),
        total_cholesterol: hasHighCholesterol ? randomInt(220, 300) : randomInt(150, 200),
        ldl: hasHighCholesterol ? randomInt(130, 190) : randomInt(70, 100),
        hdl: randomInt(40, 70),
        triglycerides: hasHighCholesterol ? randomInt(200, 400) : randomInt(80, 150),
        ast: randomInt(10, 40),
        alt: randomInt(10, 40),
        sodium: randomInt(136, 145),
        potassium: randomFloat(3.5, 5.0, 1),
        tsh: randomFloat(0.5, 4.5, 2)
    };
}

// Generate a patient with records
async function generatePatient(index) {
    const patientId = generatePatientId(index);
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = randomElement(thaiFirstNames);
    const lastName = randomElement(thaiLastNames);
    const birthDate = randomDate(1950, 2005);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Determine conditions (older = more likely to have conditions)
    const conditionProbability = Math.min(0.8, (age - 20) / 60);
    const hasHypertension = Math.random() < conditionProbability * 0.6;
    const hasDiabetes = Math.random() < conditionProbability * 0.4;
    const hasKidneyDisease = Math.random() < conditionProbability * 0.2;
    const hasHighCholesterol = Math.random() < conditionProbability * 0.5;

    const patient = {
        patient_id: patientId,
        name: `${firstName} ${lastName}`,
        date_of_birth: formatDate(birthDate),
        gender: gender,
        national_id: generateNationalId()
    };

    // Create patient
    console.log(`Creating patient ${patientId}: ${patient.name} (Age: ${age})`);

    try {
        const response = await fetch(`${BACKEND_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient)
        });

        if (!response.ok) {
            const text = await response.text();
            console.log(`  ⚠️ Patient creation warning: ${text}`);
        }
    } catch (err) {
        console.log(`  ❌ Error creating patient: ${err.message}`);
    }

    // Generate 2-5 health records per patient
    const numRecords = randomInt(2, 5);

    for (let i = 0; i < numRecords; i++) {
        const recordDate = randomDate(2023, 2026);

        // Randomly choose record type
        const recordTypes = ['vitals', 'lab_result', 'diagnosis'];
        const recordType = randomElement(recordTypes);

        let data;

        switch (recordType) {
            case 'vitals':
                data = {
                    ...generateVitals(hasHypertension, hasDiabetes, age),
                    recorded_at: recordDate.toISOString(),
                    recorded_by: 'Dr. Smith'
                };
                break;

            case 'lab_result':
                data = {
                    ...generateLabResults(hasHypertension, hasDiabetes, hasKidneyDisease, hasHighCholesterol),
                    lab_date: formatDate(recordDate),
                    lab_name: 'Central Laboratory',
                    ordered_by: 'Dr. Johnson'
                };
                break;

            case 'diagnosis':
                const selectedDiagnoses = [];
                const numDiagnoses = randomInt(1, 3);

                if (hasHypertension) selectedDiagnoses.push(diagnoses[0]);
                if (hasDiabetes) selectedDiagnoses.push(diagnoses[1]);
                if (hasHighCholesterol) selectedDiagnoses.push(diagnoses[2]);

                while (selectedDiagnoses.length < numDiagnoses) {
                    const d = randomElement(diagnoses);
                    if (!selectedDiagnoses.includes(d)) selectedDiagnoses.push(d);
                }

                const primaryDiagnosis = selectedDiagnoses[0];
                const selectedMeds = [];
                const numMeds = randomInt(1, 4);
                for (let m = 0; m < numMeds; m++) {
                    const med = randomElement(medications);
                    if (!selectedMeds.includes(med)) selectedMeds.push(med);
                }

                data = {
                    condition: primaryDiagnosis.condition,
                    icd10_code: primaryDiagnosis.icd10,
                    severity: primaryDiagnosis.severity,
                    diagnosed_date: formatDate(recordDate),
                    diagnosed_by: 'Dr. ' + randomElement(['Smith', 'Johnson', 'Williams', 'Brown', 'Davis']),
                    secondary_diagnoses: selectedDiagnoses.slice(1).map(d => d.condition),
                    medications: selectedMeds,
                    notes: `Patient presents with ${primaryDiagnosis.condition}. Treatment plan initiated.`
                };
                break;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    record_type: recordType,
                    data: data
                })
            });

            if (response.ok) {
                console.log(`  ✅ Added ${recordType} record`);
            } else {
                console.log(`  ⚠️ Failed to add ${recordType} record`);
            }
        } catch (err) {
            console.log(`  ❌ Error adding record: ${err.message}`);
        }
    }

    return patient;
}

// Main seeding function
async function seedDatabase() {
    console.log('🌱 VanguardHealth Mock Data Seeder');
    console.log('===================================\n');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log('Generating 50 patients with diverse health data...\n');

    const patients = [];

    for (let i = 1; i <= 50; i++) {
        const patient = await generatePatient(i);
        patients.push(patient);

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n===================================');
    console.log('✅ Seeding complete!');
    console.log(`   Created ${patients.length} patients`);
    console.log('   Each patient has 2-5 health records');
    console.log('===================================\n');
}

// Run the seeder
seedDatabase().catch(console.error);
