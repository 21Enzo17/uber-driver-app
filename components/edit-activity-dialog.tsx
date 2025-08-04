"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface DailyActivity {
  id: string
  date: string
  totalEarned: number
  hoursWorked: number
  comment?: string
}

interface EditActivityDialogProps {
  activity: DailyActivity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (activity: DailyActivity) => void
}

export function EditActivityDialog({ activity, open, onOpenChange, onSave }: EditActivityDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    date: activity?.date || format(new Date(), "yyyy-MM-dd"),
    totalEarned: activity?.totalEarned.toString() || "",
    hoursWorked: activity?.hoursWorked.toString() || "",
    comment: activity?.comment || "",
  })

  const handleSave = () => {
    if (!formData.totalEarned || !formData.hoursWorked) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!activity) return

    const updatedActivity: DailyActivity = {
      ...activity,
      date: formData.date,
      totalEarned: Math.abs(Number.parseFloat(formData.totalEarned)), // Asegurar que sea positivo
      hoursWorked: Math.abs(Number.parseFloat(formData.hoursWorked)), // Asegurar que sea positivo
      comment: formData.comment || undefined,
    }

    onSave(updatedActivity)
    onOpenChange(false)
    toast({
      title: "Actividad actualizada",
      description: "Los cambios se guardaron correctamente",
    })
  }

  useEffect(() => {
    if (activity) {
      setFormData({
        date: activity.date,
        totalEarned: Math.abs(activity.totalEarned).toString(), // Siempre mostrar valor positivo
        hoursWorked: Math.abs(activity.hoursWorked).toString(), // Siempre mostrar valor positivo
        comment: activity.comment || "",
      })
    }
  }, [activity])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Actividad</DialogTitle>
          <DialogDescription>Modifica los datos de tu actividad diaria</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalEarned" className="text-right">
              Ganancia ($)
            </Label>
            <Input
              id="totalEarned"
              type="number"
              step="0.01"
              value={formData.totalEarned}
              onChange={(e) => setFormData((prev) => ({ ...prev, totalEarned: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hoursWorked" className="text-right">
              Horas
            </Label>
            <Input
              id="hoursWorked"
              type="number"
              step="0.5"
              value={formData.hoursWorked}
              onChange={(e) => setFormData((prev) => ({ ...prev, hoursWorked: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comentario
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
