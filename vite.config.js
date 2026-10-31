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
      },
    },
  },
})