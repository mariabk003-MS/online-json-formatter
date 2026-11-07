import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('./privacy-policy.html', import.meta.url)),
        jsonToCsv: fileURLToPath(new URL('./json-to-csv.html', import.meta.url)),
        about: fileURLToPath(new URL('./about.html', import.meta.url)),
        csvToJson: fileURLToPath(new URL('./csv-to-json.html', import.meta.url)),
        jsonValidator: fileURLToPath(new URL('./json-validator.html', import.meta.url)),
        jsonErrors: fileURLToPath(new URL('./common-json-errors.html', import.meta.url)),
        jsonViewer: fileURLToPath(new URL('./json-viewer.html', import.meta.url)),
        jsonToXml: fileURLToPath(new URL('./json-to-xml.html', import.meta.url)),
        whatIsJson: fileURLToPath(new URL('./what-is-json.html', import.meta.url)),
        howToOpenJson: fileURLToPath(new URL('./how-to-open-json-file.html', import.meta.url)),
        jsonVsXml: fileURLToPath(new URL('./json-vs-xml.html', import.meta.url)),
        jsonToExcel: fileURLToPath(new URL('./convert-json-to-excel.html', import.meta.url)),
        jsonCompare: fileURLToPath(new URL('./json-compare.html', import.meta.url)),
        jsonSorter: fileURLToPath(new URL('./json-sorter.html', import.meta.url)),
        jsonToTypescript: fileURLToPath(new URL('./json-to-typescript.html', import.meta.url)),
        xmlFormatter: fileURLToPath(new URL('./xml-formatter.html', import.meta.url)),
        yamlFormatter: fileURLToPath(new URL('./yaml-formatter.html', import.meta.url)),
        base64Tool: fileURLToPath(new URL('./base64-encode-decode.html', import.meta.url)),
        urlEncodeTool: fileURLToPath(new URL('./url-encode-decode.html', import.meta.url)),
        textCompare: fileURLToPath(new URL('./text-compare.html', import.meta.url)),
        xmlToJson: fileURLToPath(new URL('./xml-to-json.html', import.meta.url)),
        jsonToYaml: fileURLToPath(new URL('./json-to-yaml.html', import.meta.url)),
        yamlToJson: fileURLToPath(new URL('./yaml-to-json.html', import.meta.url)),
        jsonEscape: fileURLToPath(new URL('./json-escape.html', import.meta.url)),
        jsonMinifier: fileURLToPath(new URL('./json-minifier.html', import.meta.url)),
        jsonRepair: fileURLToPath(new URL('./json-repair.html', import.meta.url)),
        allTools: fileURLToPath(new URL('./tools.html', import.meta.url)),
      },
    },
  },
})