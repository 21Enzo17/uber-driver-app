"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Fuel,
  UtensilsCrossed,
  Wrench,
  CreditCard,
  Droplets,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { EditActivityDialog } from "@/components/edit-activity-dialog"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/hooks/use-toast"

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

const getExpenseIcon = (category: string) => {
  switch (category) {
    case "Nafta":
      return Fuel
    case "Comida":
      return UtensilsCrossed
    case "Mantenimiento":
      return Wrench
    case "Peajes":
      return CreditCard
    case "Lavado":
      return Droplets
    default:
      return MoreHorizontal
  }
}

export default function Dashboard() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<DailyActivity[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  // Estados para modales
  const [editActivityDialog, setEditActivityDialog] = useState<{
    open: boolean
    activity: DailyActivity | null
  }>({ open: false, activity: null })

  const [editExpenseDialog, setEditExpenseDialog] = useState<{
    open: boolean
    expense: Expense | null
  }>({ open: false, expense: null })

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "activity" | "expense" | null
    id: string | null
    title: string
    description: string
  }>({ open: false, type: null, id: null, title: "", description: "" })

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

  const filterDataByDateRange = (data: any[], dateField: string) => {
    if (!dateRange?.from || !dateRange?.to) return data

    return data.filter((item) => {
      const itemDate = new Date(item[dateField])
      return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! })
    })
  }

  const filteredActivities = filterDataByDateRange(activities, "date")
  const filteredExpenses = filterDataByDateRange(expenses, "date")

  // Cálculos para el período seleccionado
  const totalEarned = filteredActivities.reduce((sum, activity) => sum + activity.totalEarned, 0)
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netBalance = totalEarned - totalExpenses
  const totalHours = filteredActivities.reduce((sum, activity) => sum + activity.hoursWorked, 0)
  const daysWorked = filteredActivities.length

  // Cálculos semanales (basados en el rango de fechas seleccionado)
  const weekStart = dateRange?.from ? startOfWeek(dateRange.from, { weekStartsOn: 1 }) : startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = dateRange?.to ? endOfWeek(dateRange.to, { weekStartsOn: 1 }) : endOfWeek(new Date(), { weekStartsOn: 1 })

  const weeklyActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.date)
    return isWithinInterval(activityDate, { start: weekStart, end: weekEnd })
  })

  const weeklyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd })
  })

  const weeklyEarned = weeklyActivities.reduce((sum, activity) => sum + activity.totalEarned, 0)
  const weeklySpent = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Agregar estas nuevas métricas:
  const earningsPerHour = totalHours > 0 ? totalEarned / totalHours : 0
  const profitPercentage = totalEarned > 0 ? (netBalance / totalEarned) * 100 : 0

  // Funciones de edición y eliminación
  const handleEditActivity = (activity: DailyActivity) => {
    setEditActivityDialog({ open: true, activity })
  }

  const handleEditExpense = (expense: Expense) => {
    setEditExpenseDialog({ open: true, expense })
  }

  const handleSaveActivity = (updatedActivity: DailyActivity) => {
    const updatedActivities = activities.map((activity) =>
      activity.id === updatedActivity.id ? updatedActivity : activity,
    )
    setActivities(updatedActivities)
    localStorage.setItem("uber-activities", JSON.stringify(updatedActivities))
  }

  const handleSaveExpense = (updatedExpense: Expense) => {
    // Asegurar que el monto del gasto sea positivo en el almacenamiento
    const expenseToSave = {
      ...updatedExpense,
      amount: Math.abs(updatedExpense.amount),
    }

    const updatedExpenses = expenses.map((expense) => (expense.id === updatedExpense.id ? expenseToSave : expense))
    setExpenses(updatedExpenses)
    localStorage.setItem("uber-expenses", JSON.stringify(updatedExpenses))
  }

  const handleDeleteActivity = (activity: DailyActivity) => {
    setDeleteDialog({
      open: true,
      type: "activity",
      id: activity.id,
      title: "Eliminar Actividad",
      description: `¿Estás seguro de que quieres eliminar la actividad del ${format(new Date(activity.date), "dd 'de' MMMM, yyyy", { locale: es })}?`,
    })
  }

  const handleDeleteExpense = (expense: Expense) => {
    setDeleteDialog({
      open: true,
      type: "expense",
      id: expense.id,
      title: "Eliminar Gasto",
      description: `¿Estás seguro de que quieres eliminar el gasto de ${expense.category} por $${expense.amount}?`,
    })
  }

  const confirmDelete = () => {
    if (!deleteDialog.id || !deleteDialog.type) return

    if (deleteDialog.type === "activity") {
      const updatedActivities = activities.filter((activity) => activity.id !== deleteDialog.id)
      setActivities(updatedActivities)
      localStorage.setItem("uber-activities", JSON.stringify(updatedActivities))
      toast({
        title: "Actividad eliminada",
        description: "La actividad se eliminó correctamente",
      })
    } else if (deleteDialog.type === "expense") {
      const updatedExpenses = expenses.filter((expense) => expense.id !== deleteDialog.id)
      setExpenses(updatedExpenses)
      localStorage.setItem("uber-expenses", JSON.stringify(updatedExpenses))
      toast({
        title: "Gasto eliminado",
        description: "El gasto se eliminó correctamente",
      })
    }

    setDeleteDialog({ open: false, type: null, id: null, title: "", description: "" })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} showPeriodIndicator={true} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Semanal: ${weeklyEarned.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Semanal: ${weeklySpent.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              ${netBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Semanal: ${(weeklyEarned - weeklySpent).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(totalHours)}</div>
            <p className="text-xs text-muted-foreground">{daysWorked} días trabajados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia por Hora</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${earningsPerHour.toFixed(2)}/h</div>
            <p className="text-xs text-muted-foreground">Promedio por hora trabajada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% de Ganancia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profitPercentage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {profitPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Margen de ganancia</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos registros de actividad diaria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities
                .slice(-5)
                .reverse()
                .map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(activity.date), "dd 'de' MMMM", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatHours(activity.hoursWorked)} trabajadas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        +${activity.totalEarned.toLocaleString()}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEditActivity(activity)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteActivity(activity)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              {filteredActivities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividades registradas en este período
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Gastos Recientes</CardTitle>
            <CardDescription>Últimos gastos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExpenses
                .slice(-5)
                .reverse()
                .map((expense) => {
                  const IconComponent = getExpenseIcon(expense.category)
                  return (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <IconComponent className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">{expense.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.date), "dd/MM", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        >
                          -${expense.amount.toLocaleString()}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleEditExpense(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              {filteredExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay gastos registrados en este período
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <EditActivityDialog
        activity={editActivityDialog.activity}
        open={editActivityDialog.open}
        onOpenChange={(open) => setEditActivityDialog({ open, activity: null })}
        onSave={handleSaveActivity}
      />

      <EditExpenseDialog
        expense={editExpenseDialog.expense}
        open={editExpenseDialog.open}
        onOpenChange={(open) => setEditExpenseDialog({ open, expense: null })}
        onSave={handleSaveExpense}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={confirmDelete}
        title={deleteDialog.title}
        description={deleteDialog.description}
      />
    </div>
  )
}
