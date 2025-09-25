import React, { createContext, useContext, useState, useCallback } from "react"
import type { RouterContextValue, NavigateOptions, RouteParams, QueryParams } from "./types.js"
import { RouteMatcher } from "./matcher.js"

const RouterContext = createContext<RouterContextValue | null>(null)

export const RouterProvider: React.FC<{
	children: React.ReactNode
	initialPath?: string
}> = ({ children, initialPath = "/chat" }) => {
	const [currentPath, setCurrentPath] = useState(initialPath)
	const [lastPath, setLastPath] = useState(initialPath)
	const [history, setHistory] = useState<string[]>([initialPath])
	const [params, setParams] = useState<RouteParams>({})
	const [query, setQuery] = useState<QueryParams>({})

	const navigate = useCallback(
		(path: string, options?: NavigateOptions) => {
			if (options?.replace) {
				setHistory((prev) => [...prev.slice(0, -1), path])
			} else {
				setHistory((prev) => [...prev, path])
			}
			setLastPath(currentPath)
			setCurrentPath(path)
			// Params and query will be updated by the Routes component when it matches routes
		},
		[currentPath],
	)

	const goBack = useCallback(() => {
		if (history.length > 1) {
			const newHistory = history.slice(0, -1)
			const previousPath = newHistory[newHistory.length - 1]
			if (previousPath) {
				setHistory(newHistory)
				setLastPath(currentPath)
				setCurrentPath(previousPath)
			}
		}
	}, [history, currentPath])

	const updateParams = useCallback((newParams: RouteParams) => {
		setParams(newParams)
	}, [])

	const updateQuery = useCallback((newQuery: QueryParams) => {
		setQuery(newQuery)
	}, [])

	const contextValue: RouterContextValue & {
		updateParams: (params: RouteParams) => void
		updateQuery: (query: QueryParams) => void
	} = {
		currentPath,
		lastPath,
		params,
		query,
		navigate,
		goBack,
		canGoBack: history.length > 1,
		history,
		updateParams,
		updateQuery,
	}

	return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>
}

export const useRouter = (): RouterContextValue => {
	const context = useContext(RouterContext)
	if (!context) {
		throw new Error("useRouter must be used within a RouterProvider")
	}
	return context
}

export const useNavigate = () => {
	const { navigate } = useRouter()
	return navigate
}

export const useParams = () => {
	const { params } = useRouter()
	return params
}

export const useQuery = () => {
	const { query } = useRouter()
	return query
}

export const useCurrentPath = () => {
	const { currentPath } = useRouter()
	return currentPath
}

export const useLastPath = () => {
	const { lastPath } = useRouter()
	return lastPath
}

export const useHistory = () => {
	const { history } = useRouter()
	return history
}
