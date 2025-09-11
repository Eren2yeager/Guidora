// Phone utilities and OTP helpers (Firebase-compatible)

// Generate 6-digit OTP (kept for potential server-side uses; Firebase handles OTP itself on client)
export function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate phone number format (basic validation)
export function validatePhoneNumber(phoneNumber) {
	// Remove all non-digit characters
	const cleaned = phoneNumber.replace(/\D/g, '');
	// Check if it's a valid length (10-15 digits)
	if (cleaned.length < 10 || cleaned.length > 15) {
		return false;
	}
	return true;
}

// Format phone number for storage (E.164 where possible)
export function formatPhoneNumber(phoneNumber) {
	const cleaned = phoneNumber.replace(/\D/g, '');
	// If it starts with country code (length > 10), assume it's complete
	if (cleaned.length > 10 && cleaned.startsWith('91')) {
		// Example for India; ensure leading '+'
		return `+${cleaned}`;
	}
	if (cleaned.startsWith('0') && cleaned.length === 11) {
		// Strip leading zero
		return `+91${cleaned.slice(1)}`;
	}
	// Default to India country code for this project
	if (cleaned.length === 10) {
		return `+91${cleaned}`;
	}
	// Fallback: add plus
	return `+${cleaned}`;
}

// NOTE: Firebase Phone Auth sends OTP from client using reCAPTCHA
// This module intentionally has no SMS-sending logic.
