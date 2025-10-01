import { CURSOR_MARKER } from "../services/ghost/ghostConstants.js"

interface CategoryTestCase {
	name: string
	input: string
	expectedPatterns: string[]
	description: string
}

export interface TestCase extends CategoryTestCase {
	category: string
}

export interface Category {
	name: string
	testCases: CategoryTestCase[]
}

export const categories: Category[] = [
	{
		name: "basic-syntax",
		testCases: [
			{
				name: "closing-brace",
				input: `function test() {
		console.log('hello')${CURSOR_MARKER}`,
				expectedPatterns: ["}", "\\n}"],
				description: "Should complete closing brace for function",
			},
			{
				name: "semicolon",
				input: `const x = 42${CURSOR_MARKER}`,
				expectedPatterns: [";"],
				description: "Should add semicolon after variable declaration",
			},
			{
				name: "closing-bracket",
				input: `const arr = [1, 2, 3${CURSOR_MARKER}`,
				expectedPatterns: ["]"],
				description: "Should complete closing bracket for array",
			},
			{
				name: "closing-parenthesis",
				input: `console.log('test'${CURSOR_MARKER}`,
				expectedPatterns: ["\\)"],
				description: "Should complete closing parenthesis for function call",
			},
		],
	},
	{
		name: "property-access",
		testCases: [
			{
				name: "property-access",
				input: `const obj = { name: 'test', value: 42 };
obj.${CURSOR_MARKER}`,
				expectedPatterns: ["name", "value"],
				description: "Should suggest object properties",
			},
		],
	},
	{
		name: "method-access",
		testCases: [
			{
				name: "array-method",
				input: `const arr = [1, 2, 3];
arr.${CURSOR_MARKER}`,
				expectedPatterns: ["map", "filter", "forEach", "push", "pop", "length"],
				description: "Should suggest array methods",
			},
			{
				name: "string-method",
				input: `const str = 'hello world';
str.${CURSOR_MARKER}`,
				expectedPatterns: ["substring", "charAt", "indexOf", "length", "toUpperCase", "toLowerCase"],
				description: "Should suggest string methods",
			},
		],
	},
	{
		name: "function-declaration",
		testCases: [
			{
				name: "function-body",
				input: `function calculateSum(a, b) ${CURSOR_MARKER}`,
				expectedPatterns: ["{", "{\\n", "{\\s*\\n\\s*return a \\+ b"],
				description: "Should complete function body opening",
			},
			{
				name: "arrow-function",
				input: `const add = (a, b) ${CURSOR_MARKER}`,
				expectedPatterns: ["=>", "=> {", "=> a \\+ b"],
				description: "Should complete arrow function syntax",
			},
		],
	},
	{
		name: "function-call",
		testCases: [
			{
				name: "function-call-args",
				input: `function greet(name) { return 'Hello ' + name; }
greet(${CURSOR_MARKER}`,
				expectedPatterns: ["\\)", "'", '"'],
				description: "Should suggest function call argument completion",
			},
		],
	},
	{
		name: "variable-assignment",
		testCases: [
			{
				name: "variable-assignment",
				input: `const userName = ${CURSOR_MARKER}`,
				expectedPatterns: ["'", '"', "null", "undefined"],
				description: "Should suggest common variable assignments",
			},
			{
				name: "array-declaration",
				input: `const numbers = ${CURSOR_MARKER}`,
				expectedPatterns: ["\\[", "\\[]"],
				description: "Should suggest array initialization",
			},
			{
				name: "object-declaration",
				input: `const config = ${CURSOR_MARKER}`,
				expectedPatterns: ["{", "{}", "{\\s*\\n"],
				description: "Should suggest object initialization",
			},
		],
	},
	{
		name: "import-statement",
		testCases: [
			{
				name: "import-from",
				input: `import { useState } from ${CURSOR_MARKER}`,
				expectedPatterns: ["'", '"', "'react'", '"react"'],
				description: "Should complete import module name",
			},
			{
				name: "import-curly-brace",
				input: `import ${CURSOR_MARKER} from 'react'`,
				expectedPatterns: ["{", "React", "\\* as"],
				description: "Should suggest import syntax options",
			},
		],
	},
	{
		name: "control-flow",
		testCases: [
			{
				name: "if-statement",
				input: `const x = 10;
if (x > 5) ${CURSOR_MARKER}`,
				expectedPatterns: ["{", "{\\n", "{\\s*\\n\\s*console.log"],
				description: "Should complete if statement body",
			},
			{
				name: "for-loop",
				input: `for (let i = 0; i < 10; i++) ${CURSOR_MARKER}`,
				expectedPatterns: ["{", "{\\n", "{\\s*\\n\\s*console.log"],
				description: "Should complete for loop body",
			},
			{
				name: "return-statement",
				input: `function getValue() {
		return ${CURSOR_MARKER}`,
				expectedPatterns: ["null", "undefined", "true", "false", "{", "\\["],
				description: "Should suggest return value completions",
			},
		],
	},
	{
		name: "complex",
		testCases: [
			{
				name: "chained-methods",
				input: `const result = [1, 2, 3]
		.map(x => x * 2)
		.${CURSOR_MARKER}`,
				expectedPatterns: ["filter", "reduce", "forEach", "map"],
				description: "Should suggest chained array methods",
			},
			{
				name: "nested-object",
				input: `const config = {
		server: {
		  port: 3000,
		  ${CURSOR_MARKER}`,
				expectedPatterns: ["host:", "hostname:", "}"],
				description: "Should suggest nested object properties",
			},
			{
				name: "async-await",
				input: `async function fetchData() {
		const response = await ${CURSOR_MARKER}`,
				expectedPatterns: ["fetch", "axios", "Promise"],
				description: "Should suggest async operations",
			},
		],
	},
]

export const testCases: TestCase[] = categories.flatMap((category) =>
	category.testCases.map((tc) => ({
		...tc,
		category: category.name,
	})),
)

export function getTestCasesByCategory(categoryName: string): TestCase[] {
	const category = categories.find((c) => c.name === categoryName)
	return category
		? category.testCases.map((tc) => ({
				...tc,
				category: category.name,
			}))
		: []
}

export function getCategories(): string[] {
	return categories.map((c) => c.name)
}
