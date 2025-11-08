import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from '@web/App.jsx'
import { AuthProvider } from '@web/auth/AuthContext.jsx'
import api from '@web/api/api.js'

api
  .get('/health')
  .then((r) => console.log('API health:', r.data))
  .catch((err) => console.error('API health failed:', err.message))

function DesktopShell() {
  return (
    <StrictMode>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<DesktopShell />)
