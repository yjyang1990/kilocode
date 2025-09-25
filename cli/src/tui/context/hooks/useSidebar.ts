import { useAtom } from "jotai"
import { useApp } from "ink"
import { sidebarVisibleAtom } from "../../atoms/index.js"

/**
 * Hook to access and manage sidebar state
 * @returns Object with sidebar state and management functions
 */
export const useSidebar = () => {
	const [visible, setVisible] = useAtom(sidebarVisibleAtom)
	const { exit } = useApp()

	const toggle = () => {
		setVisible((prev) => !prev)
	}

	const close = () => {
		setVisible(false)
	}

	const handleSelect = (item: string) => {
		if (item === "exit") {
			exit()
		} else {
			close()
		}
	}

	return {
		visible,
		toggle,
		close,
		handleSelect,
	}
}
