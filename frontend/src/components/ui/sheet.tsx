import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
})

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open = false, onOpenChange = () => {}, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "right" | "left"
  hideOverlay?: boolean
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", hideOverlay = false, className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SheetContext)

    if (!open) return null

    return (
      <>
        {!hideOverlay && (
          <div
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/15 transition-opacity"
          />
        )}
        <div
          ref={ref}
          className={cn(
            "fixed inset-y-0 z-50 flex flex-col justify-between bg-white shadow-2xl transition-all duration-200",
            side === "right" ? "right-0 border-l border-neutral-200" : "left-0 border-r border-neutral-200",
            "w-full sm:max-w-[440px]",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)
SheetContent.displayName = "SheetContent"

export const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext)
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between px-6 py-4 border-b border-neutral-100", className)}
        {...props}
      >
        <div className="space-y-0.5">{children}</div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
SheetHeader.displayName = "SheetHeader"

export const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-sm font-bold text-neutral-900 leading-tight", className)}
      {...props}
    />
  )
)
SheetTitle.displayName = "SheetTitle"

export const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-neutral-500", className)}
      {...props}
    />
  )
)
SheetDescription.displayName = "SheetDescription"

export const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-t border-neutral-100 bg-white space-y-2", className)}
      {...props}
    />
  )
)
SheetFooter.displayName = "SheetFooter"
