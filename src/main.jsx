import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PrivacyPolicy from './PrivacyPolicy.jsx'
import JsonToCsv from './JsonToCsv.jsx'
import About from './About.jsx'
import CsvToJson from './CsvToJson.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/json-to-csv" element={<JsonToCsv />} />
        <Route path="/about" element={<About />} />
        <Route path="/csv-to-json" element={<CsvToJson />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)