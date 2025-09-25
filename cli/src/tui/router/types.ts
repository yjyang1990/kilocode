export interface RouteParams {
	[key: string]: string
}

export interface QueryParams {
	[key: string]: string
}

export interface RouteMatch {
	path: string
	params: RouteParams
	query: QueryParams
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
	query: QueryParams
}

export interface NavigateOptions {
	replace?: boolean
	state?: any
}

export interface RouterContextValue {
	currentPath: string
	lastPath: string
	params: RouteParams
	query: QueryParams
	navigate: (path: string, options?: NavigateOptions) => void
	goBack: () => void
	canGoBack: boolean
	history: string[]
}
