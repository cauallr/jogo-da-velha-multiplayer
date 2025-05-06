import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Ou seu CSS/Tailwind


const savedTheme = JSON.parse(localStorage.getItem("velha-config"))?.theme ?? "dark";
document.documentElement.classList.toggle("dark", savedTheme === "dark");



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
