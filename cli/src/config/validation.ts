import Ajv from "ajv"
import * as fs from "fs/promises"
import * as path from "path"
import { fileURLToPath } from "url"
import type { CLIConfig } from "./types.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let ajv: Ajv | null = null
let validateFunction: any = null

async function getValidator() {
	if (!validateFunction) {
		ajv = new Ajv({ allErrors: true, strict: false })
		const schemaPath = path.join(__dirname, "schema.json")
		const schemaContent = await fs.readFile(schemaPath, "utf-8")
		const schema = JSON.parse(schemaContent)
		validateFunction = ajv.compile(schema)
	}
	return validateFunction
}

export interface ValidationResult {
	valid: boolean
	errors?: string[]
}

export async function validateConfig(config: unknown): Promise<ValidationResult> {
	try {
		const validate = await getValidator()
		const valid = validate(config)

		if (!valid) {
			const errors = validate.errors?.map((err: any) => {
				const path = err.instancePath || "root"
				return `${path}: ${err.message}`
			})
			return { valid: false, errors }
		}

		return { valid: true }
	} catch (error) {
		return {
			valid: false,
			errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
		}
	}
}
