import { Box, Text, Static } from "ink"

const ASCII_LOGO = `⣿⡿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⠿⢿⣿
⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿
⣿⡇⠀⠀⢰⣶⠀⠀⣶⡆⢰⣶⣶⣄⠀⠀⠀⠀⢸⣿
⣿⡇⠀⠀⢸⣿⠿⠿⣦⡀⠀⠀⢸⣿⠀⠀⠀⠀⢸⣿
⣿⡇⠀⠀⠸⠿⠀⠀⠿⠃⠘⠿⠿⠿⠿⠇⠀⠀⢸⣿
⣿⡇⠀⠀⢰⣶⠀⠀⣶⡄⠀⠀⣴⣶⣦⡀⠀⠀⢸⣿
⣿⡇⠀⠀⢸⣿⠀⠀⠀⠀⢰⣿⠁⠀⣿⡇⠀⠀⢸⣿
⣿⡇⠀⠀⠘⠿⠿⠿⠿⠇⠈⠻⠿⠿⠀⠀⠀⠀⢸⣿
⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿
⣿⣷⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣾⣿`

const BIG_TEXT = ` █████   ████  ███  ████                █████████               █████
░░███   ███░  ░░░  ░░███               ███░░░░░███             ░░███
 ░███  ███    ████  ░███   ██████     ███     ░░░   ██████   ███████   ██████
 ░███████    ░░███  ░███  ███░░███   ░███          ███░░███ ███░░███  ███░░███
 ░███░░███    ░███  ░███ ░███ ░███   ░███         ░███ ░███░███ ░███ ░███████
 ░███ ░░███   ░███  ░███ ░███ ░███   ░░███     ███░███ ░███░███ ░███ ░███░░░
 █████ ░░████ █████ █████░░██████     ░░█████████ ░░██████ ░░████████░░██████
░░░░░   ░░░░ ░░░░░ ░░░░░  ░░░░░░       ░░░░░░░░░   ░░░░░░   ░░░░░░░░  ░░░░░░ `

const brandYellow = "#F7F864"

export const Logo: React.FC = () => {
	return (
		<Box flexDirection="row" alignItems="center" gap={4}>
			<Box flexDirection="column">
				{ASCII_LOGO.split("\n").map((line, index) => (
					<Text key={index} color={brandYellow}>
						{line}
					</Text>
				))}
			</Box>
			<Box flexDirection="column">
				{BIG_TEXT.split("\n").map((line, index) => (
					<Text key={index} color={brandYellow}>
						{line}
					</Text>
				))}
			</Box>
		</Box>
	)
}

export function SplashScreen({ renderWelcomeMessage = true }: { renderWelcomeMessage?: boolean }) {
	return (
		<Static items={[1]}>
			{() => (
				<Box
					flexGrow={1}
					justifyContent="center"
					flexDirection="column"
					gap={2}
					marginLeft={2}
					marginTop={4}
					marginBottom={4}>
					<Logo />
					{renderWelcomeMessage && (
						<Box flexDirection="column">
							<Text color="gray">
								Type a message to start chatting, or use /help to see available commands.
							</Text>
							<Text color="gray">Commands start with / (e.g., /help, /mode, /clear)</Text>
						</Box>
					)}
				</Box>
			)}
		</Static>
	)
}
