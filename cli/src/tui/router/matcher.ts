import type { RouteParams, RouteMatch } from "./types.js"

export class RouteMatcher {
	static matchRoute(routePath: string, currentPath: string): RouteMatch | null {
		const { regex, keys } = this.compilePath(routePath)
		const match = currentPath.match(regex)

		if (!match) return null

		const params: RouteParams = {}
		keys.forEach((key, index) => {
			params[key] = match[index + 1] || ""
		})

		return {
			path: currentPath,
			params,
			isExact: match[0] === currentPath,
		}
	}

	static compilePath(path: string): { regex: RegExp; keys: string[] } {
		const keys: string[] = []
		const pattern = path
			.replace(/\/:([^/]+)/g, (_, key) => {
				keys.push(key)
				return "/([^/]+)"
			})
			.replace(/\*/g, ".*")

		return {
			regex: new RegExp(`^${pattern}$`),
			keys,
		}
	}

	static extractParams(routePath: string, currentPath: string): RouteParams {
		const match = this.matchRoute(routePath, currentPath)
		return match ? match.params : {}
	}
}
