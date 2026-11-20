import { useState } from "react"

/** Stare comuna a modalelor academice (eroare + trimitere in curs). */
export function useModalStatus() {
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  return { modalError, setModalError, isSubmitting, setIsSubmitting }
}

export type ModalStatus = ReturnType<typeof useModalStatus>
