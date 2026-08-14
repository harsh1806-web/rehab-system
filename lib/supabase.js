import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bvxgbcginllxbslvuowx.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Dlt0BV6dRbNrRq5gj0vVnw_Lcytz650"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)