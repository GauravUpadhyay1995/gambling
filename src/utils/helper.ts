// Helper: Validate email format
export function isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

// Helper: Validate mobile number (10-digit)
export function isValidMobile(mobile: string) {
    const regex = /^[6-9]\d{9}$/
    return regex.test(mobile)
}
