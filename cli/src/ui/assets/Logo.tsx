import React from "react"
import { Box, Text } from "ink"
import BigText from "ink-big-text"
import Gradient from "ink-gradient"

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

export const Logo: React.FC = () => {
	return (
		<Box flexDirection="row" alignItems="flex-start" justifyContent="flex-start" marginTop={3} marginBottom={2}>
			<Box flexDirection="column" marginRight={3}>
				{ASCII_LOGO.split("\n").map((line, index) => (
					<Gradient key={index} name="mind">
						<Text>{line}</Text>
					</Gradient>
				))}
			</Box>
			<Box>
				<Gradient name="mind">
					<BigText text="KiloCode" font="tiny" maxLength={4} />
				</Gradient>
			</Box>
		</Box>
	)
}
