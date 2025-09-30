import * as path from "path"
import { fileURLToPath } from "url"

export interface ExtensionPaths {
	extensionBundlePath: string // Path to extension.js
	extensionRootPath: string // Path to extension root
}

/**
 * Resolves extension paths for production CLI.
 * Assumes the extension is bundled in dist/kilocode/
 *
 * Production structure:
 * cli/dist/
 * ├── index.js
 * ├── cli/KiloCodeCLI.js
 * ├── host/ExtensionHost.js
 * ├── utils/extension-paths.js (this file)
 * └── kilocode/
 *     ├── dist/extension.js
 *     ├── assets/
 *     └── webview-ui/
 */
export function resolveExtensionPaths(): ExtensionPaths {
	// Get the directory where this compiled file is located
	const currentFile = fileURLToPath(import.meta.url)
	const currentDir = path.dirname(currentFile)

	// Navigate to dist directory (parent of utils/)
	const distDir = path.resolve(currentDir, "..")

	// Extension is in dist/kilocode/
	const extensionRootPath = path.join(distDir, "kilocode")
	const extensionBundlePath = path.join(extensionRootPath, "dist", "extension.js")

	return {
		extensionBundlePath,
		extensionRootPath,
	}
}
