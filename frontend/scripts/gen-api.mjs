import { codegen } from 'swagger-axios-codegen'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFAULT_OPENAPI_URL = 'http://localhost:8000/openapi.json'
const OUTPUT_DIR = resolve(__dirname, '../src/api/generated')
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'index.ts')

function readArg(name) {
  const inlineArg = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  if (inlineArg) return inlineArg.slice(name.length + 3)

  const index = process.argv.indexOf(`--${name}`)
  if (index >= 0) return process.argv[index + 1]

  return ''
}

function getOpenApiUrl() {
  return (
    readArg('url') ||
    readArg('input') ||
    process.env.OPENAPI_URL ||
    process.env.SWAGGER_URL ||
    DEFAULT_OPENAPI_URL
  )
}

async function loadOpenApiDocument(openApiUrl) {
  if (!/^https?:\/\//i.test(openApiUrl)) {
    return openApiUrl
  }

  const response = await fetch(openApiUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI document: ${response.status} ${response.statusText}`)
  }

  const document = await response.json()

  if (document.openapi?.startsWith('3.1.')) {
    document.openapi = '3.0.3'
  }

  return document
}

function writeEmptyClient() {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  writeFileSync(
    OUTPUT_FILE,
    [
      'import type { AxiosInstance } from "axios";',
      '',
      'export interface ServiceOptions {',
      '  axios?: AxiosInstance;',
      '}',
      '',
      'export const serviceOptions: ServiceOptions = {};',
      '',
    ].join('\n'),
  )
}

async function main() {
  const openApiUrl = getOpenApiUrl()

  console.log('')
  console.log('Swagger axios client generation')
  console.log(`Input : ${openApiUrl}`)
  console.log(`Output: ${OUTPUT_FILE}`)
  console.log('')

  rmSync(OUTPUT_DIR, { recursive: true, force: true })
  mkdirSync(OUTPUT_DIR, { recursive: true })

  try {
    const source = await loadOpenApiDocument(openApiUrl)

    codegen({
      source,
      outputDir: OUTPUT_DIR,
      fileName: 'index.ts',
      methodNameMode: 'operationId',
      useStaticMethod: true,
      useCustomerRequestInstance: true,
      modelMode: 'interface',
      strictNullChecks: true,
    })

    console.log('')
    console.log('Swagger axios client generated successfully.')
    console.log('')
  } catch (error) {
    writeEmptyClient()

    console.error('')
    console.error('Swagger axios client generation failed.')
    console.error(error instanceof Error ? error.message : error)
    console.error('')
    console.error('Check that the backend is running and the OpenAPI URL is correct.')
    console.error(`Default FastAPI URL: ${DEFAULT_OPENAPI_URL}`)
    console.error('')
    process.exit(1)
  }
}

main()
