import React from 'react'
import ReactDOM from 'react-dom/client'
import { CustomerShop } from './components/CustomerShop.tsx'
import { StaffWorkspace } from './components/StaffWorkspace.tsx'
import './assets/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{window.location.pathname === '/shop' ? <CustomerShop /> : <StaffWorkspace />}</React.StrictMode>,
)
