import * as fs from "fs"
import * as path from "path"

// Basic VSCode API types and enums
export interface Thenable<T> extends Promise<T> {}

// VSCode EventEmitter implementation
export interface Disposable {
	dispose(): void
}

type Listener<T> = (e: T) => any

export class EventEmitter<T> {
	readonly #listeners = new Set<Listener<T>>()

	/**
	 * The event listeners can subscribe to.
	 */
	event = (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable => {
		const fn = thisArgs ? listener.bind(thisArgs) : listener
		this.#listeners.add(fn)
		const disposable = {
			dispose: () => {
				this.#listeners.delete(fn)
			},
		}

		if (disposables) {
			disposables.push(disposable)
		}

		return disposable
	}

	/**
	 * Notify all subscribers of the event. Failure
	 * of one or more listener will not fail this function call.
	 *
	 * @param data The event object.
	 */
	fire = (data: T): void => {
		for (const listener of this.#listeners) {
			try {
				listener(data)
			} catch {
				// ignore
			}
		}
	}

	/**
	 * Dispose this object and free resources.
	 */
	dispose = (): void => {
		this.#listeners.clear()
	}
}
export enum ConfigurationTarget {
	Global = 1,
	Workspace = 2,
	WorkspaceFolder = 3,
}

export enum ViewColumn {
	Active = -1,
	Beside = -2,
	One = 1,
	Two = 2,
	Three = 3,
}

export enum DiagnosticSeverity {
	Error = 0,
	Warning = 1,
	Information = 2,
	Hint = 3,
}

// Code Action Kind mock
export class CodeActionKind {
	static readonly Empty = new CodeActionKind("")
	static readonly QuickFix = new CodeActionKind("quickfix")
	static readonly Refactor = new CodeActionKind("refactor")
	static readonly RefactorExtract = new CodeActionKind("refactor.extract")
	static readonly RefactorInline = new CodeActionKind("refactor.inline")
	static readonly RefactorRewrite = new CodeActionKind("refactor.rewrite")
	static readonly Source = new CodeActionKind("source")
	static readonly SourceOrganizeImports = new CodeActionKind("source.organizeImports")

	constructor(public value: string) {}

	append(parts: string): CodeActionKind {
		return new CodeActionKind(this.value ? `${this.value}.${parts}` : parts)
	}

	intersects(other: CodeActionKind): boolean {
		return this.contains(other) || other.contains(this)
	}

	contains(other: CodeActionKind): boolean {
		return this.value === other.value || other.value.startsWith(this.value + ".")
	}
}

// Theme Color mock
export class ThemeColor {
	constructor(public id: string) {}
}

// Decoration Range Behavior mock
export enum DecorationRangeBehavior {
	OpenOpen = 0,
	ClosedClosed = 1,
	OpenClosed = 2,
	ClosedOpen = 3,
}

// Override Behavior mock
export enum OverviewRulerLane {
	Left = 1,
	Center = 2,
	Right = 4,
	Full = 7,
}

// URI class mock
export class Uri {
	public scheme: string
	public authority: string
	public path: string
	public query: string
	public fragment: string

	constructor(scheme: string, authority: string, path: string, query: string, fragment: string) {
		this.scheme = scheme
		this.authority = authority
		this.path = path
		this.query = query
		this.fragment = fragment
	}

	static file(path: string): Uri {
		return new Uri("file", "", path, "", "")
	}

	static parse(value: string): Uri {
		const url = new URL(value)
		return new Uri(url.protocol.slice(0, -1), url.hostname, url.pathname, url.search.slice(1), url.hash.slice(1))
	}

	static joinPath(base: Uri, ...pathSegments: string[]): Uri {
		const joinedPath = path.join(base.path, ...pathSegments)
		return new Uri(base.scheme, base.authority, joinedPath, base.query, base.fragment)
	}

	get fsPath(): string {
		return this.path
	}

	toString(): string {
		return `${this.scheme}://${this.authority}${this.path}${this.query ? "?" + this.query : ""}${this.fragment ? "#" + this.fragment : ""}`
	}
}

// Output Channel mock
export class OutputChannel implements Disposable {
	private _name: string

	constructor(name: string) {
		this._name = name
	}

	get name(): string {
		return this._name
	}

	append(value: string): void {
		console.log(`[${this._name}] ${value}`)
	}

	appendLine(value: string): void {
		console.log(`[${this._name}] ${value}`)
	}

	clear(): void {
		// No-op for CLI
	}

	show(): void {
		// No-op for CLI
	}

	hide(): void {
		// No-op for CLI
	}

	dispose(): void {
		// No-op for CLI
	}
}

// Extension Context mock
export class ExtensionContext {
	public subscriptions: Disposable[] = []
	public workspaceState: Memento
	public globalState: Memento & { setKeysForSync(keys: readonly string[]): void }
	public secrets: SecretStorage
	public extensionUri: Uri
	public extensionPath: string
	public environmentVariableCollection: any
	public storageUri: Uri | undefined
	public storagePath: string | undefined
	public globalStorageUri: Uri
	public globalStoragePath: string
	public logUri: Uri
	public logPath: string
	public extensionMode: number = 1 // Production

	constructor(extensionPath: string, workspacePath: string) {
		this.extensionPath = extensionPath
		this.extensionUri = Uri.file(extensionPath)

		// Setup storage paths
		const globalStoragePath = path.join(
			process.env.HOME || process.env.USERPROFILE || "/tmp",
			".kilocode-cli",
			"global-storage",
		)
		const workspaceStoragePath = path.join(workspacePath, ".kilocode-cli", "workspace-storage")
		const logPath = path.join(workspacePath, ".kilocode-cli", "logs")

		this.globalStoragePath = globalStoragePath
		this.globalStorageUri = Uri.file(globalStoragePath)
		this.storagePath = workspaceStoragePath
		this.storageUri = Uri.file(workspaceStoragePath)
		this.logPath = logPath
		this.logUri = Uri.file(logPath)

		// Ensure directories exist
		this.ensureDirectoryExists(globalStoragePath)
		this.ensureDirectoryExists(workspaceStoragePath)
		this.ensureDirectoryExists(logPath)

		// Initialize state storage
		this.workspaceState = new MemoryMemento(path.join(workspaceStoragePath, "workspace-state.json"))
		this.globalState = new MemoryMemento(path.join(globalStoragePath, "global-state.json")) as any
		this.globalState.setKeysForSync = () => {} // No-op for CLI

		this.secrets = new MockSecretStorage()
	}

	private ensureDirectoryExists(dirPath: string): void {
		try {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true })
			}
		} catch (error) {
			console.warn(`Failed to create directory ${dirPath}:`, error)
		}
	}
}

// Memento (state storage) implementation
export interface Memento {
	get<T>(key: string): T | undefined
	get<T>(key: string, defaultValue: T): T
	update(key: string, value: any): Thenable<void>
	keys(): readonly string[]
}

class MemoryMemento implements Memento {
	private data: Record<string, any> = {}
	private filePath: string

	constructor(filePath: string) {
		this.filePath = filePath
		this.loadFromFile()
	}

	private loadFromFile(): void {
		try {
			if (fs.existsSync(this.filePath)) {
				const content = fs.readFileSync(this.filePath, "utf-8")
				this.data = JSON.parse(content)
			}
		} catch (error) {
			console.warn(`Failed to load state from ${this.filePath}:`, error)
			this.data = {}
		}
	}

	private saveToFile(): void {
		try {
			fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
		} catch (error) {
			console.warn(`Failed to save state to ${this.filePath}:`, error)
		}
	}

	get<T>(key: string, defaultValue?: T): T | undefined {
		return this.data[key] !== undefined ? this.data[key] : defaultValue
	}

	async update(key: string, value: any): Promise<void> {
		if (value === undefined) {
			delete this.data[key]
		} else {
			this.data[key] = value
		}
		this.saveToFile()
	}

	keys(): readonly string[] {
		return Object.keys(this.data)
	}
}

// Secret Storage mock
export interface SecretStorage {
	get(key: string): Thenable<string | undefined>
	store(key: string, value: string): Thenable<void>
	delete(key: string): Thenable<void>
}

class MockSecretStorage implements SecretStorage {
	private secrets: Record<string, string> = {}
	private _onDidChange = new EventEmitter<any>()

	async get(key: string): Promise<string | undefined> {
		return this.secrets[key]
	}

	async store(key: string, value: string): Promise<void> {
		this.secrets[key] = value
		this._onDidChange.fire({ key })
	}

	async delete(key: string): Promise<void> {
		delete this.secrets[key]
		this._onDidChange.fire({ key })
	}

	get onDidChange() {
		return this._onDidChange.event
	}
}

// FileSystem API mock
export enum FileType {
	Unknown = 0,
	File = 1,
	Directory = 2,
	SymbolicLink = 64,
}

// FileSystemError class mock
export class FileSystemError extends Error {
	public code: string

	constructor(message: string, code: string = "Unknown") {
		super(message)
		this.name = "FileSystemError"
		this.code = code
	}

	static FileNotFound(messageOrUri?: string | Uri): FileSystemError {
		const message =
			typeof messageOrUri === "string" ? messageOrUri : `File not found: ${messageOrUri?.fsPath || "unknown"}`
		return new FileSystemError(message, "FileNotFound")
	}

	static FileExists(messageOrUri?: string | Uri): FileSystemError {
		const message =
			typeof messageOrUri === "string" ? messageOrUri : `File exists: ${messageOrUri?.fsPath || "unknown"}`
		return new FileSystemError(message, "FileExists")
	}

	static FileNotADirectory(messageOrUri?: string | Uri): FileSystemError {
		const message =
			typeof messageOrUri === "string"
				? messageOrUri
				: `File is not a directory: ${messageOrUri?.fsPath || "unknown"}`
		return new FileSystemError(message, "FileNotADirectory")
	}

	static FileIsADirectory(messageOrUri?: string | Uri): FileSystemError {
		const message =
			typeof messageOrUri === "string"
				? messageOrUri
				: `File is a directory: ${messageOrUri?.fsPath || "unknown"}`
		return new FileSystemError(message, "FileIsADirectory")
	}

	static NoPermissions(messageOrUri?: string | Uri): FileSystemError {
		const message =
			typeof messageOrUri === "string" ? messageOrUri : `No permissions: ${messageOrUri?.fsPath || "unknown"}`
		return new FileSystemError(message, "NoPermissions")
	}

	static Unavailable(messageOrUri?: string | Uri): FileSystemError {
		const message =
			typeof messageOrUri === "string" ? messageOrUri : `Unavailable: ${messageOrUri?.fsPath || "unknown"}`
		return new FileSystemError(message, "Unavailable")
	}
}

export interface FileStat {
	type: FileType
	ctime: number
	mtime: number
	size: number
}

export class FileSystemAPI {
	async stat(uri: Uri): Promise<FileStat> {
		try {
			const stats = fs.statSync(uri.fsPath)
			return {
				type: stats.isDirectory() ? FileType.Directory : FileType.File,
				ctime: stats.ctimeMs,
				mtime: stats.mtimeMs,
				size: stats.size,
			}
		} catch (error) {
			// If file doesn't exist, assume it's a file for CLI purposes
			return {
				type: FileType.File,
				ctime: Date.now(),
				mtime: Date.now(),
				size: 0,
			}
		}
	}

	async readFile(uri: Uri): Promise<Uint8Array> {
		try {
			const content = fs.readFileSync(uri.fsPath)
			return new Uint8Array(content)
		} catch (error) {
			throw new Error(`Failed to read file: ${uri.fsPath}`)
		}
	}

	async writeFile(uri: Uri, content: Uint8Array): Promise<void> {
		try {
			fs.writeFileSync(uri.fsPath, content)
		} catch (error) {
			throw new Error(`Failed to write file: ${uri.fsPath}`)
		}
	}
}

// Workspace API mock
export class WorkspaceAPI {
	public workspaceFolders: WorkspaceFolder[] | undefined
	public name: string | undefined
	public workspaceFile: Uri | undefined
	public fs: FileSystemAPI
	private _onDidChangeWorkspaceFolders = new EventEmitter<any>()

	constructor(workspacePath: string) {
		this.workspaceFolders = [
			{
				uri: Uri.file(workspacePath),
				name: path.basename(workspacePath),
				index: 0,
			},
		]
		this.name = path.basename(workspacePath)
		this.fs = new FileSystemAPI()
	}

	onDidChangeWorkspaceFolders(listener: (event: any) => void): Disposable {
		return this._onDidChangeWorkspaceFolders.event(listener)
	}

	onDidChangeConfiguration(listener: (event: any) => void): Disposable {
		// Create a mock configuration change event emitter
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	onDidChangeTextDocument(listener: (event: any) => void): Disposable {
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	onDidOpenTextDocument(listener: (event: any) => void): Disposable {
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	onDidCloseTextDocument(listener: (event: any) => void): Disposable {
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	getConfiguration(section?: string): WorkspaceConfiguration {
		return new MockWorkspaceConfiguration(section)
	}

	findFiles(include: string, exclude?: string): Thenable<Uri[]> {
		// Basic implementation - could be enhanced with glob patterns
		return Promise.resolve([])
	}

	openTextDocument(uri: Uri): Thenable<any> {
		return Promise.resolve({
			uri,
			fileName: uri.fsPath,
			getText: () => {
				try {
					return fs.readFileSync(uri.fsPath, "utf-8")
				} catch {
					return ""
				}
			},
		})
	}

	createFileSystemWatcher(
		globPattern: any,
		ignoreCreateEvents?: boolean,
		ignoreChangeEvents?: boolean,
		ignoreDeleteEvents?: boolean,
	): any {
		return {
			onDidChange: () => ({ dispose: () => {} }),
			onDidCreate: () => ({ dispose: () => {} }),
			onDidDelete: () => ({ dispose: () => {} }),
			dispose: () => {},
		}
	}

	registerTextDocumentContentProvider(scheme: string, provider: any): Disposable {
		return { dispose: () => {} }
	}
}

export interface WorkspaceFolder {
	uri: Uri
	name: string
	index: number
}

export interface WorkspaceConfiguration {
	get<T>(section: string): T | undefined
	get<T>(section: string, defaultValue: T): T
	has(section: string): boolean
	inspect<T>(section: string): any
	update(section: string, value: any, configurationTarget?: ConfigurationTarget): Thenable<void>
}

class MockWorkspaceConfiguration implements WorkspaceConfiguration {
	private section: string | undefined

	constructor(section?: string) {
		this.section = section
	}

	get<T>(section: string, defaultValue?: T): T | undefined {
		// Return default values for common configurations
		const fullSection = this.section ? `${this.section}.${section}` : section

		// Add common configuration defaults here
		const defaults: Record<string, any> = {
			"kilo-code.allowedCommands": ["git log", "git diff", "git show"],
			"kilo-code.deniedCommands": [],
			"kilo-code.commandExecutionTimeout": 0,
		}

		return defaults[fullSection] !== undefined ? defaults[fullSection] : defaultValue
	}

	has(section: string): boolean {
		return false // Simplified implementation
	}

	inspect<T>(section: string): any {
		return undefined // Simplified implementation
	}

	async update(section: string, value: any, configurationTarget?: ConfigurationTarget): Promise<void> {
		// No-op for CLI
	}
}

// Text Editor Decoration Type mock
export class TextEditorDecorationType implements Disposable {
	public key: string

	constructor(key: string) {
		this.key = key
	}

	dispose(): void {
		// No-op for CLI
	}
}

// Tab and TabGroup interfaces for VSCode API
export interface Tab {
	input: TabInputText | any
	label: string
	isActive: boolean
	isDirty: boolean
}

export interface TabInputText {
	uri: Uri
}

export interface TabGroup {
	tabs: Tab[]
}

// TabGroups API mock
export class TabGroupsAPI {
	private _onDidChangeTabs = new EventEmitter<void>()
	private _tabGroups: TabGroup[] = []

	get all(): TabGroup[] {
		return this._tabGroups
	}

	onDidChangeTabs(listener: () => void): Disposable {
		return this._onDidChangeTabs.event(listener)
	}

	async close(tab: Tab): Promise<boolean> {
		// Find and remove the tab from all groups
		for (const group of this._tabGroups) {
			const index = group.tabs.indexOf(tab)
			if (index !== -1) {
				group.tabs.splice(index, 1)
				this._onDidChangeTabs.fire()
				return true
			}
		}
		return false
	}

	// Internal method to simulate tab changes for CLI
	_simulateTabChange(): void {
		this._onDidChangeTabs.fire()
	}

	dispose(): void {
		this._onDidChangeTabs.dispose()
	}
}

// Window API mock
export class WindowAPI {
	public tabGroups: TabGroupsAPI

	constructor() {
		this.tabGroups = new TabGroupsAPI()
	}

	createOutputChannel(name: string): OutputChannel {
		return new OutputChannel(name)
	}

	createTextEditorDecorationType(options: any): TextEditorDecorationType {
		return new TextEditorDecorationType(`decoration-${Date.now()}`)
	}

	showInformationMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		console.log(`[INFO] ${message}`)
		return Promise.resolve(undefined)
	}

	showWarningMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		console.warn(`[WARN] ${message}`)
		return Promise.resolve(undefined)
	}

	showErrorMessage(message: string, ...items: string[]): Thenable<string | undefined> {
		console.error(`[ERROR] ${message}`)
		return Promise.resolve(undefined)
	}

	showQuickPick(items: string[], options?: any): Thenable<string | undefined> {
		// Return first item for CLI
		return Promise.resolve(items[0])
	}

	showInputBox(options?: any): Thenable<string | undefined> {
		// Return empty string for CLI
		return Promise.resolve("")
	}

	showOpenDialog(options?: any): Thenable<Uri[] | undefined> {
		// Return empty array for CLI
		return Promise.resolve([])
	}

	registerWebviewViewProvider(viewId: string, provider: any, options?: any): Disposable {
		// Store the provider for later use
		return {
			dispose: () => {},
		}
	}

	registerUriHandler(handler: any): Disposable {
		// Store the URI handler for later use
		return {
			dispose: () => {},
		}
	}

	onDidChangeTextEditorSelection(listener: (event: any) => void): Disposable {
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	onDidChangeActiveTextEditor(listener: (event: any) => void): Disposable {
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	onDidChangeVisibleTextEditors(listener: (event: any) => void): Disposable {
		const emitter = new EventEmitter<any>()
		return emitter.event(listener)
	}

	// Terminal event handlers
	onDidCloseTerminal(listener: (terminal: any) => void): Disposable {
		return { dispose: () => {} }
	}

	onDidOpenTerminal(listener: (terminal: any) => void): Disposable {
		return { dispose: () => {} }
	}

	onDidChangeActiveTerminal(listener: (terminal: any) => void): Disposable {
		return { dispose: () => {} }
	}

	onDidChangeTerminalDimensions(listener: (event: any) => void): Disposable {
		return { dispose: () => {} }
	}

	onDidWriteTerminalData(listener: (event: any) => void): Disposable {
		return { dispose: () => {} }
	}

	get activeTerminal(): any {
		return undefined
	}

	get terminals(): any[] {
		return []
	}
}

// Commands API mock
export class CommandsAPI {
	private commands: Map<string, (...args: any[]) => any> = new Map()

	registerCommand(command: string, callback: (...args: any[]) => any): Disposable {
		this.commands.set(command, callback)
		return {
			dispose: () => {
				this.commands.delete(command)
			},
		}
	}

	executeCommand<T = unknown>(command: string, ...rest: any[]): Thenable<T> {
		const handler = this.commands.get(command)
		if (handler) {
			try {
				const result = handler(...rest)
				return Promise.resolve(result)
			} catch (error) {
				return Promise.reject(error)
			}
		}

		// Handle built-in commands
		switch (command) {
			case "workbench.action.files.saveFiles":
			case "workbench.action.closeWindow":
			case "workbench.action.reloadWindow":
				return Promise.resolve(undefined as T)
			default:
				console.warn(`[Commands] Unknown command: ${command}`)
				return Promise.resolve(undefined as T)
		}
	}
}

// Environment mock
export const env = {
	appName: "wrapper|cli|cli|0.0.1",
	appRoot: process.cwd(),
	language: "en",
	machineId: "cli-machine-id",
	sessionId: "cli-session-id",
	remoteName: undefined,
	shell: process.env.SHELL || "/bin/bash",
}

// Main VSCode API mock
export function createVSCodeAPIMock(extensionPath: string, workspacePath: string) {
	const context = new ExtensionContext(extensionPath, workspacePath)
	const workspace = new WorkspaceAPI(workspacePath)
	const window = new WindowAPI()
	const commands = new CommandsAPI()

	return {
		version: "1.84.0",
		Uri,
		EventEmitter,
		ConfigurationTarget,
		ViewColumn,
		DiagnosticSeverity,
		CodeActionKind,
		ThemeColor,
		DecorationRangeBehavior,
		OverviewRulerLane,
		ExtensionContext,
		FileType,
		FileSystemError,
		TabInputText: class TabInputText {
			constructor(public uri: Uri) {}
		},
		workspace,
		window,
		commands,
		env,
		context,
		// Add more APIs as needed
		languages: {
			registerCodeActionsProvider: () => ({ dispose: () => {} }),
			registerCodeLensProvider: () => ({ dispose: () => {} }),
			registerCompletionItemProvider: () => ({ dispose: () => {} }),
			registerHoverProvider: () => ({ dispose: () => {} }),
			registerDefinitionProvider: () => ({ dispose: () => {} }),
			registerReferenceProvider: () => ({ dispose: () => {} }),
			registerDocumentSymbolProvider: () => ({ dispose: () => {} }),
			registerWorkspaceSymbolProvider: () => ({ dispose: () => {} }),
			registerRenameProvider: () => ({ dispose: () => {} }),
			registerDocumentFormattingEditProvider: () => ({ dispose: () => {} }),
			registerDocumentRangeFormattingEditProvider: () => ({ dispose: () => {} }),
			registerSignatureHelpProvider: () => ({ dispose: () => {} }),
		},
		debug: {
			onDidStartDebugSession: () => ({ dispose: () => {} }),
			onDidTerminateDebugSession: () => ({ dispose: () => {} }),
		},
		tasks: {
			onDidStartTask: () => ({ dispose: () => {} }),
			onDidEndTask: () => ({ dispose: () => {} }),
		},
		extensions: {
			all: [],
			getExtension: () => undefined,
			onDidChange: () => ({ dispose: () => {} }),
		},
		// Add file system watcher
		FileSystemWatcher: class {
			onDidChange = () => ({ dispose: () => {} })
			onDidCreate = () => ({ dispose: () => {} })
			onDidDelete = () => ({ dispose: () => {} })
			dispose = () => {}
		},
		// Add relative pattern
		RelativePattern: class {
			constructor(
				public base: any,
				public pattern: string,
			) {}
		},
		// Add progress location
		ProgressLocation: {
			SourceControl: 1,
			Window: 10,
			Notification: 15,
		},
		// Add URI handler
		UriHandler: class {
			handleUri = () => {}
		},
	}
}
