import * as vscode from "vscode"
import { LRUCache } from "lru-cache"
import { GhostDocumentStoreItem } from "./types"

export const GHOST_DOCUMENT_STORE_LIMITS = {
	MAX_DOCUMENTS: 50, // Limit the number of documents to keep
	MAX_HISTORY_PER_DOCUMENT: 50, // Limit the number of snapshots per document to keep
} as const

export class GhostDocumentStore {
	private documentStore: LRUCache<string, GhostDocumentStoreItem>

	constructor() {
		this.documentStore = new LRUCache<string, GhostDocumentStoreItem>({
			max: GHOST_DOCUMENT_STORE_LIMITS.MAX_DOCUMENTS,
		})
	}

	public storeDocument(document: vscode.TextDocument): void {
		const uri = document.uri.toString()

		let item = this.documentStore.get(uri)
		if (!item) {
			item = { uri, document, history: [] }
			this.documentStore.set(uri, item)
		}

		item.history.push(document.getText())
		if (item.history.length > GHOST_DOCUMENT_STORE_LIMITS.MAX_HISTORY_PER_DOCUMENT) {
			item.history.shift() // Remove the oldest snapshot if we exceed the limit
		}
	}

	public getDocument(uri: string): GhostDocumentStoreItem | undefined {
		return this.documentStore.get(uri)
	}
}
