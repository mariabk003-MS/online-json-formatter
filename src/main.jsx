import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'
import JsonToCsv from './JsonToCsv.jsx'
import About from './About.jsx'
import CsvToJson from './CsvToJson.jsx'
import JsonValidator from './JsonValidator.jsx'
import JsonErrorsGuide from './JsonErrorsGuide.jsx'
import JsonViewer from './JsonViewer.jsx'
import JsonToXml from './JsonToXml.jsx'
import WhatIsJson from './WhatIsJson.jsx'
import HowToOpenJson from './HowToOpenJson.jsx'
import JsonVsXml from './JsonVsXml.jsx'
import JsonToExcelGuide from './JsonToExcelGuide.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/json-to-csv" element={<JsonToCsv />} />
        <Route path="/about" element={<About />} />
        <Route path="/csv-to-json" element={<CsvToJson />} />
        <Route path="/json-validator" element={<JsonValidator />} />
        <Route path="/common-json-errors" element={<JsonErrorsGuide />} />
        <Route path="/json-viewer" element={<JsonViewer />} />
        <Route path="/json-to-xml" element={<JsonToXml />} />
        <Route path="/what-is-json" element={<WhatIsJson />} />
        <Route path="/how-to-open-json-file" element={<HowToOpenJson />} />
        <Route path="/json-vs-xml" element={<JsonVsXml />} />
        <Route path="/convert-json-to-excel" element={<JsonToExcelGuide />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)