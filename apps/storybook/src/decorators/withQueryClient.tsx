import type { Decorator } from "@storybook/react-vite"
import { QueryClientProvider, queryClient } from "../../../../webview-ui/src/App"

// Decorator to provide QueryClient for all stories using the shared provider from webview-ui
export const withQueryClient: Decorator = (Story) => {
	return (
		<QueryClientProvider client={queryClient}>
			<Story />
		</QueryClientProvider>
	)
}
