import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ROUTES } from './routes.js'

// The page HTML is already written into index.html etc. at build time (for
// Google and other search engines). React then takes over and renders it live.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {ROUTES.map(([path, Page]) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
