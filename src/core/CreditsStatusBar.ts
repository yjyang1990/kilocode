import * as vscode from "vscode"
import { ClineProvider } from "./webview/ClineProvider"
import { BalanceDataResponsePayload } from "../shared/WebviewMessage"

export class CreditsStatusBar implements vscode.Disposable {
	private statusBarItem: vscode.StatusBarItem
	private refreshInterval?: NodeJS.Timeout
	private balanceHandlerDisposable?: vscode.Disposable
	private lastSuccessfulBalance?: number
	private lastSuccessfulTimestamp?: Date
	private previousBalance?: number
	private previousBalanceTimestamp?: Date
	private isRefreshing = false
	private readonly REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

	constructor(
		private context: vscode.ExtensionContext,
		private provider: ClineProvider,
	) {
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
	}

	async initialize(): Promise<void> {
		// Register the refresh command
		const refreshCommand = vscode.commands.registerCommand("kilo-code.refreshCredits", async () => {
			await this.refresh()
		})
		this.context.subscriptions.push(refreshCommand)

		// Set up click handler
		this.statusBarItem.command = "kilo-code.refreshCredits"

		// Register balance handler with provider
		this.balanceHandlerDisposable = this.provider.registerBalanceHandler((payload) => {
			this.updateStatusBar(payload)
		})

		// Start periodic refresh
		this.startPeriodicRefresh()

		// Initial refresh
		await this.refresh()
	}

	private startPeriodicRefresh(): void {
		this.refreshInterval = setInterval(async () => {
			await this.refresh()
		}, this.REFRESH_INTERVAL_MS)
	}

	private stopPeriodicRefresh(): void {
		if (this.refreshInterval) {
			clearInterval(this.refreshInterval)
			this.refreshInterval = undefined
		}
	}

	async refresh(): Promise<void> {
		if (this.isRefreshing) {
			return // Prevent concurrent refreshes
		}

		this.isRefreshing = true
		this.updateStatusBar({ success: false, isLoading: true })

		try {
			const result = await this.provider.fetchBalanceData()

			this.updateStatusBar(result)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.updateStatusBar({ success: false, error: errorMessage })
		} finally {
			this.isRefreshing = false
		}
	}

	private async updateStatusBar(payload: BalanceDataResponsePayload): Promise<void> {
		// Get the current state to check for token
		const { apiConfiguration } = await this.provider.getState()
		const hasToken = apiConfiguration?.kilocodeToken

		if (!hasToken) {
			this.statusBarItem.hide()
			return
		}

		// Handle loading state
		if (payload.isLoading) {
			this.statusBarItem.text = "$(sync~spin) Kilocode: Loading..."
			this.statusBarItem.tooltip = "Refreshing balance...\nClick to refresh"
			this.statusBarItem.backgroundColor = undefined
			this.statusBarItem.show()
			return
		}

		if (payload.success && payload.data?.balance !== undefined) {
			this.lastSuccessfulBalance = payload.data.balance
			this.lastSuccessfulTimestamp = new Date()

			const balance = payload.data.balance
			const compactBalance = this.formatBalance(balance)
			const fullBalance = this.formatBalance(balance, false)

			// Calculate consumption rate using PREVIOUS values BEFORE updating stored values
			let consumptionRate = ""
			if (this.lastSuccessfulBalance !== undefined && this.previousBalanceTimestamp && this.previousBalance) {
				// Use the PREVIOUS timestamp for calculation, not the new one we're about to set
				const timeDiffMs = Date.now() - this.previousBalanceTimestamp.getTime()
				const timeDiffHours = timeDiffMs / (1000 * 60 * 60)
				const balanceDiff = this.previousBalance - balance

				// Debug logging
				console.debug(
					`[CreditsStatusBar] Balance diff: ${balanceDiff}, Time diff: ${timeDiffHours.toFixed(12)}h`,
				)

				const ratePerHour = balanceDiff / timeDiffHours
				const rateFormatted = this.formatBalance(Math.abs(ratePerHour), false)

				if (!Number.isNaN(ratePerHour)) {
					consumptionRate = `$${rateFormatted}/hour`
					console.debug(`[CreditsStatusBar] Showing consumption rate: $${rateFormatted}/hr`)
				}
			}

			// Store current values as previous for next calculation
			this.previousBalance = this.lastSuccessfulBalance
			this.previousBalanceTimestamp = this.lastSuccessfulTimestamp

			this.statusBarItem.text = `$(symbol-dollar) Kilocode: $${compactBalance} @ ${consumptionRate}`
			this.statusBarItem.tooltip = `Kilocode balance: $${fullBalance}\nLast updated: ${this.lastSuccessfulTimestamp.toLocaleString()}\n${consumptionRate}\nClick to refresh`
			this.statusBarItem.backgroundColor = undefined
		} else {
			const error = payload.error || "Unknown error"

			// Handle rate limiting
			if (error.includes("429") || error.includes("rate limit")) {
				this.statusBarItem.text = "$(warning) Kilocode: rate limited"
				this.statusBarItem.tooltip = `Rate limited. ${error}\nLast successful: ${this.lastSuccessfulTimestamp?.toLocaleString() || "never"}\nClick to retry`
				this.statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground")
			} else {
				// Handle other errors
				const lastSuccessful = this.lastSuccessfulTimestamp
					? `Last successful: ${this.lastSuccessfulTimestamp.toLocaleString()}`
					: "No successful fetch yet"

				this.statusBarItem.text = "$(error) Kilocode: error"
				this.statusBarItem.tooltip = `Failed to fetch balance: ${error}\n${lastSuccessful}\nClick to retry`
				this.statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground")
			}
		}

		this.statusBarItem.show()
	}

	private formatBalance(balance: number, compact: boolean = true): string {
		// Clamp negative balances to 0 for display
		const clampedBalance = Math.max(0, balance)

		if (compact) {
			// Use compact notation for status bar (1.2k, 1.2M)
			return new Intl.NumberFormat(undefined, {
				maximumFractionDigits: 1,
				notation: "compact",
			}).format(clampedBalance)
		} else {
			// Use full notation for tooltip
			return new Intl.NumberFormat(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(clampedBalance)
		}
	}

	dispose(): void {
		this.stopPeriodicRefresh()
		this.balanceHandlerDisposable?.dispose()
		this.statusBarItem.dispose()
	}
}
