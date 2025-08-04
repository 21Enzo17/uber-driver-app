"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, Receipt, Fuel, UtensilsCrossed, Wrench, CreditCard, Droplets, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Función para formatear horas decimales a formato natural
const formatHours = (decimalHours: number) => {
  if (decimalHours === 0) return "0h"
  
  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)
  
  if (hours === 0 && minutes > 0) {
    return `${minutes}min`
  } else if (hours > 0 && minutes === 0) {
    return `${hours}h`
  } else if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  } else {
    return "0h"
  }
}

interface DailyActivity {
  id: string
  date: string
  totalEarned: number
  hoursWorked: number
  comment?: string
}

interface Expense {
  id: string
  date: string
  amount: number
  category: string
  comment?: string
}

const expenseCategories = [
  { value: "Nafta", label: "Nafta", icon: Fuel },
  { value: "Comida", label: "Comida", icon: UtensilsCrossed },
  { value: "Mantenimiento", label: "Mantenimiento", icon: Wrench },
  { value: "Peajes", label: "Peajes", icon: CreditCard },
  { value: "Lavado", label: "Lavado", icon: Droplets },
  { value: "Otros", label: "Otros", icon: MoreHorizontal },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Nafta":
      return <Fuel className="h-4 w-4" />
    case "Comida":
      return <UtensilsCrossed className="h-4 w-4" />
    case "Mantenimiento":
      return <Wrench className="h-4 w-4" />
    case "Peajes":
      return <CreditCard className="h-4 w-4" />
    case "Lavado":
      return <Droplets className="h-4 w-4" />
    default:
      return <MoreHorizontal className="h-4 w-4" />
  }
}

export default function RegistroPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<DailyActivity[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Estados para formulario de actividad
  const [activityForm, setActivityForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    totalEarned: "",
    hours: "",
    minutes: "",
    comment: "",
  })

  // Función para validar horas
  const validateHours = (value: string) => {
    const numValue = Number.parseFloat(value)
    if (numValue > 23) {
      toast({
        title: "Valor ajustado",
        description: "Las horas no pueden ser mayor a 23. Se ajustó automáticamente.",
        variant: "destructive",
      })
      return "23"
    }
    if (numValue < 0) {
      toast({
        title: "Valor ajustado",
        description: "Las horas no pueden ser negativas. Se ajustó automáticamente.",
        variant: "destructive",
      })
      return "0"
    }
    return value
  }

  // Función para validar minutos
  const validateMinutes = (value: string) => {
    const numValue = Number.parseFloat(value)
    if (numValue > 60) {
      toast({
        title: "Valor ajustado",
        description: "Los minutos no pueden ser mayor a 60. Se ajustó automáticamente.",
        variant: "destructive",
      })
      return "60"
    }
    if (numValue < 0) {
      toast({
        title: "Valor ajustado",
        description: "Los minutos no pueden ser negativos. Se ajustó automáticamente.",
        variant: "destructive",
      })
      return "0"
    }
    return value
  }

  // Estados para formulario de gastos
  const [expenseForm, setExpenseForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    category: "",
    comment: "",
  })

  useEffect(() => {
    const savedActivities = localStorage.getItem("uber-activities")
    const savedExpenses = localStorage.getItem("uber-expenses")

    if (savedActivities) {
      setActivities(JSON.parse(savedActivities))
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!activityForm.totalEarned || (!activityForm.hours && !activityForm.minutes)) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Convertir horas y minutos a decimal
    const hours = Number.parseFloat(activityForm.hours) || 0
    const minutes = Number.parseFloat(activityForm.minutes) || 0
    const totalHoursDecimal = hours + (minutes / 60)

    if (totalHoursDecimal <= 0) {
      toast({
        title: "Error",
        description: "Debes ingresar al menos algunas horas o minutos trabajados",
        variant: "destructive",
      })
      return
    }

    const newActivity: DailyActivity = {
      id: Date.now().toString(),
      date: activityForm.date,
      totalEarned: Math.abs(Number.parseFloat(activityForm.totalEarned)), // Asegurar que sea positivo
      hoursWorked: totalHoursDecimal, // Usar el valor decimal calculado
      comment: activityForm.comment || undefined,
    }

    const updatedActivities = [...activities, newActivity]
    setActivities(updatedActivities)
    localStorage.setItem("uber-activities", JSON.stringify(updatedActivities))

    toast({
      title: "Actividad registrada",
      description: `Se registró la actividad del ${format(new Date(activityForm.date), "dd 'de' MMMM", { locale: es })} - ${formatHours(totalHoursDecimal)}`,
    })

    // Limpiar formulario
    setActivityForm({
      date: format(new Date(), "yyyy-MM-dd"),
      totalEarned: "",
      hours: "",
      minutes: "",
      comment: "",
    })
  }

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!expenseForm.amount || !expenseForm.category) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      date: expenseForm.date,
      amount: Math.abs(Number.parseFloat(expenseForm.amount)), // Asegurar que sea positivo
      category: expenseForm.category,
      comment: expenseForm.comment || undefined,
    }

    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    localStorage.setItem("uber-expenses", JSON.stringify(updatedExpenses))

    toast({
      title: "Gasto registrado",
      description: `Se registró el gasto de $${expenseForm.amount} en ${expenseForm.category}`,
    })

    // Limpiar formulario
    setExpenseForm({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "",
      category: "",
      comment: "",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <h2 className="text-3xl font-bold tracking-tight">Registro de Actividad</h2>
      </div>

      <Tabs defaultValue="actividad" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actividad">
            <DollarSign className="h-4 w-4 mr-2" />
            Actividad Diaria
          </TabsTrigger>
          <TabsTrigger value="gastos">
            <Receipt className="h-4 w-4 mr-2" />
            Gastos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actividad">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Actividad Diaria</CardTitle>
              <CardDescription>Registra tus ganancias y horas trabajadas del día</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-date">Fecha *</Label>
                    <Input
                      id="activity-date"
                      type="date"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-earned">Total Ganado ($) *</Label>
                    <Input
                      id="total-earned"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={activityForm.totalEarned}
                      onChange={(e) => setActivityForm((prev) => ({ ...prev, totalEarned: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours-worked">Horas Trabajadas *</Label>
                    <Input
                      id="hours-worked"
                      type="number"
                      min="0"
                      max="23"
                      placeholder="8"
                      value={activityForm.hours}
                      onChange={(e) => setActivityForm((prev) => ({ ...prev, hours: e.target.value }))}
                      onBlur={(e) => {
                        const validatedValue = validateHours(e.target.value)
                        setActivityForm((prev) => ({ ...prev, hours: validatedValue }))
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minutes-worked">Minutos Adicionales</Label>
                    <Input
                      id="minutes-worked"
                      type="number"
                      min="0"
                      max="60"
                      placeholder="30"
                      value={activityForm.minutes}
                      onChange={(e) => setActivityForm((prev) => ({ ...prev, minutes: e.target.value }))}
                      onBlur={(e) => {
                        const validatedValue = validateMinutes(e.target.value)
                        setActivityForm((prev) => ({ ...prev, minutes: validatedValue }))
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-comment">Comentario (opcional)</Label>
                  <Textarea
                    id="activity-comment"
                    placeholder="Notas adicionales sobre el día..."
                    value={activityForm.comment}
                    onChange={(e) => setActivityForm((prev) => ({ ...prev, comment: e.target.value }))}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  Registrar Actividad
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gastos">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Gasto</CardTitle>
              <CardDescription>Registra tus gastos relacionados con el trabajo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-date">Fecha *</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">Monto ($) *</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-category">Categoría *</Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(value) => setExpenseForm((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="expense-comment">Comentario (opcional)</Label>
                  <Textarea
                    id="expense-comment"
                    placeholder="Detalles del gasto..."
                    value={expenseForm.comment}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, comment: e.target.value }))}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Registrar Gasto
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
