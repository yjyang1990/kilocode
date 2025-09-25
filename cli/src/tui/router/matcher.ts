import type { RouteParams, RouteMatch, QueryParams } from "./types.js"

export class RouteMatcher {
	static matchRoute(routePath: string, currentPath: string): RouteMatch | null {
		// Separate path from query string
		const [pathOnly, queryString] = currentPath.split("?", 2)
		const query = this.parseQueryString(queryString || "")

		// Ensure pathOnly is not undefined
		const cleanPath = pathOnly || "/"

		const { regex, keys } = this.compilePath(routePath)
		const match = cleanPath.match(regex)

		if (!match) return null

		const params: RouteParams = {}
		keys.forEach((key, index) => {
			params[key] = match[index + 1] || ""
		})

		return {
			path: currentPath,
			params,
			query,
			isExact: match[0] === cleanPath,
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

	static parseQueryString(queryString: string): QueryParams {
		const query: QueryParams = {}

		if (!queryString) return query

		const pairs = queryString.split("&")
		for (const pair of pairs) {
			const [key, value] = pair.split("=", 2)
			if (key) {
				query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ""
			}
		}

		return query
	}

	static buildQueryString(query: QueryParams): string {
		const pairs: string[] = []

		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined && value !== null && value !== "") {
				pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			}
		}

		return pairs.length > 0 ? `?${pairs.join("&")}` : ""
	}
}
