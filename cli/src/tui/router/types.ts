export interface RouteParams {
	[key: string]: string
}

export interface RouteMatch {
	path: string
	params: RouteParams
	isExact: boolean
}

export interface Route {
	path: string
	component: React.ComponentType<any>
	exact?: boolean
	children?: Route[]
}

export interface RouterState {
	currentPath: string
	history: string[]
	params: RouteParams
}

export interface NavigateOptions {
	replace?: boolean
	state?: any
}

export interface RouterContextValue {
	currentPath: string
	params: RouteParams
	navigate: (path: string, options?: NavigateOptions) => void
	goBack: () => void
	canGoBack: boolean
	history: string[]
}
