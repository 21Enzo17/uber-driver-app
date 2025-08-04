"use client"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks, startOfYear, endOfYear, subDays } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatePickerWithRangeProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
  showPeriodIndicator?: boolean
}

const presetRanges = [
  {
    label: "Esta semana",
    value: "this-week",
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: "Semana pasada",
    value: "last-week",
    getRange: () => ({
      from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
      to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
    })
  },
  {
    label: "Este mes",
    value: "this-month",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: "Mes pasado",
    value: "last-month",
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1))
    })
  },
  {
    label: "Últimos 7 días",
    value: "last-7-days",
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date()
    })
  },
  {
    label: "Últimos 30 días",
    value: "last-30-days",
    getRange: () => ({
      from: subDays(new Date(), 30),
      to: new Date()
    })
  },
  {
    label: "Este año",
    value: "this-year",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date())
    })
  }
]

// Función para detectar qué preset está activo
const getActivePreset = (dateRange: DateRange | undefined) => {
  if (!dateRange?.from || !dateRange?.to) return null

  for (const preset of presetRanges) {
    const presetRange = preset.getRange()
    if (
      dateRange.from.getTime() === presetRange.from.getTime() &&
      dateRange.to.getTime() === presetRange.to.getTime()
    ) {
      return preset.label
    }
  }
  return null
}

export function DatePickerWithRange({ date, setDate, className, showPeriodIndicator = false }: DatePickerWithRangeProps) {
  const handlePresetSelect = (value: string) => {
    const preset = presetRanges.find(p => p.value === value)
    if (preset) {
      setDate(preset.getRange())
    }
  }

  const activePreset = getActivePreset(date)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showPeriodIndicator && activePreset && (
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-md">
          📊 Mostrando: {activePreset}
        </div>
      )}
      
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select onValueChange={handlePresetSelect}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Período rápido" />
          </SelectTrigger>
          <SelectContent>
            {presetRanges.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd 'de' MMM", { locale: es })} -{" "}
                    {format(date.to, "dd 'de' MMM, yyyy", { locale: es })}
                  </>
                ) : (
                  format(date.from, "dd 'de' MMM, yyyy", { locale: es })
                )
              ) : (
                <span>Rango personalizado</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
