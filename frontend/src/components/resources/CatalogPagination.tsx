import { PaginationFooter } from "../common/PaginationFooter"

interface CatalogPaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
}

/** Pastrat pentru compatibilitate: delegheaza catre PaginationFooter. */
export function CatalogPagination(props: CatalogPaginationProps) {
  return <PaginationFooter {...props} itemLabel="resurse" />
}
