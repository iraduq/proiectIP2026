import { useCallback, useEffect, useMemo, useState } from "react"
import { academicApi } from "../../../api/academic"
import { reservationsApi } from "../../../api/reservations"
import { resourcesApi } from "../../../api/resources"
import { technicalHistoryApi } from "../../../api/technicalHistory"
import type { Reservation, Resource, Room, StareTehnica, TechnicalHistory } from "../../../types"
import { RETURN_CONDITIONS, type ReturnCondition } from "../data/labConstants"

export interface JournalDraft {
  resursa_id: number
  tip_interventie: string
  descriere: string
  stare_noua: StareTehnica
}

function errorText(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string; message?: string } } }
  return e.response?.data?.detail || e.response?.data?.message || fallback
}

export function useLabOverview() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [pending, setPending] = useState<Reservation[]>([])
  const [approved, setApproved] = useState<Reservation[]>([])
  const [journal, setJournal] = useState<TechnicalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const myRooms = (await academicApi.getMyRooms({ skip: 0, limit: 100 })).items
      const roomIds = new Set(myRooms.map((r) => r.id))
      const perRoom = await Promise.all(
        myRooms.map((r) => resourcesApi.getResources({ sala_id: r.id, skip: 0, limit: 100 }))
      )
      const [pend, appr, hist] = await Promise.all([
        reservationsApi.getReservations({ stare: "IN_ASTEPTARE", skip: 0, limit: 100 }),
        reservationsApi.getReservations({ stare: "APROBATA", skip: 0, limit: 100 }),
        technicalHistoryApi.getTechnicalHistory({ skip: 0, limit: 100 }),
      ])
      const items = perRoom.flatMap((p) => p.items)
      const resIds = new Set(items.map((i) => i.id))
      setRooms(myRooms)
      setResources(items)
      setPending(pend.items.filter((r) => r.sala_id != null && roomIds.has(r.sala_id)))
      setApproved(appr.items.filter((r) => r.sala_id != null && roomIds.has(r.sala_id)))
      setJournal(hist.items.filter((h) => resIds.has(h.resursa_id)))
    } catch (err) {
      setError(errorText(err, "Nu s-au putut încărca datele laboratorului."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const metrics = useMemo(() => {
    const count = (s: StareTehnica) => resources.filter((r) => r.stare_tehnica === s).length
    return {
      available: count("DISPONIBILA"),
      inUse: approved.filter((r) => r.preluat_la).length,
      maintenance: count("IN_MENTENANTA"),
      defect: count("DEFECTA"),
    }
  }, [resources, approved])

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    try {
      await action()
      await load()
      return null
    } catch (err) {
      return errorText(err, fallback)
    }
  }

  return {
    rooms, resources, pending, approved, journal, loading, error, metrics, reload: load,
    approve: (id: number) => run(() => reservationsApi.approveReservation(id), "Aprobarea a eșuat."),
    reject: (id: number, reason: string) =>
      run(() => reservationsApi.rejectReservation(id, reason), "Respingerea a eșuat."),
    handOver: (id: number, stare: "FUNCTIONAL" | "VERIFICARE") =>
      run(() => reservationsApi.handOverReservation(id, stare), "Predarea a eșuat."),
    giveBack: (id: number, condition: ReturnCondition, observatii: string) => {
      const stare = RETURN_CONDITIONS.find((c) => c.value === condition)?.stare ?? "DISPONIBILA"
      return run(
        () => reservationsApi.returnReservation(id, { stare_echipament: stare, observatii: observatii || undefined }),
        "Returul a eșuat."
      )
    },
    addJournal: (draft: JournalDraft) =>
      run(() => technicalHistoryApi.createTechnicalHistory(draft), "Salvarea intrării a eșuat."),
  }
}

export type LabOverview = ReturnType<typeof useLabOverview>
