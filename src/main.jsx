import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ProjectsSite from './pages/ProjectsSite.jsx'

const isProjectsSite = window.location.pathname === '/projects-site'

createRoot(document.getElementById('root')).render(
  <StrictMode>{isProjectsSite ? <ProjectsSite /> : <App />}</StrictMode>,
)
