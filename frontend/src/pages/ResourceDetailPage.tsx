import { useParams } from "react-router-dom"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useResourceDetail } from "../hooks/useResourceDetail"
import { QuotaLimitModal } from "../components/modals/QuotaLimitModal"
import { ResourceDetailHeader } from "../components/resources/ResourceDetailHeader"
import { ResourceSpecsCard } from "../components/resources/ResourceSpecsCard"
import { ResourceAvailabilityCalendar } from "../components/resources/ResourceAvailabilityCalendar"
import { ResourceBookingFormCard } from "../components/resources/ResourceBookingFormCard"

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const detail = useResourceDetail(id || "1")

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog resurse", detail.displayTitle]}>
      <div className="max-w-7xl mx-auto space-y-5">
        <ResourceDetailHeader
          displayTitle={detail.displayTitle}
          displayCategory={detail.displayCategory}
          displayRoom={detail.displayRoom}
          specializare={detail.specializare}
          displayCode={detail.displayCode}
          onReserveClick={() => {
            document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })
          }}
        />

        {detail.bookingSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{detail.bookingSuccess}</span>
            </div>
            <button
              onClick={() => detail.setBookingSuccess(null)}
              className="font-bold text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {detail.errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{detail.errorMsg}</span>
            </div>
            <button
              onClick={() => detail.setErrorMsg(null)}
              className="font-bold text-rose-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <ResourceSpecsCard
            displayImage={detail.displayImage}
            displayTitle={detail.displayTitle}
            displayCode={detail.displayCode}
            specs={detail.specs}
            displayRoom={detail.displayRoom}
            displayDept={detail.displayDept}
            specializare={detail.specializare}
            userRole={user?.rol}
          />

          <div className="lg:col-span-8 space-y-5">
            <ResourceAvailabilityCalendar
              days={detail.days}
              dayOffset={detail.dayOffset}
              monthLabel={detail.monthLabel}
              onPrevDays={() => detail.setDayOffset((prev) => Math.max(0, prev - 5))}
              onNextDays={() => detail.setDayOffset((prev) => prev + 5)}
              isSlotOccupied={detail.isSlotOccupied}
              isSlotSelected={detail.isSlotSelected}
              onSelectSlot={detail.handleSelectSlot}
            />

            <ResourceBookingFormCard
              bookingMode={detail.bookingMode}
              onBookingModeChange={(mode) => {
                detail.setBookingMode(mode)
                detail.setErrorMsg(null)
              }}
              formattedSelectedRange={detail.formattedSelectedRange}
              durationSummaryLabel={detail.durationSummaryLabel}
              displayTitle={detail.displayTitle}
              displayRoom={detail.displayRoom}
              durationHours={detail.durationHours}
              onDurationHoursChange={(h) => {
                detail.setDurationHours(h)
                detail.setErrorMsg(null)
              }}
              multiDaysCount={detail.multiDaysCount}
              onMultiDaysCountChange={(d) => {
                detail.setMultiDaysCount(d)
                detail.setErrorMsg(null)
              }}
              multiEndHour={detail.multiEndHour}
              onMultiEndHourChange={(h) => {
                detail.setMultiEndHour(h)
                detail.setErrorMsg(null)
              }}
              selectedIsoDate={detail.selectedIsoDate}
              minIsoDate={detail.minIsoDate}
              onSelectedIsoDateChange={(iso) => {
                detail.setSelectedIsoDate(iso)
                detail.setErrorMsg(null)
              }}
              selectedStartHour={detail.selectedStartHour}
              onSelectedStartHourChange={(h) => {
                detail.setSelectedStartHour(h)
                detail.setErrorMsg(null)
              }}
              startStr={detail.startStr}
              endStr={detail.endStr}
              endDisplayDate={detail.endDisplayDate}
              purpose={detail.purpose}
              onPurposeChange={detail.setPurpose}
              hasSlotConflict={detail.hasSlotConflict}
              activeCount={detail.activeCount}
              maxLimit={detail.maxLimit}
              isSubmitting={detail.isSubmitting}
              onQuickHours={detail.applyQuickHours}
              onQuickDays={detail.applyQuickDays}
              onSubmit={detail.handleContinueBooking}
            />
          </div>
        </div>
      </div>

      <QuotaLimitModal
        isOpen={detail.isQuotaModalOpen}
        onClose={() => detail.setIsQuotaModalOpen(false)}
        attemptedDate={detail.startDisplayDate}
        attemptedTime={`${detail.startStr}–${detail.endStr}`}
        currentActiveCount={detail.activeCount}
        maxLimit={detail.maxLimit}
      />
    </AppLayout>
  )
}
