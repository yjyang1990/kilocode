/**
 * Terminal capability detection utilities
 * Detects support for Kitty keyboard protocol and other advanced features
 */

import { logs } from "../../services/logs"

/**
 * Detect terminal type from environment variables
 */
export function detectTerminalType(): string {
	const term = process.env.TERM || ""
	const termProgram = process.env.TERM_PROGRAM || ""

	if (termProgram.includes("iTerm")) return "iterm2"
	if (termProgram.includes("Apple_Terminal")) return "terminal.app"
	if (termProgram.includes("vscode")) return "vscode"
	if (termProgram.includes("ghostty")) return "ghostty"
	if (term.includes("kitty")) return "kitty"
	if (term.includes("alacritty")) return "alacritty"
	if (term.includes("wezterm")) return "wezterm"
	if (term.includes("xterm")) return "xterm"

	return "unknown"
}

/**
 * Check if terminal supports Kitty protocol
 * Partially copied from gemini-cli
 */
let kittyDetected = false
let kittySupported = false
let kittyEnabled = false

export async function detectKittyProtocolSupport(): Promise<boolean> {
	if (kittyDetected) {
		return kittySupported
	}

	return new Promise((resolve) => {
		if (!process.stdin.isTTY || !process.stdout.isTTY) {
			kittyDetected = true
			resolve(false)
			return
		}

		const originalRawMode = process.stdin.isRaw
		if (!originalRawMode) {
			process.stdin.setRawMode(true)
		}

		let responseBuffer = ""
		let progressiveEnhancementReceived = false
		let timeoutId: NodeJS.Timeout | undefined

		const onTimeout = () => {
			timeoutId = undefined
			process.stdin.removeListener("data", handleData)
			if (!originalRawMode) {
				process.stdin.setRawMode(false)
			}
			kittyDetected = true
			resolve(false)
		}

		const handleData = (data: Buffer) => {
			if (timeoutId === undefined) {
				// Race condition. We have already timed out.
				return
			}
			responseBuffer += data.toString()

			// Check for progressive enhancement response (CSI ? <flags> u)
			if (responseBuffer.includes("\x1b[?") && responseBuffer.includes("u")) {
				progressiveEnhancementReceived = true
				// Give more time to get the full set of kitty responses if we have an
				// indication the terminal probably supports kitty and we just need to
				// wait a bit longer for a response.
				clearTimeout(timeoutId)
				timeoutId = setTimeout(onTimeout, 1000)
			}

			// Check for device attributes response (CSI ? <attrs> c)
			if (responseBuffer.includes("\x1b[?") && responseBuffer.includes("c")) {
				clearTimeout(timeoutId)
				timeoutId = undefined
				process.stdin.removeListener("data", handleData)

				if (!originalRawMode) {
					process.stdin.setRawMode(false)
				}

				if (progressiveEnhancementReceived) {
					kittySupported = true
				}

				kittyDetected = true
				resolve(kittySupported)
			}
		}

		process.stdin.on("data", handleData)

		// Send queries
		process.stdout.write("\x1b[?u") // Query progressive enhancement
		process.stdout.write("\x1b[c") // Query device attributes

		// Timeout after 200ms
		// When a iterm2 terminal does not have focus this can take over 90s on a
		// fast macbook so we need a somewhat longer threshold than would be ideal.
		timeoutId = setTimeout(onTimeout, 200)
	})
}

/**
 * Auto-detect and enable Kitty protocol if supported
 * Returns true if enabled, false otherwise
 */
export async function autoEnableKittyProtocol(): Promise<boolean> {
	// Query terminal for actual support
	const isSupported = await detectKittyProtocolSupport()

	if (isSupported && !kittyEnabled) {
		// Enable Kitty keyboard protocol
		// CSI > 1 u - Enable disambiguate escape codes
		process.stdout.write("\x1b[>1u")
		// CSI = 1 ; 1 u - Push keyboard flags, enable disambiguate
		process.stdout.write("\x1b[=1;1u")
		kittyEnabled = true

		process.on("exit", disableKittyProtocol)
		process.on("SIGTERM", disableKittyProtocol)
		kittyEnabled = true
		return true
	}

	return false
}

/**
 * Disable Kitty keyboard protocol
 */
export function disableKittyProtocol(): void {
	if (kittyEnabled) {
		process.stdout.write("\x1b[<u")
		kittyEnabled = false
	}
}
