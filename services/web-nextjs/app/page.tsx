'use client'
import { useState, useRef, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface HealthRecord {
    id: string
    patient_id: string
    record_type: string
    data: any
    data_hash: string
    created_at: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:50051'
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:3001'

// Translations
const translations = {
    th: {
        // Common
        appName: 'VanguardHealth',
        appDesc: 'แพลตฟอร์มข้อมูลการแพทย์ที่ปลอดภัย',
        systemOnline: 'ระบบออนไลน์',
        refresh: 'รีเฟรช',
        patientId: 'รหัสผู้ป่วย',
        allPatients: 'ผู้ป่วยทั้งหมด',
        single: 'รายบุคคล',

        // Tabs
        tabDashboard: 'แดชบอร์ด',
        tabChat: 'AI Chat',
        tabSearch: 'ค้นหา',
        tabIngest: 'เพิ่มข้อมูล',
        tabTimeline: 'ไทม์ไลน์',

        // Dashboard
        analyticsDashboard: '📊 แดชบอร์ดวิเคราะห์',
        totalPatients: 'ผู้ป่วยทั้งหมด',
        totalRecords: 'บันทึกทั้งหมด',
        recent7Days: 'ล่าสุด (7 วัน)',
        recordTypes: 'ประเภทบันทึก',
        recordsByType: 'บันทึกตามประเภท',
        recordsByPatient: 'บันทึกตามผู้ป่วย',
        diagnosisBreakdown: '🏥 สรุปการวินิจฉัย',
        topPatients: 'ผู้ป่วยอันดับต้น',
        patients: 'ผู้ป่วย',
        records: 'บันทึก',
        noDataAvailable: 'ไม่มีข้อมูล',
        loadingStats: 'กำลังโหลดสถิติ...',
        noStatsAvailable: 'ไม่มีสถิติ',
        aiQueries: 'การค้นหา AI',
        recentActivity: 'กิจกรรมล่าสุด',

        // Chat
        askAI: 'ถาม VanguardHealth AI...',
        send: 'ส่ง',
        aiWelcome: 'ถามฉันได้เลย เกี่ยวกับข้อมูลสุขภาพหรือรับข้อมูลเชิงลึกทางการแพทย์',
        aiError: 'ขออภัย เกิดข้อผิดพลาด กรุณาตรวจสอบว่า AI service ทำงานอยู่',

        // Search
        semanticSearch: '🔍 ค้นหาเชิงความหมาย',
        searchPlaceholder: 'ค้นหาด้วยภาษาธรรมชาติ เช่น "ผู้ป่วยความดันสูง"',
        search: 'ค้นหา',
        searching: 'กำลังค้นหา...',
        foundResults: 'พบผลลัพธ์',
        noResults: 'ไม่พบผลลัพธ์ ลองคำค้นหาอื่น',
        enterQuery: 'พิมพ์คำค้นหาเพื่อหาบันทึกสุขภาพที่เกี่ยวข้อง',
        semanticNote: 'ใช้ความคล้ายคลึงเชิงความหมาย - ไม่จำเป็นต้องตรงคำ!',
        similarity: 'ความคล้าย',

        // Ingest
        inputHealthData: '📥 เพิ่มข้อมูลสุขภาพ',
        recordType: 'ประเภทบันทึก',
        form: 'ฟอร์ม',
        json: 'JSON',
        loadSample: 'โหลดตัวอย่าง',
        submit: 'บันทึกข้อมูล',
        success: 'สำเร็จ',

        // Timeline
        patientTimeline: '📅 ไทม์ไลน์ผู้ป่วย',
        noTimelineEvents: 'ไม่มีเหตุการณ์ในไทม์ไลน์',

        // Footer
        footerText: 'VanguardHealth v2 • แพลตฟอร์มข้อมูลการแพทย์ที่ปลอดภัย • สร้างด้วย 💙',
    },
    en: {
        // Common
        appName: 'VanguardHealth',
        appDesc: 'Secure Medical Data Platform',
        systemOnline: 'System Online',
        refresh: 'Refresh',
        patientId: 'Patient ID',
        allPatients: 'All Patients',
        single: 'Single',

        // Tabs
        tabDashboard: 'Dashboard',
        tabChat: 'AI Chat',
        tabSearch: 'Search',
        tabIngest: 'Input Data',
        tabTimeline: 'Timeline',

        // Dashboard
        analyticsDashboard: '📊 Analytics Dashboard',
        totalPatients: 'Total Patients',
        totalRecords: 'Total Records',
        recent7Days: 'Recent (7 days)',
        recordTypes: 'Record Types',
        recordsByType: 'Records by Type',
        recordsByPatient: 'Records by Patient',
        diagnosisBreakdown: '🏥 Diagnosis Breakdown',
        topPatients: 'Top Patients',
        patients: 'patients',
        records: 'records',
        noDataAvailable: 'No data available',
        loadingStats: 'Loading statistics...',
        noStatsAvailable: 'No statistics available',
        aiQueries: 'AI Queries',
        recentActivity: 'Recent Activity',

        // Chat
        askAI: 'Ask VanguardHealth AI...',
        send: 'Send',
        aiWelcome: 'Ask me anything about health data or get medical insights',
        aiError: 'Sorry, I encountered an error. Please make sure the AI service is running.',

        // Search
        semanticSearch: '🔍 Semantic Search',
        searchPlaceholder: 'Search with natural language, e.g. "high blood pressure patients"',
        search: 'Search',
        searching: 'Searching...',
        foundResults: 'Found results',
        noResults: 'No results found. Try a different query.',
        enterQuery: 'Enter a search query to find relevant health records',
        semanticNote: 'Uses semantic similarity - no exact match needed!',
        similarity: 'Similarity',

        // Ingest
        inputHealthData: '📥 Input Health Data',
        recordType: 'Record Type',
        form: 'Form',
        json: 'JSON',
        loadSample: 'Load Sample',
        submit: 'Submit Data',
        success: 'Success',

        // Timeline
        patientTimeline: '📅 Patient Timeline',
        noTimelineEvents: 'No timeline events for this patient',

        // Footer
        footerText: 'VanguardHealth v2 • Secure Medical Data Platform • Built with 💙',
    }
}

// Medical Insights Component
const MedicalInsightsCard = ({ patientId, records, locale, patientContext }: { patientId: string, records: any[], locale: string, patientContext: any }) => {
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const analyzeHealth = async () => {
        setLoading(true)
        try {
            // Simulate AI delay for demo if no real backend
            // In real app, call ${AI_URL}/chat
            const langInstruction = locale === 'th' ? 'Respond in Thai language.' : 'Respond in English language.'
            const prompt = `Analyze health records for patient ${patientId}: ${JSON.stringify(records.slice(0, 5))}. Identify trends and risks. ${langInstruction}`

            const response = await fetch(`${AI_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    patient_id: patientId,
                    patient_context: patientContext
                })
            })
            const data = await response.json()
            setAnalysis(data.reply || data.response)
        } catch (error) {
            setAnalysis("Unable to generate insights at this time.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-card p-6 relative overflow-hidden group hover-card animate-slide-up stagger-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                    {locale === 'th' ? 'วิเคราะห์สุขภาพอัจฉริยะ (AI)' : 'Medical AI Insights'}
                </h3>
            </div>

            <div className="min-h-[100px]">
                {!analysis && !loading && (
                    <div className="text-center py-6">
                        <p className="text-slate-400 mb-4 text-sm">
                            {locale === 'th'
                                ? 'กดปุ่มเพื่อเริ่มวิเคราะห์ความเสี่ยงและแนวโน้มสุขภาพ'
                                : 'Click to analyze health trends and risks based on recent records.'}
                        </p>
                        <button onClick={analyzeHealth} className="btn-primary flex items-center gap-2 mx-auto shadow-lg shadow-indigo-500/20">
                            <span>⚡</span>
                            {locale === 'th' ? 'เริ่มวิเคราะห์' : 'Analyze Health'}
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="space-y-3 py-4 animate-pulse">
                        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                        <div className="text-center text-xs text-indigo-300 mt-2">AI กำลังประมวลผล...</div>
                    </div>
                )}

                {analysis && (
                    <div className="prose prose-invert prose-sm max-w-none animate-slide-up bg-slate-800/50 p-4 rounded-xl border border-indigo-500/30">
                        <div className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                            {analysis}
                        </div>
                        <button onClick={analyzeHealth} className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            <span className="text-lg">↻</span> Re-analyze
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function VanguardDashboard() {
    // State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'ingest' | 'chat' | 'records' | 'search'>('dashboard')
    const [patientId, setPatientId] = useState('P001')
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState('')

    // Ingest form
    const [recordType, setRecordType] = useState('clinical_visit')
    const [inputMode, setInputMode] = useState<'form' | 'json'>('form')
    const [formData, setFormData] = useState({
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        diagnosis: '',
        medications: '',
        notes: '',
        // Lab Results
        test_type: 'Lipid Panel',
        hdl: '',
        ldl: '',
        triglycerides: '',
        total_cholesterol: '',
        fasting_blood_sugar: '',
        hba1c: '',
    })
    const [recordData, setRecordData] = useState('')
    const [ingestResult, setIngestResult] = useState<any>(null)

    // New Patient State
    const [isCreatingPatient, setIsCreatingPatient] = useState(false)
    const [newPatientData, setNewPatientData] = useState({
        patient_id: '',
        name: '',
        date_of_birth: '',
        gender: 'Male'
    })

    // Formatting helpersds
    const [records, setRecords] = useState<HealthRecord[]>([])

    // Search
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // All Patients Mode
    const [allPatientsMode, setAllPatientsMode] = useState(false)

    // Dashboard stats
    const [stats, setStats] = useState<any>(null)
    const [loadingStats, setLoadingStats] = useState(false)

    const CHART_COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    // i18n
    const [locale, setLocale] = useState<'th' | 'en'>('th')
    const t = (key: keyof typeof translations.th) => translations[locale][key]

    // Sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Patient Selector
    const [patients, setPatients] = useState<any[]>([])
    const [patientDropdownOpen, setPatientDropdownOpen] = useState(false)
    const [patientSearch, setPatientSearch] = useState('')

    const chatEndRef = useRef<HTMLDivElement>(null)

    const loadSampleData = () => {
        setFormData({
            blood_pressure: '128/82',
            heart_rate: '88',
            temperature: '37.2',
            diagnosis: 'Hypertension, Fatigue',
            medications: 'Amlodipine 5mg, Vitamin B Complex',
            notes: 'Patient reports feeling tired in the afternoons. BP slightly elevated.',
            // Lab Results Sample
            test_type: 'Lipid Panel',
            hdl: '45',
            ldl: '145',
            triglycerides: '180',
            total_cholesterol: '220',
            fasting_blood_sugar: '',
            hba1c: '',
        })
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Send chat message
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return

        const userMessage = inputMessage.trim()
        setInputMessage('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            // Include last 10 messages for conversation context
            const conversationHistory = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }))

            const response = await fetch(`${AI_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    session_id: sessionId || undefined,
                    patient_id: allPatientsMode ? undefined : patientId,
                    all_patients: allPatientsMode,
                    conversation_history: conversationHistory,
                    patient_context: !allPatientsMode && selectedPatient ? {
                        name: selectedPatient.name,
                        gender: selectedPatient.gender,
                        date_of_birth: selectedPatient.date_of_birth,
                        national_id: selectedPatient.national_id
                    } : undefined
                }),
            })

            const data = await response.json()

            if (data.session_id && !sessionId) {
                setSessionId(data.session_id)
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the AI service is running.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    // Create new patient
    const handleCreatePatient = async () => {
        if (!newPatientData.patient_id || !newPatientData.name) {
            alert('Please fill in Patient ID and Name')
            return
        }

        try {
            const response = await fetch(`${BACKEND_URL}/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPatientData),
            })

            if (response.ok) {
                // Refresh list
                await fetchPatients()
                // Select new patient
                setPatientId(newPatientData.patient_id)
                setPatientDropdownOpen(false)
                setIsCreatingPatient(false)
                setPatientSearch('')
                // Reset form
                setNewPatientData({ patient_id: '', name: '', date_of_birth: '', gender: 'Male' })
            } else {
                const err = await response.text()
                alert('Failed to create patient: ' + err)
            }
        } catch (error) {
            console.error(error)
            alert('Error creating patient')
        }
    }

    // Ingest health data
    const ingestData = async () => {
        try {
            let parsedData

            if (inputMode === 'form') {
                // Construct JSON based on record type
                if (recordType === 'vitals') {
                    parsedData = {
                        blood_pressure: formData.blood_pressure,
                        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : undefined,
                        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
                        notes: formData.notes
                    }
                } else if (recordType === 'lab_results') {
                    parsedData = {
                        test: formData.test_type,
                        hdl: formData.hdl ? parseInt(formData.hdl) : undefined,
                        ldl: formData.ldl ? parseInt(formData.ldl) : undefined,
                        triglycerides: formData.triglycerides ? parseInt(formData.triglycerides) : undefined,
                        cholesterol_total: formData.total_cholesterol ? parseInt(formData.total_cholesterol) : undefined,
                        fasting_blood_sugar: formData.fasting_blood_sugar ? parseInt(formData.fasting_blood_sugar) : undefined,
                        hba1c: formData.hba1c ? parseFloat(formData.hba1c) : undefined,
                        notes: formData.notes,
                        status: (formData.ldl && parseInt(formData.ldl) > 130) ? 'Borderline High' : 'Normal' // Simple logic
                    }
                } else {
                    // Clinical Visit
                    parsedData = {
                        diagnosis: formData.diagnosis.split(',').map(s => s.trim()).filter(Boolean),
                        medications: formData.medications.split(',').map(s => s.trim()).filter(Boolean),
                        notes: formData.notes
                    }
                }
            } else {
                try {
                    parsedData = JSON.parse(recordData)
                } catch {
                    parsedData = { raw: recordData }
                }
            }

            const response = await fetch(`${BACKEND_URL}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    record_type: recordType,
                    data: parsedData,
                }),
            })

            const result = await response.json()
            setIngestResult(result)

            if (result.status === 'success') {
                setRecordData('')
                if (inputMode === 'form') {
                    setFormData({
                        blood_pressure: '',
                        heart_rate: '',
                        temperature: '',
                        diagnosis: '',
                        medications: '',
                        notes: '',
                        test_type: 'Lipid Panel',
                        hdl: '',
                        ldl: '',
                        triglycerides: '',
                        total_cholesterol: '',
                        fasting_blood_sugar: '',
                        hba1c: '',
                    })
                }
            }
        } catch (error) {
            setIngestResult({ error: 'Failed to connect to backend' })
        }
    }

    // Fetch records
    const fetchRecords = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/records/${patientId}`)
            const data = await response.json()
            setRecords(data || [])
        } catch {
            setRecords([])
        }
    }

    // Semantic Search
    const searchRecords = async () => {
        if (!searchQuery.trim()) return
        setIsSearching(true)
        try {
            const response = await fetch(`${AI_URL}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: searchQuery,
                    patient_id: patientId || undefined,
                    limit: 20,
                }),
            })
            const data = await response.json()
            setSearchResults(data.results || [])
        } catch (err) {
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
        setLoadingStats(true)
        try {
            const response = await fetch(`${BACKEND_URL}/stats`)
            const data = await response.json()
            setStats(data)
        } catch {
            setStats(null)
        } finally {
            setLoadingStats(false)
        }
    }

    // Fetch patients list
    const fetchPatients = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/patients`)
            const data = await response.json()
            setPatients(data || [])
        } catch {
            setPatients([])
        }
    }

    // Get selected patient info
    const selectedPatient = patients.find(p => p.patient_id === patientId)

    // Filtered patients for search
    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.patient_id?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.national_id?.includes(patientSearch)
    )

    useEffect(() => {
        fetchPatients()
    }, [])

    useEffect(() => {
        if (activeTab === 'records') {
            fetchRecords()
        }
        if (activeTab === 'dashboard') {
            fetchStats()
        }
    }, [activeTab, patientId])

    return (
        <div className="min-h-screen flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 glass-card"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Sidebar */}
            <aside className={`sidebar fixed md:static w-64 h-screen p-4 flex flex-col transition-all duration-300 ${sidebarOpen ? 'left-0' : '-left-full md:left-0'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3 p-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-bold gradient-text">{t('appName')}</h1>
                        <p className="text-xs text-slate-500">{t('appDesc')}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'dashboard', label: t('tabDashboard'), icon: '📊' },
                        { id: 'chat', label: t('tabChat'), icon: '💬' },
                        { id: 'search', label: t('tabSearch'), icon: '🔍' },
                        { id: 'ingest', label: t('tabIngest'), icon: '📥' },
                        { id: 'records', label: t('tabTimeline'), icon: '📅' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                            className={`sidebar-item w-full ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Bottom Controls */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    {/* Language */}
                    <button
                        onClick={() => setLocale(locale === 'th' ? 'en' : 'th')}
                        className="sidebar-item w-full"
                    >
                        <span className="text-xl">{locale === 'th' ? '🇹🇭' : '🇺🇸'}</span>
                        <span>{locale === 'th' ? 'ภาษาไทย' : 'English'}</span>
                    </button>

                    {/* Status */}
                    <div className="flex items-center gap-2 p-3">
                        <div className="status-dot"></div>
                        <span className="text-sm text-slate-400">{t('systemOnline')}</span>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 ml-0 md:ml-0">
                {/* Top Bar */}
                <div className="glass-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">
                        {activeTab === 'dashboard' && t('analyticsDashboard')}
                        {activeTab === 'chat' && '💬 AI Chat'}
                        {activeTab === 'search' && t('semanticSearch')}
                        {activeTab === 'ingest' && t('inputHealthData')}
                        {activeTab === 'records' && t('patientTimeline')}
                    </h2>
                    <div className="flex items-center gap-3">
                        {/* All Patients Toggle */}
                        <button
                            onClick={() => setAllPatientsMode(!allPatientsMode)}
                            className={allPatientsMode ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                        >
                            {allPatientsMode ? `👥 ${t('allPatients')}` : `👤 ${t('single')}`}
                        </button>

                        {!allPatientsMode && (
                            <div className="relative">
                                <button
                                    onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
                                    className="flex items-center gap-2 btn-secondary text-sm min-w-[180px]"
                                >
                                    <span>👤</span>
                                    <span className="flex-1 text-left truncate max-w-[100px]">
                                        {selectedPatient ? selectedPatient.name : patientId}
                                    </span>
                                    <svg className={`w-4 h-4 transition-transform ${patientDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Patient Dropdown - Outside top bar for proper positioning */}
                {patientDropdownOpen && !allPatientsMode && (
                    <div className="glass-card p-3 mb-4 max-w-md">
                        {/* Search */}
                        <input
                            type="text"
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            placeholder={locale === 'th' ? '🔍 ค้นหาชื่อ, รหัส, เลขบัตร...' : '🔍 Search name, ID...'}
                            className="input-modern w-full text-sm mb-3"
                            autoFocus
                        />

                        {/* Patient List */}
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <button
                                        key={patient.patient_id}
                                        onClick={() => {
                                            setPatientId(patient.patient_id)
                                            setPatientDropdownOpen(false)
                                            setPatientSearch('')
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${patientId === patient.patient_id
                                            ? 'bg-indigo-500/20 border border-indigo-500'
                                            : 'hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">👤</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{patient.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">
                                                    {patient.patient_id}
                                                    {patient.national_id && ` • ${patient.national_id}`}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4">
                                    {locale === 'th' ? 'ไม่พบผู้ป่วย' : 'No patients found'}
                                </p>
                            )}

                        </div>

                        {/* Create New Patient Button */}
                        <div className="mt-3 pt-3 border-t border-slate-700">
                            <button
                                onClick={() => setIsCreatingPatient(true)}
                                className="w-full py-2 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <span>➕</span>
                                <span>{locale === 'th' ? 'สร้างผู้ป่วยใหม่' : 'Create New Patient'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Patient Modal */}
                {isCreatingPatient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="glass-card w-full max-w-md p-6 space-y-4">
                            <h3 className="text-xl font-bold text-white">
                                {locale === 'th' ? 'สร้างผู้ป่วยใหม่' : 'Create New Patient'}
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Patient ID <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="EX: P099"
                                        value={newPatientData.patient_id}
                                        onChange={e => setNewPatientData({ ...newPatientData, patient_id: e.target.value })}
                                        className="input-modern w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Full Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={newPatientData.name}
                                        onChange={e => setNewPatientData({ ...newPatientData, name: e.target.value })}
                                        className="input-modern w-full"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={newPatientData.date_of_birth}
                                            onChange={e => setNewPatientData({ ...newPatientData, date_of_birth: e.target.value })}
                                            className="input-modern w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">Gender</label>
                                        <select
                                            value={newPatientData.gender}
                                            onChange={e => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                                            className="input-modern w-full"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsCreatingPatient(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePatient}
                                    className="flex-1 btn-primary"
                                >
                                    Create Patient
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="glass-card p-6 min-h-[600px] fade-in">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-end">
                                <button
                                    onClick={fetchStats}
                                    className="btn-secondary"
                                >
                                    🔄 {t('refresh')}
                                </button>
                            </div>

                            {loadingStats ? (
                                <div className="text-center py-20 animate-pulse">
                                    <div className="text-6xl mb-4">🩺</div>
                                    <p className="text-slate-400">Loading health data...</p>
                                </div>
                            ) : stats ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column: Stats */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="stat-card cyan hover-card animate-slide-up stagger-1">
                                                <h3 className="text-slate-400 text-sm mb-1">{t('totalPatients')}</h3>
                                                <p className="text-3xl font-bold font-mono text-white">{stats.total_patients}</p>
                                            </div>
                                            <div className="stat-card green hover-card animate-slide-up stagger-2">
                                                <h3 className="text-slate-400 text-sm mb-1">{t('totalRecords')}</h3>
                                                <p className="text-3xl font-bold font-mono text-white">{stats.total_records}</p>
                                            </div>
                                            <div className="stat-card amber hover-card animate-slide-up stagger-3">
                                                <h3 className="text-slate-400 text-sm mb-1">{t('recent7Days')}</h3>
                                                <p className="text-3xl font-bold font-mono text-white">{stats.recent_records}</p>
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        {/* Charts Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 hover-card animate-slide-up stagger-4">
                                            {/* Pie Chart - Records by Type */}
                                            <div className="glass-card p-5">
                                                <h3 className="text-lg font-semibold mb-4">{t('recordsByType')}</h3>
                                                {stats.records_by_type?.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <PieChart>
                                                            <Pie
                                                                data={stats.records_by_type}
                                                                dataKey="count"
                                                                nameKey="record_type"
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={80}
                                                                label={({ name, value }: any) => `${name}: ${value}`}
                                                            >
                                                                {stats.records_by_type.map((entry: any, index: number) => (
                                                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <p className="text-slate-500 text-center py-10">{t('noDataAvailable')}</p>
                                                )}
                                            </div>

                                            {/* Bar Chart - Records by Patient */}
                                            <div className="glass-card p-5">
                                                <h3 className="text-lg font-semibold mb-4">{t('recordsByPatient')}</h3>
                                                {stats.records_by_patient?.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart data={stats.records_by_patient}>
                                                            <XAxis dataKey="patient_id" tick={{ fill: '#94a3b8' }} />
                                                            <YAxis tick={{ fill: '#94a3b8' }} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                                                labelStyle={{ color: '#fff' }}
                                                            />
                                                            <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <p className="text-slate-500 text-center py-10">{t('noDataAvailable')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Diagnosis Breakdown */}
                                        {stats.diagnosis_counts?.length > 0 && (
                                            <div className="glass-card p-5 hover-card animate-slide-up stagger-5">
                                                <h3 className="text-lg font-semibold mb-4">{t('diagnosisBreakdown')}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <BarChart data={stats.diagnosis_counts} layout="vertical">
                                                            <XAxis type="number" tick={{ fill: '#94a3b8' }} />
                                                            <YAxis type="category" dataKey="diagnosis" tick={{ fill: '#94a3b8' }} width={150} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                                                labelStyle={{ color: '#fff' }}
                                                            />
                                                            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                                                        {stats.diagnosis_counts.map((d: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl">🩺</span>
                                                                    <span className="font-medium text-sm">{d.diagnosis}</span>
                                                                </div>
                                                                <span className="text-red-400 font-bold text-sm">{d.count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: AI Insights */}
                                    <div className="space-y-6">
                                        <MedicalInsightsCard
                                            patientId={patientId}
                                            records={records}
                                            locale={locale}
                                            patientContext={!allPatientsMode && selectedPatient ? {
                                                name: selectedPatient.name,
                                                gender: selectedPatient.gender,
                                                date_of_birth: selectedPatient.date_of_birth,
                                                national_id: selectedPatient.national_id
                                            } : undefined}
                                        />

                                        {/* System Status */}
                                        <div className="glass-card p-6 hover-card animate-slide-up stagger-5">
                                            <h3 className="font-bold mb-4 text-sm text-slate-400">System Status</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span>Database</span>
                                                    <span className="text-green-400 flex items-center gap-1">● Online</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span>AI Engine</span>
                                                    <span className="text-green-400 flex items-center gap-1">● Active</span>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                                                    <div className="bg-indigo-500 h-1.5 rounded-full w-[98%] animate-pulse"></div>
                                                </div>
                                                <p className="text-xs text-right text-slate-500">Uptime: 99.9%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                                : (
                                    <div className="text-center py-20 text-slate-500">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p>No statistics available</p>
                                    </div>
                                )}
                        </div>
                    )
                    }

                    {/* AI Chat Tab */}
                    {
                        activeTab === 'chat' && (
                            <div className="h-[550px] flex flex-col">
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                    {messages.length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="text-6xl mb-4">🤖</div>
                                            <h3 className="text-xl font-semibold mb-2">VanguardHealth AI</h3>
                                            <p className="text-slate-400">Ask me anything about health data or get medical insights</p>
                                        </div>
                                    )}

                                    {messages.map((msg, i) => (
                                        <div key={i} className={`chat-message flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                                                : 'bg-slate-800 text-slate-200'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-800 rounded-2xl px-5 py-3 flex gap-1">
                                                <span className="loading-dot w-2 h-2 bg-slate-400 rounded-full"></span>
                                                <span className="loading-dot w-2 h-2 bg-slate-400 rounded-full"></span>
                                                <span className="loading-dot w-2 h-2 bg-slate-400 rounded-full"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Ask VanguardHealth AI..."
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    {/* Ingest Tab */}
                    {
                        activeTab === 'ingest' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Input Medical Data</h2>
                                    <div className="flex bg-slate-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setInputMode('form')}
                                            className={`px-3 py-1 text-sm rounded-md transition-all ${inputMode === 'form' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Form Input
                                        </button>
                                        <button
                                            onClick={() => setInputMode('json')}
                                            className={`px-3 py-1 text-sm rounded-md transition-all ${inputMode === 'json' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            Raw JSON
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Record Type</label>
                                            <select
                                                value={recordType}
                                                onChange={(e) => setRecordType(e.target.value)}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                                            >
                                                <option value="vitals">Vitals</option>
                                                <option value="clinical_visit">Clinical Visit</option>
                                                <option value="lab_results">Lab Results</option>
                                            </select>
                                        </div>

                                        {inputMode === 'form' ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {recordType === 'vitals' && (
                                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700 space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="text-sm font-medium text-sky-400">Vitals</h3>
                                                            <button onClick={loadSampleData} className="text-xs text-indigo-400 hover:text-indigo-300">Load Example</button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-xs text-slate-500">Blood Pressure</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="120/80"
                                                                    value={formData.blood_pressure}
                                                                    onChange={e => setFormData({ ...formData, blood_pressure: e.target.value })}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500">Heart Rate (bpm)</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="72"
                                                                    value={formData.heart_rate}
                                                                    onChange={e => setFormData({ ...formData, heart_rate: e.target.value })}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500">Temperature (°C)</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="37.0"
                                                                    value={formData.temperature}
                                                                    onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {recordType === 'clinical_visit' && (
                                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700 space-y-4">
                                                        <h3 className="text-sm font-medium text-purple-400">Clinical Info</h3>
                                                        <div>
                                                            <label className="text-xs text-slate-500">Diagnosis (comma separated)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Hypertension, Diabetes"
                                                                value={formData.diagnosis}
                                                                onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-500">Medications (comma separated)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Amlodipine 5mg, Metformin"
                                                                value={formData.medications}
                                                                onChange={e => setFormData({ ...formData, medications: e.target.value })}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {recordType === 'lab_results' && (
                                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700 space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-sm font-medium text-amber-400">Lab Results</h3>
                                                                <button onClick={loadSampleData} className="text-xs text-indigo-400 hover:text-indigo-300">Load Example</button>
                                                            </div>
                                                            <select
                                                                value={formData.test_type}
                                                                onChange={e => setFormData({ ...formData, test_type: e.target.value })}
                                                                className="bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 text-slate-300 focus:outline-none"
                                                            >
                                                                <option>Lipid Panel</option>
                                                                <option>Blood Sugar (Diabetes)</option>
                                                            </select>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            {formData.test_type === 'Lipid Panel' ? (
                                                                <>
                                                                    <div>
                                                                        <label className="text-xs text-slate-500">Total Cholesterol</label>
                                                                        <input type="number" placeholder="200" value={formData.total_cholesterol} onChange={e => setFormData({ ...formData, total_cholesterol: e.target.value })} className="input-modern w-full" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs text-slate-500">LDL (Bad)</label>
                                                                        <input type="number" placeholder="100" value={formData.ldl} onChange={e => setFormData({ ...formData, ldl: e.target.value })} className="input-modern w-full" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs text-slate-500">HDL (Good)</label>
                                                                        <input type="number" placeholder="50" value={formData.hdl} onChange={e => setFormData({ ...formData, hdl: e.target.value })} className="input-modern w-full" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs text-slate-500">Triglycerides</label>
                                                                        <input type="number" placeholder="150" value={formData.triglycerides} onChange={e => setFormData({ ...formData, triglycerides: e.target.value })} className="input-modern w-full" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div>
                                                                        <label className="text-xs text-slate-500">Fasting Blood Sugar</label>
                                                                        <input type="number" placeholder="90" value={formData.fasting_blood_sugar} onChange={e => setFormData({ ...formData, fasting_blood_sugar: e.target.value })} className="input-modern w-full" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-xs text-slate-500">HbA1c (%)</label>
                                                                        <input type="number" placeholder="5.7" value={formData.hba1c} onChange={e => setFormData({ ...formData, hba1c: e.target.value })} className="input-modern w-full" />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                                                    <h3 className="text-sm font-medium text-emerald-400 mb-2">Notes</h3>
                                                    <textarea
                                                        placeholder="Patient complaints, observations..."
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                        className="w-full h-20 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                                <label className="block text-slate-400 text-sm mb-2">Data (JSON or Text)</label>
                                                <textarea
                                                    value={recordData}
                                                    onChange={(e) => setRecordData(e.target.value)}
                                                    placeholder='{"blood_pressure": "120/80", "heart_rate": 72}'
                                                    className="w-full h-[400px] bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono text-sm"
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={ingestData}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group"
                                        >
                                            <span>🔐 Secure & Store</span>
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>

                                    <div className="glass rounded-xl p-6 h-fit sticky top-6">
                                        <h3 className="text-lg font-medium mb-4">Result</h3>
                                        {ingestResult ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-full ${ingestResult.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                    <span className="font-medium">{ingestResult.status || 'Error'}</span>
                                                </div>
                                                {ingestResult.data_hash && (
                                                    <div>
                                                        <p className="text-slate-400 text-sm mb-1">SHA-256 Hash:</p>
                                                        <code className="text-xs text-sky-400 break-all">{ingestResult.data_hash}</code>
                                                    </div>
                                                )}
                                                {ingestResult.record_id && (
                                                    <div>
                                                        <p className="text-slate-400 text-sm mb-1">Record ID:</p>
                                                        <code className="text-xs text-indigo-400">{ingestResult.record_id}</code>
                                                    </div>
                                                )}
                                                {ingestResult.error && (
                                                    <p className="text-red-400">{ingestResult.error}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500">Submit data to see results</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Search Tab */}
                    {
                        activeTab === 'search' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">🔍 Semantic Search</h2>

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchRecords()}
                                        placeholder="ค้นหาด้วยภาษาธรรมชาติ เช่น 'ผู้ป่วยความดันสูง' หรือ 'heart rate above normal'"
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                                    />
                                    <button
                                        onClick={searchRecords}
                                        disabled={isSearching}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isSearching ? '🔄 Searching...' : '🔍 Search'}
                                    </button>
                                </div>

                                {searchResults.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-slate-400 text-sm">Found {searchResults.length} results</p>
                                        {searchResults.map((result, i) => (
                                            <div key={i} className="glass rounded-xl p-4 border-l-4 border-purple-500">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                                            {result.record_type}
                                                        </span>
                                                        <span className="text-slate-500 text-xs">Patient: {result.patient_id}</span>
                                                    </div>
                                                    <span className="text-xs text-emerald-400">
                                                        Similarity: {(result.score * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300">{result.text_preview}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchQuery && !isSearching ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <p className="text-4xl mb-2">🔍</p>
                                        <p>No results found. Try a different query.</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-slate-500">
                                        <p className="text-4xl mb-2">✨</p>
                                        <p>Enter a search query to find relevant health records</p>
                                        <p className="text-xs mt-2">Uses semantic similarity - no exact match needed!</p>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* Timeline Tab (Records) */}
                    {
                        activeTab === 'records' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">📅 Patient Timeline: {patientId}</h2>
                                    <button
                                        onClick={fetchRecords}
                                        className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>

                                {records.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">
                                        <p className="text-5xl mb-4">📅</p>
                                        <p>No timeline events for this patient</p>
                                    </div>
                                ) : (
                                    <div className="relative pl-4">
                                        {/* Timeline line */}
                                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-500 via-purple-500 to-pink-500 opacity-30"></div>

                                        <div className="space-y-8">
                                            {records.map((record, index) => {
                                                const typeColors: Record<string, string> = {
                                                    vitals: 'bg-emerald-500',
                                                    clinical_visit: 'bg-sky-500',
                                                    lab_results: 'bg-amber-500',
                                                    diagnosis: 'bg-red-500',
                                                    medication: 'bg-purple-500',
                                                }
                                                const dotColor = typeColors[record.record_type] || 'bg-slate-500'

                                                return (
                                                    <div key={record.id} className="relative pl-16">
                                                        {/* Timeline dot */}
                                                        <div className={`absolute left-[23px] top-4 w-5 h-5 rounded-full ${dotColor} ring-4 ring-slate-900 z-10 shadow-lg shadow-${dotColor}/50`}></div>

                                                        {/* Card */}
                                                        <div className="glass-card p-5 hover:bg-slate-800/60 transition-all hover:scale-[1.01] hover:shadow-lg group">
                                                            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-700/50">
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <span className={`px-3 py-1 ${dotColor}/20 ${dotColor.replace('bg-', 'text-')} rounded-full text-xs font-bold uppercase tracking-wider`}>
                                                                            {record.record_type.replace(/_/g, ' ')}
                                                                        </span>
                                                                        <span className="text-slate-500 text-xs">•</span>
                                                                        <span className="text-slate-400 text-sm font-medium">
                                                                            {new Date(record.created_at).toLocaleDateString('th-TH', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <code className="text-[10px] text-slate-600 font-mono bg-slate-900/50 px-2 py-1 rounded">
                                                                        {record.data_hash.slice(0, 8)}
                                                                    </code>
                                                                </div>
                                                            </div>

                                                            {/* Formatted Data Display */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                                                {Object.entries(record.data).map(([key, value]) => (
                                                                    <div key={key} className="flex flex-col border-l-2 border-slate-700/50 pl-3">
                                                                        <span className="text-slate-500 text-[10px] uppercase tracking-widest mb-0.5">{key.replace(/_/g, ' ')}</span>
                                                                        <span className="text-slate-200 font-medium text-sm break-words">
                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 md:left-64 right-0 p-4 text-center text-slate-600 text-sm bg-transparent">
                <p>{t('footerText')}</p>
            </footer>
        </div>
    )
}
