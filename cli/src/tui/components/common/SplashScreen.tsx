import React from "react"
import { Box } from "ink"
import { Text } from "./Text.js"
import BigText from "ink-big-text"
import Gradient from "ink-gradient"
import { FullScreenLayout } from "../layout/FullScreenLayout"

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

export const SplashScreen: React.FC = () => {
	return (
		<FullScreenLayout>
			<Box flexDirection="row" alignItems="center" justifyContent="center" height="100%">
				{/* ASCII Logo */}
				<Box flexDirection="column" marginRight={3}>
					{ASCII_LOGO.split("\n").map((line, index) => (
						<Gradient name="mind">
							<Text key={index}>{line}</Text>
						</Gradient>
					))}
				</Box>
				<Box>
					<Gradient name="mind">
						<BigText text="KiloCode" font="tiny" maxLength={4} />
					</Gradient>
				</Box>
			</Box>
		</FullScreenLayout>
	)
}
