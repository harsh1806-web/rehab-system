"use client"

import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "380px"
        }}
      >
        {toasts.map((toast) => {
          let bg = "#1e293b"
          let border = "#334155"
          let icon = "ℹ️"

          if (toast.type === "success") {
            bg = "rgba(15, 35, 25, 0.95)"
            border = "#22c55e"
            icon = "✅"
          } else if (toast.type === "error") {
            bg = "rgba(45, 20, 20, 0.95)"
            border = "#ef4444"
            icon = "❌"
          } else if (toast.type === "warning") {
            bg = "rgba(45, 35, 15, 0.95)"
            border = "#f59e0b"
            icon = "⚠️"
          }

          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color: "white",
                padding: "12px 18px",
                borderRadius: "10px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                cursor: "pointer",
                animation: "toastSlide 0.25s ease forwards",
                backdropFilter: "blur(8px)"
              }}
            >
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return { showToast: (msg) => alert(msg) }
  }
  return context
}
