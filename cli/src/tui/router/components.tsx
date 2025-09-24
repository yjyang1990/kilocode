import React from "react"
import { useRouter } from "./RouterContext.js"
import { RouteMatcher } from "./matcher.js"

interface RouteProps {
	path: string
	component: React.ComponentType<any>
	exact?: boolean
}

interface RoutesProps {
	children: React.ReactNode
}

interface NavigateProps {
	to: string
	replace?: boolean
}

export const Routes: React.FC<RoutesProps> = ({ children }) => {
	const { currentPath, updateParams } = useRouter() as any

	const routes = React.Children.toArray(children).filter(
		(child) => React.isValidElement(child) && child.type === Route,
	) as React.ReactElement<RouteProps>[]

	// Use useEffect to update params only when currentPath changes
	const [matchedRoute, setMatchedRoute] = React.useState<{
		component: React.ComponentType<any>
		params: any
	} | null>(null)

	React.useEffect(() => {
		for (const route of routes) {
			const match = RouteMatcher.matchRoute(route.props.path, currentPath)
			if (match && (route.props.exact ? match.isExact : true)) {
				// Update params in context
				updateParams(match.params)
				setMatchedRoute({
					component: route.props.component,
					params: match.params,
				})
				return
			}
		}
		// No route matched
		setMatchedRoute(null)
	}, [currentPath, updateParams])

	if (matchedRoute) {
		const Component = matchedRoute.component
		return <Component {...matchedRoute.params} />
	}

	// No route matched, render nothing or redirect to default
	return null
}

export const Route: React.FC<RouteProps> = () => {
	// This component is used declaratively and doesn't render anything itself
	return null
}

export const Navigate: React.FC<NavigateProps> = ({ to, replace }) => {
	const { navigate } = useRouter()

	React.useEffect(() => {
		const options = replace ? { replace } : undefined
		navigate(to, options)
	}, [to, replace, navigate])

	return null
}
