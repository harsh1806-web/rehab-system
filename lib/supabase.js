import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bvxgbcginllxbslvuowx.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Dlt0BV6dRbNrRq5gj0vVnw_Lcytz650"

// Custom Cookie + LocalStorage adapter so Next.js Middleware & Vercel Edge can verify sessions
const customAuthStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null
    try {
      const name = key + "="
      const decodedCookie = decodeURIComponent(document.cookie || "")
      const ca = decodedCookie.split(";")
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim()
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
      }
      return window.localStorage?.getItem(key) || null
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    if (typeof window !== "undefined") {
      try {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax`
        window.localStorage?.setItem(key, value)
      } catch (e) {
        console.warn("Storage write error:", e)
      }
    }
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") {
      try {
        document.cookie = `${key}=; path=/; max-age=0`
        window.localStorage?.removeItem(key)
      } catch (e) {
        console.warn("Storage remove error:", e)
      }
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})