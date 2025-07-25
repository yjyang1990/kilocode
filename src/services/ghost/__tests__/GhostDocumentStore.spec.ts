import * as vscode from "vscode"
import { GhostDocumentStore, GHOST_DOCUMENT_STORE_LIMITS } from "../GhostDocumentStore"

// Mock VSCode TextDocument
const createMockDocument = (uri: string, content: string): vscode.TextDocument =>
	({
		uri: vscode.Uri.parse(uri),
		fileName: uri,
		getText: vi.fn().mockReturnValue(content),
	}) as any

describe("GhostDocumentStore", () => {
	let store: GhostDocumentStore

	beforeEach(() => {
		store = new GhostDocumentStore()
	})

	test("should append to history for existing document", () => {
		const doc1 = createMockDocument("file:///test.ts", "console.log('hello')")
		const doc2 = createMockDocument("file:///test.ts", "console.log('world')")

		store.storeDocument(doc1)
		store.storeDocument(doc2)

		const stored = store.getDocument("file:///test.ts")
		expect(stored!.history).toHaveLength(2)
		expect(stored!.history[0]).toBe("console.log('hello')")
		expect(stored!.history[1]).toBe("console.log('world')")
	})

	test("should limit history to configured snapshots", () => {
		const uri = "file:///test.ts"
		const testCount = GHOST_DOCUMENT_STORE_LIMITS.MAX_HISTORY_PER_DOCUMENT + 5

		// Add more snapshots than the limit
		for (let i = 0; i < testCount; i++) {
			const doc = createMockDocument(uri, `content ${i}`)
			store.storeDocument(doc)
		}

		const stored = store.getDocument(uri)
		expect(stored!.history).toHaveLength(GHOST_DOCUMENT_STORE_LIMITS.MAX_HISTORY_PER_DOCUMENT)
		expect(stored!.history[0]).toBe("content 5") // First 5 should be removed
		expect(stored!.history[GHOST_DOCUMENT_STORE_LIMITS.MAX_HISTORY_PER_DOCUMENT - 1]).toBe(
			`content ${testCount - 1}`,
		)
	})

	test("should prevent unbounded document growth by removing oldest documents", () => {
		const testCount = GHOST_DOCUMENT_STORE_LIMITS.MAX_DOCUMENTS + 1

		// Add more documents than the limit
		for (let i = 0; i < testCount; i++) {
			const doc = createMockDocument(`file:///test${i}.ts`, `content ${i}`)
			store.storeDocument(doc)
		}

		// First document should be evicted, last should exist
		expect(store.getDocument("file:///test0.ts")).toBeUndefined()
		expect(store.getDocument(`file:///test${testCount - 1}.ts`)).toBeDefined()
	})

	test("should use LRU eviction - accessing a document keeps it from being evicted", () => {
		const nearLimit = GHOST_DOCUMENT_STORE_LIMITS.MAX_DOCUMENTS - 1

		// Add documents up to near the limit
		for (let i = 0; i < nearLimit; i++) {
			const doc = createMockDocument(`file:///test${i}.ts`, `content ${i}`)
			store.storeDocument(doc)
		}

		// Access the first document to make it recently used
		store.getDocument("file:///test0.ts")

		// Add 2 more documents to trigger eviction
		const doc1 = createMockDocument(`file:///test${nearLimit}.ts`, `content ${nearLimit}`)
		const doc2 = createMockDocument(`file:///test${nearLimit + 1}.ts`, `content ${nearLimit + 1}`)
		store.storeDocument(doc1)
		store.storeDocument(doc2)

		// test0.ts should still exist (recently accessed), test1.ts should be evicted
		expect(store.getDocument("file:///test0.ts")).toBeDefined()
		expect(store.getDocument("file:///test1.ts")).toBeUndefined()
		expect(store.getDocument(`file:///test${nearLimit + 1}.ts`)).toBeDefined()
	})
})
