/**
 * Kilocode utility functions shared across the codebase
 */

/**
 * Get the base URI for Kilocode API from the JWT token
 * @param kilocodeToken - The Kilocode JWT token
 * @returns The base URI for the Kilocode API
 */
export function getKiloBaseUriFromToken(kilocodeToken?: string): string {
	if (kilocodeToken) {
		try {
			const parts = kilocodeToken.split(".")
			if (parts.length < 2) return "https://api.kilocode.ai"
			const payload_string = parts[1]
			if (!payload_string) return "https://api.kilocode.ai"
			const payload_json =
				typeof atob !== "undefined" ? atob(payload_string) : Buffer.from(payload_string, "base64").toString()
			const payload = JSON.parse(payload_json)
			// Note: this is UNTRUSTED, so we need to make sure we're OK with this being manipulated by an attacker
			// e.g. we should not read URIs from the JWT directly
			if (payload.env === "development") return "http://localhost:3000"
		} catch (_error) {
			console.warn("Failed to get base URL from Kilo Code token")
		}
	}
	return "https://api.kilocode.ai"
}

/**
 * Check if the Kilocode account has a positive balance
 * @param kilocodeToken - The Kilocode JWT token
 * @returns Promise<boolean> - True if balance > 0, false otherwise
 */
export async function checkKilocodeBalance(kilocodeToken: string): Promise<boolean> {
	try {
		const baseUrl = getKiloBaseUriFromToken(kilocodeToken)

		const response = await fetch(`${baseUrl}/api/profile/balance`, {
			headers: {
				Authorization: `Bearer ${kilocodeToken}`,
			},
		})

		if (!response.ok) {
			return false
		}

		const data = await response.json()
		const balance = data.data?.balance ?? 0
		return balance > 0
	} catch (error) {
		console.error("Error checking kilocode balance:", error)
		return false
	}
}
