import { render, screen, fireEvent } from '@testing-library/react'
import VanguardDashboard from '../app/page'

// Mock fetch
global.fetch = jest.fn()

describe('VanguardDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    total_patients: 5,
                    total_records: 20,
                    recent_records: 10,
                    records_by_type: [
                        { record_type: 'vitals', count: 8 },
                        { record_type: 'diagnosis', count: 5 },
                    ],
                    records_by_patient: [
                        { patient_id: 'P001', name: 'Test Patient', count: 4 },
                    ],
                    diagnosis_counts: [],
                }),
            })
    })

    test('renders app name correctly', () => {
        render(<VanguardDashboard />)
        expect(screen.getByText('VanguardHealth')).toBeInTheDocument()
    })

    test('renders all tabs', () => {
        render(<VanguardDashboard />)
        // Thai locale by default
        expect(screen.getByText(/แดชบอร์ด/i)).toBeInTheDocument()
        expect(screen.getByText(/AI Chat/i)).toBeInTheDocument()
        expect(screen.getByText(/ค้นหา/i)).toBeInTheDocument()
    })

    test('language toggle switches between TH and EN', () => {
        render(<VanguardDashboard />)

        // Default is Thai
        expect(screen.getByText('🇹🇭 TH')).toBeInTheDocument()

        // Click to switch to English
        fireEvent.click(screen.getByText('🇹🇭 TH'))
        expect(screen.getByText('🇺🇸 EN')).toBeInTheDocument()

        // Verify English text appears
        expect(screen.getByText('System Online')).toBeInTheDocument()
    })

    test('dashboard tab is active by default', () => {
        render(<VanguardDashboard />)
        // Dashboard should be visible (Thai text)
        expect(screen.getByText(/แดชบอร์ดวิเคราะห์/i)).toBeInTheDocument()
    })

    test('all patients toggle works', () => {
        render(<VanguardDashboard />)

        // Default shows Patient ID input (Thai)
        expect(screen.getByText(/รหัสผู้ป่วย/i)).toBeInTheDocument()

        // Click to switch to all patients mode
        fireEvent.click(screen.getByText(/รายบุคคล/i))

        // Should show "All Patients" mode now (Thai)
        expect(screen.getByText(/ผู้ป่วยทั้งหมด/i)).toBeInTheDocument()
    })

    test('tab switching works', () => {
        render(<VanguardDashboard />)

        // Click on Chat tab
        fireEvent.click(screen.getByText(/AI Chat/i))

        // Should see chat input
        expect(screen.getByPlaceholderText(/ถาม VanguardHealth AI/i)).toBeInTheDocument()
    })
})
