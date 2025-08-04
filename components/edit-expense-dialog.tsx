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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Fuel, UtensilsCrossed, Wrench, CreditCard, Droplets, MoreHorizontal } from "lucide-react"

interface Expense {
  id: string
  date: string
  amount: number
  category: string
  comment?: string
}

interface EditExpenseDialogProps {
  expense: Expense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (expense: Expense) => void
}

const expenseCategories = [
  { value: "Nafta", label: "Nafta", icon: Fuel },
  { value: "Comida", label: "Comida", icon: UtensilsCrossed },
  { value: "Mantenimiento", label: "Mantenimiento", icon: Wrench },
  { value: "Peajes", label: "Peajes", icon: CreditCard },
  { value: "Lavado", label: "Lavado", icon: Droplets },
  { value: "Otros", label: "Otros", icon: MoreHorizontal },
]

export function EditExpenseDialog({ expense, open, onOpenChange, onSave }: EditExpenseDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    date: expense?.date || format(new Date(), "yyyy-MM-dd"),
    amount: expense?.amount.toString() || "",
    category: expense?.category || "",
    comment: expense?.comment || "",
  })

  const handleSave = () => {
    if (!formData.amount || !formData.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!expense) return

    const updatedExpense: Expense = {
      ...expense,
      date: formData.date,
      amount: Math.abs(Number.parseFloat(formData.amount)), // Asegurar que sea positivo
      category: formData.category,
      comment: formData.comment || undefined,
    }

    onSave(updatedExpense)
    onOpenChange(false)
    toast({
      title: "Gasto actualizado",
      description: "Los cambios se guardaron correctamente",
    })
  }

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        amount: Math.abs(expense.amount).toString(), // Siempre mostrar valor positivo
        category: expense.category,
        comment: expense.comment || "",
      })
    }
  }, [expense])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>Modifica los datos de tu gasto</DialogDescription>
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
            <Label htmlFor="amount" className="text-right">
              Monto ($)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoría
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-red-500" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
