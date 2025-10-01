import fs from "fs"
import path from "path"
import readline from "readline"

const APPROVALS_DIR = "approvals"

export interface ApprovalResult {
	approved: boolean
	newOutput: boolean
}

function getApprovalPath(category: string, testName: string, type: "approved" | "rejected"): string {
	const categoryDir = path.join(APPROVALS_DIR, category)
	const testDir = path.join(categoryDir, testName)
	return path.join(testDir, type)
}

function getNextFileNumber(dirPath: string, prefix: string): number {
	if (!fs.existsSync(dirPath)) {
		return 1
	}

	const files = fs.readdirSync(dirPath)
	const numbers = files
		.filter((f) => f.startsWith(`${prefix}.`) && f.endsWith(".txt"))
		.map((f) => {
			const match = f.match(new RegExp(`^${prefix}\\.(\\d+)\\.txt$`))
			return match ? parseInt(match[1], 10) : 0
		})

	return numbers.length > 0 ? Math.max(...numbers) + 1 : 1
}

function findMatchingFile(dirPath: string, content: string): string | null {
	if (!fs.existsSync(dirPath)) {
		return null
	}

	const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".txt"))

	for (const file of files) {
		const filePath = path.join(dirPath, file)
		const fileContent = fs.readFileSync(filePath, "utf-8")
		if (fileContent.trim() === content.trim()) {
			return file
		}
	}

	return null
}

async function askUserApproval(category: string, testName: string, input: string, output: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	return new Promise((resolve) => {
		console.log("\n" + "═".repeat(80))
		console.log(`\n🔍 New output detected for: ${category}/${testName}\n`)
		console.log("Input:")
		console.log(input.replace(/\n/g, "\\n"))
		console.log("\nOutput:")
		console.log(output.replace(/\n/g, "\\n"))
		console.log("\n" + "─".repeat(80))

		rl.question("\nIs this acceptable? (y/n): ", (answer) => {
			rl.close()
			resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
		})
	})
}

export async function checkApproval(
	category: string,
	testName: string,
	input: string,
	output: string,
): Promise<ApprovalResult> {
	const approvedDir = getApprovalPath(category, testName, "approved")
	const rejectedDir = getApprovalPath(category, testName, "rejected")

	const approvedMatch = findMatchingFile(approvedDir, output)
	if (approvedMatch) {
		return { approved: true, newOutput: false }
	}

	const rejectedMatch = findMatchingFile(rejectedDir, output)
	if (rejectedMatch) {
		return { approved: false, newOutput: false }
	}

	const isApproved = await askUserApproval(category, testName, input, output)

	const targetDir = isApproved ? approvedDir : rejectedDir
	const prefix = isApproved ? "approved" : "rejected"

	fs.mkdirSync(targetDir, { recursive: true })

	const nextNumber = getNextFileNumber(targetDir, prefix)
	const filename = `${prefix}.${nextNumber}.txt`
	const filePath = path.join(targetDir, filename)

	fs.writeFileSync(filePath, output, "utf-8")

	return { approved: isApproved, newOutput: true }
}
