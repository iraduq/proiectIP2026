import { RAW_ENTRIES } from "./entries"
import { EXTRA_WORKSTATIONS_AND_KITS } from "./extraEntries"
import type { CatalogCardItem } from "./types"

export const ALL_CATALOG_ITEMS: CatalogCardItem[] = [...RAW_ENTRIES, ...EXTRA_WORKSTATIONS_AND_KITS].map(
  (entry, index) => {
    const id = index + 1
    const buttonLabel =
      entry.statusBadge === "În utilizare" ? "Verifică disponibilitatea" : "Rezervă resursa"
    return {
      id,
      code: entry.code,
      name: entry.name,
      specsAndRoom: `${entry.spec1Value} · ${entry.spec2Value} · ${entry.roomLabel}`,
      categoryTag: entry.categoryTag,
      department: entry.department,
      specializare: entry.specializare,
      roomLabel: entry.roomLabel,
      statusBadge: entry.statusBadge,
      stareTehnica: entry.stareTehnica,
      returnTodayBadge: entry.returnTodayBadge,
      availabilityNote: entry.availabilityNote,
      buttonLabel,
      imageUrl: entry.imageUrl,
      specs: [
        { label: entry.spec1Label, value: entry.spec1Value },
        { label: entry.spec2Label, value: entry.spec2Value },
      ],
    }
  }
)

export function getCatalogItemByIdOrCode(idOrCode: number | string): CatalogCardItem {
  const numId = Number(idOrCode)
  const byId = ALL_CATALOG_ITEMS.find((item) => item.id === numId)
  if (byId) return byId
  const byCode = ALL_CATALOG_ITEMS.find((item) => item.code === String(idOrCode))
  if (byCode) return byCode
  if (!Number.isNaN(numId) && numId > 0) {
    return ALL_CATALOG_ITEMS[(numId - 1) % ALL_CATALOG_ITEMS.length]
  }
  return ALL_CATALOG_ITEMS[0]
}

export type { CatalogCardItem } from "./types"
