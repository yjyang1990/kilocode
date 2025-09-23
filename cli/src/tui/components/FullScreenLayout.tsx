import React, { useState, useEffect } from "react"
import { Box, useStdout } from "ink"

interface FullScreenLayoutProps {
	children: React.ReactNode
}

export const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({ children }) => {
	const { stdout } = useStdout()
	const [dimensions, setDimensions] = useState([stdout.columns || 80, stdout.rows || 24])

	useEffect(() => {
		const handler = () => setDimensions([stdout.columns || 80, stdout.rows || 24])
		stdout.on("resize", handler)
		return () => {
			stdout.off("resize", handler)
		}
	}, [stdout])

	const [columns, rows] = dimensions

	return (
		<Box width={columns || 80} height={rows || 24} flexDirection="column">
			{children}
		</Box>
	)
}
