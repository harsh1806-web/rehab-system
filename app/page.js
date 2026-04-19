"use client"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {

  useEffect(() => {
    test()
  }, [])

  const test = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")

    console.log("DATA:", data)
    console.log("ERROR:", error)
  }

  return <h1>Supabase Connected ✅</h1>
}