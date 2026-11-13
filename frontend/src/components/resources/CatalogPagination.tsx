interface CatalogPaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
}: CatalogPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize

  const visiblePages = Array.from({ length: totalPages }, (_, idx) => idx + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - safePage) <= 2
  )

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-6 text-xs text-neutral-500">
      <span>
        Se afișează {totalItems === 0 ? 0 : startIndex + 1}–
        {Math.min(startIndex + pageSize, totalItems)} din {totalItems} resurse
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-40 transition-colors"
        >
          Anterior
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center transition-colors ${
              page === safePage
                ? "bg-neutral-950 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-40 transition-colors"
        >
          Următor
        </button>
      </div>
    </div>
  )
}
