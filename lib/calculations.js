/**
 * Centralized calculation utilities for Rehab System
 * Synchronizes stay duration, 10 AM rules, hospital penalties, and age calculations
 * across both Admin and Staff/User views.
 */

export const calculateAge = (birthdate) => {
  if (!birthdate) return ""

  const today = new Date()
  const birth = new Date(birthdate)

  if (isNaN(birth.getTime())) return ""

  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age >= 0 ? age : ""
}

export const calculateRehabDays = (stays = []) => {
  let total = 0
  const rehabStays = (stays || []).filter(s => s.type === "rehab")

  rehabStays.forEach((stay, index) => {
    const start = new Date(stay.start_date)
    const end = stay.end_date ? new Date(stay.end_date) : new Date()

    if (isNaN(start.getTime())) return

    let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    // 10:00 AM CUTOFF RULE
    if (start.getHours() >= 10) {
      days -= 1
    }

    if (end.getHours() < 10) {
      days -= 1
    }

    // Minimum 1 day for initial admission stay
    if (index === 0 && days < 1) days = 1

    if (days < 0) days = 0

    total += days
  })

  return total
}

export const calculateHospitalPenalty = (stays = []) => {
  let penalty = 0

  ;(stays || []).forEach((stay) => {
    if (stay.type !== "hospital") return

    const start = new Date(stay.start_date)
    const end = stay.end_date ? new Date(stay.end_date) : new Date()

    if (isNaN(start.getTime())) return

    const hours = (end - start) / (1000 * 60 * 60)

    if (hours >= 12) {
      penalty += 1
    }
  })

  return penalty
}

export const calculateShortGapAdjustment = (stays = []) => {
  let adjustment = 0

  const rehabStays = (stays || [])
    .filter(s => s.type === "rehab" && s.start_date)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  for (let i = 1; i < rehabStays.length; i++) {
    if (!rehabStays[i - 1].end_date || !rehabStays[i].start_date) continue

    const prevEnd = new Date(rehabStays[i - 1].end_date)
    const currStart = new Date(rehabStays[i].start_date)

    const gapHours = (currStart - prevEnd) / (1000 * 60 * 60)

    if (gapHours >= 0 && gapHours < 6) {
      adjustment += 1 // Deduct duplicate counted day
    }
  }

  return adjustment
}

export const calculateFinalRehabDays = (stays = []) => {
  const rehab = calculateRehabDays(stays)
  const penalty = calculateHospitalPenalty(stays)
  const shortGap = calculateShortGapAdjustment(stays)

  return Math.max(0, rehab - penalty - shortGap)
}

export const calculateShiftDays = (stays = []) => {
  let total = 0

  ;(stays || []).forEach((stay) => {
    if (stay.type === "hospital") {
      const start = new Date(stay.start_date)
      const end = stay.end_date ? new Date(stay.end_date) : new Date()

      if (isNaN(start.getTime())) return

      const diff = (end - start) / (1000 * 60 * 60 * 24)
      total += Math.max(0, diff)
    }
  })

  return Math.floor(total)
}
