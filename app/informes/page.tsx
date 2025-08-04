"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  Calendar,
  Fuel,
  UtensilsCrossed,
  Wrench,
  CreditCard,
  Droplets,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, isWithinInterval, subDays } from "date-fns"
import { es } from "date-fns/locale"
import * as XLSX from 'xlsx'
import { DollarSign } from "lucide-react"
import { EditActivityDialog } from "@/components/edit-activity-dialog"
import { EditExpenseDialog } from "@/components/edit-expense-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/hooks/use-toast"

// Función para formatear horas decimales a formato HH:MM natural
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

export default function InformesPage() {
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

  // Calcular métricas
  const totalEarned = filteredActivities.reduce((sum, activity) => sum + activity.totalEarned, 0)
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netBalance = totalEarned - totalExpenses
  const totalHours = filteredActivities.reduce((sum, activity) => sum + activity.hoursWorked, 0)

  const earningsPerHour = totalHours > 0 ? totalEarned / totalHours : 0
  const profitPercentage = totalEarned > 0 ? (netBalance / totalEarned) * 100 : 0

  // Funciones de edición
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

  // Funciones de eliminación
  const handleDeleteActivity = (activity: DailyActivity) => {
    setDeleteDialog({
      open: true,
      type: "activity",
      id: activity.id,
      title: "Eliminar Actividad",
      description: `¿Estás seguro de que quieres eliminar la actividad del ${format(new Date(activity.date), "dd 'de' MMMM, yyyy", { locale: es })}? Esta acción no se puede deshacer.`,
    })
  }

  const handleDeleteExpense = (expense: Expense) => {
    setDeleteDialog({
      open: true,
      type: "expense",
      id: expense.id,
      title: "Eliminar Gasto",
      description: `¿Estás seguro de que quieres eliminar el gasto de ${expense.category} por $${expense.amount}? Esta acción no se puede deshacer.`,
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

  const exportToExcel = () => {
    const filteredActivities = filterDataByDateRange(activities, "date")
    const filteredExpenses = filterDataByDateRange(expenses, "date")

    // Calcular métricas principales
    const totalEarned = filteredActivities.reduce((sum, activity) => sum + activity.totalEarned, 0)
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netBalance = totalEarned - totalExpenses
    const totalHours = filteredActivities.reduce((sum, activity) => sum + activity.hoursWorked, 0)
    const earningsPerHour = totalHours > 0 ? totalEarned / totalHours : 0
    const profitPercentage = totalEarned > 0 ? (netBalance / totalEarned) * 100 : 0

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new()

    // HOJA 1: RESUMEN EJECUTIVO
    const resumenData = [
      ['INFORME FINANCIERO - CONDUCTOR UBER'],
      [''],
      ['PERÍODO DE ANÁLISIS'],
      ['Desde:', dateRange?.from ? format(dateRange.from, "dd/MM/yyyy", { locale: es }) : ''],
      ['Hasta:', dateRange?.to ? format(dateRange.to, "dd/MM/yyyy", { locale: es }) : ''],
      ['Generado:', format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })],
      [''],
      ['RESUMEN FINANCIERO'],
      ['Total Ingresos', `$${totalEarned.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`],
      ['Total Gastos', `$${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`],
      ['Balance Neto', `$${netBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`],
      [''],
      ['MÉTRICAS OPERATIVAS'],
      ['Horas Trabajadas', formatHours(totalHours)],
      ['Días Trabajados', `${filteredActivities.length} días`],
      ['Promedio Horas/Día', totalHours > 0 ? formatHours(totalHours / filteredActivities.length) : '0h'],
      [''],
      ['ANÁLISIS DE RENDIMIENTO'],
      ['Ganancia por Hora', `$${earningsPerHour.toLocaleString('es-AR', { minimumFractionDigits: 2 })}/h`],
      ['Margen de Ganancia', `${profitPercentage.toFixed(1)}%`],
      ['Gasto por Peso Ganado', totalEarned > 0 ? `$${(totalExpenses / totalEarned).toFixed(2)}` : '$0.00']
    ]

    // HOJA 2: GASTOS POR CATEGORÍA
    const expensesByCategory = filteredExpenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>
    )

    const gastosData = [
      ['ANÁLISIS DE GASTOS POR CATEGORÍA'],
      [''],
      ['Categoría', 'Monto Total', '% del Total', 'Cantidad'],
      ['', '', '', '']
    ]

    // Agregar datos de gastos ordenados por monto
    const sortedExpenses = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number))

    sortedExpenses.forEach(([category, amount]) => {
      const percentage = totalExpenses > 0 ? ((amount as number) / totalExpenses) * 100 : 0
      const count = filteredExpenses.filter(exp => exp.category === category).length
      gastosData.push([
        category,
        `$${(amount as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        `${percentage.toFixed(1)}%`,
        `${count} reg.`
      ])
    })

    // Agregar total
    gastosData.push([''])
    gastosData.push(['TOTAL GASTOS', `$${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, '100.0%', `${filteredExpenses.length} reg.`])

    // HOJA 3: DETALLE DE TRANSACCIONES
    const transaccionesData = [
      ['DETALLE COMPLETO DE TRANSACCIONES'],
      [''],
      ['Fecha', 'Tipo', 'Categoría/Detalle', 'Monto', 'Horas', 'Comentario'],
      ['', '', '', '', '', '']
    ]

    // Combinar y ordenar todas las transacciones
    const allTransactions = [
      ...filteredActivities.map(activity => ({
        date: activity.date,
        type: 'INGRESO',
        category: `Trabajo Uber (${formatHours(activity.hoursWorked)})`,
        amount: activity.totalEarned,
        hours: activity.hoursWorked,
        comment: activity.comment || ''
      })),
      ...filteredExpenses.map(expense => ({
        date: expense.date,
        type: 'GASTO',
        category: expense.category,
        amount: -expense.amount,
        hours: 0,
        comment: expense.comment || ''
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    allTransactions.forEach(transaction => {
      transaccionesData.push([
        format(new Date(transaction.date), "dd/MM/yyyy", { locale: es }),
        transaction.type,
        transaction.category,
        `$${Math.abs(transaction.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        transaction.hours > 0 ? `${transaction.hours}h` : '',
        transaction.comment
      ])
    })

    // Agregar totales
    transaccionesData.push([''])
    transaccionesData.push(['TOTALES:', '', '', '', '', ''])
    transaccionesData.push(['Ingresos:', '', '', `$${totalEarned.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, '', ''])
    transaccionesData.push(['Gastos:', '', '', `$${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, '', ''])
    transaccionesData.push(['Balance:', '', '', `$${netBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, '', ''])

    // HOJA 4: ANÁLISIS DIARIO
    const dailyAnalysis = new Map<string, {ingresos: number, gastos: number, horas: number}>()
    
    // Procesar actividades
    filteredActivities.forEach(activity => {
      const dateKey = activity.date
      if (!dailyAnalysis.has(dateKey)) {
        dailyAnalysis.set(dateKey, {ingresos: 0, gastos: 0, horas: 0})
      }
      const day = dailyAnalysis.get(dateKey)!
      day.ingresos += activity.totalEarned
      day.horas += activity.hoursWorked
    })

    // Procesar gastos
    filteredExpenses.forEach(expense => {
      const dateKey = expense.date
      if (!dailyAnalysis.has(dateKey)) {
        dailyAnalysis.set(dateKey, {ingresos: 0, gastos: 0, horas: 0})
      }
      const day = dailyAnalysis.get(dateKey)!
      day.gastos += expense.amount
    })

    const analisisData = [
      ['ANÁLISIS DE PERFORMANCE DIARIA'],
      [''],
      ['Fecha', 'Ingresos', 'Gastos', 'Balance', 'Horas', '$/Hora', 'Eficiencia'],
      ['', '', '', '', '', '', '']
    ]

    let totalDailyIngresos = 0
    let totalDailyGastos = 0
    let totalDailyHoras = 0

    Array.from(dailyAnalysis.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(([date, data]) => {
        const balance = data.ingresos - data.gastos
        const gananciaHora = data.horas > 0 ? data.ingresos / data.horas : 0
        const eficiencia = data.ingresos > 0 ? ((balance / data.ingresos) * 100) : 0

        totalDailyIngresos += data.ingresos
        totalDailyGastos += data.gastos
        totalDailyHoras += data.horas

        analisisData.push([
          format(new Date(date), "dd/MM/yyyy", { locale: es }),
          `$${data.ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          `$${data.gastos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          `$${balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          formatHours(data.horas),
          `$${gananciaHora.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
          `${eficiencia.toFixed(1)}%`
        ])
      })

    // Agregar promedios
    const avgDays = dailyAnalysis.size
    analisisData.push([''])
    analisisData.push(['PROMEDIOS DIARIOS:', '', '', '', '', '', ''])
    analisisData.push(['Promedio Ingresos:', `$${(totalDailyIngresos / avgDays).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, '', '', '', '', ''])
    analisisData.push(['Promedio Gastos:', `$${(totalDailyGastos / avgDays).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, '', '', '', '', ''])
    analisisData.push(['Promedio Horas:', formatHours(totalDailyHoras / avgDays), '', '', '', '', ''])

    // Crear hojas de trabajo
    const resumenWS = XLSX.utils.aoa_to_sheet(resumenData)
    const gastosWS = XLSX.utils.aoa_to_sheet(gastosData)
    const transaccionesWS = XLSX.utils.aoa_to_sheet(transaccionesData)
    const analisisWS = XLSX.utils.aoa_to_sheet(analisisData)

    // Configurar ancho de columnas para mejor legibilidad
    resumenWS['!cols'] = [{ width: 28 }, { width: 25 }]
    gastosWS['!cols'] = [{ width: 20 }, { width: 18 }, { width: 12 }, { width: 12 }]
    transaccionesWS['!cols'] = [{ width: 12 }, { width: 10 }, { width: 25 }, { width: 18 }, { width: 8 }, { width: 35 }]
    analisisWS['!cols'] = [{ width: 12 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 10 }, { width: 18 }, { width: 12 }]

    // Agregar hojas al libro con nombres descriptivos
    XLSX.utils.book_append_sheet(workbook, resumenWS, 'Resumen Ejecutivo')
    XLSX.utils.book_append_sheet(workbook, gastosWS, 'Gastos por Categoría')
    XLSX.utils.book_append_sheet(workbook, transaccionesWS, 'Detalle Transacciones')
    XLSX.utils.book_append_sheet(workbook, analisisWS, 'Análisis Diario')

    // Generar nombre de archivo con formato argentino
    const dateFrom = dateRange?.from ? format(dateRange.from, "dd-MM-yyyy") : "inicio"
    const dateTo = dateRange?.to ? format(dateRange.to, "dd-MM-yyyy") : "fin"
    const filename = `informe-uber-${dateFrom}-al-${dateTo}.xlsx`
    
    // Descargar archivo
    XLSX.writeFile(workbook, filename)

    // Mostrar notificación de éxito
    toast({
      title: "✅ Excel generado exitosamente",
      description: `El archivo "${filename}" se descargó correctamente`,
    })
  }

  // Removed duplicate and incorrect getExpenseIcon implementation

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

  // Combinar y ordenar todas las transacciones
  const allTransactions = [
    ...filteredActivities.map((activity) => ({
      ...activity,
      type: "ganancia" as const,
      amount: activity.totalEarned,
      category: `${formatHours(activity.hoursWorked)} trabajadas`,
      icon: DollarSign,
    })),
    ...filteredExpenses.map((expense) => ({
      ...expense,
      type: "gasto" as const,
      amount: -expense.amount, // Mostrar como negativo para el balance
      category: expense.category,
      icon: getExpenseIcon(expense.category),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Informes</h2>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} showPeriodIndicator={true} />
          <Button onClick={exportToExcel} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalEarned.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              ${netBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(totalHours)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia/Hora</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${earningsPerHour.toFixed(2)}/h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Ganancia</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profitPercentage >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {profitPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Transacciones</CardTitle>
          <CardDescription>Historial completo de ganancias y gastos en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría/Horas</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTransactions.map((transaction) => (
                <TableRow key={`${transaction.type}-${transaction.id}`}>
                  <TableCell>{format(new Date(transaction.date), "dd 'de' MMMM, yyyy", { locale: es })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <transaction.icon
                        className={`h-4 w-4 ${transaction.type === "ganancia" ? "text-green-600" : "text-red-600"}`}
                      />
                      <Badge
                        variant={transaction.type === "ganancia" ? "default" : "destructive"}
                        className={
                          transaction.type === "ganancia"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }
                      >
                        {transaction.type === "ganancia" ? "Ganancia" : "Gasto"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transaction.comment || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          transaction.type === "ganancia"
                            ? handleEditActivity(transaction as DailyActivity)
                            : handleEditExpense(transaction as Expense)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          transaction.type === "ganancia"
                            ? handleDeleteActivity(transaction as DailyActivity)
                            : handleDeleteExpense(transaction as Expense)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {allTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay transacciones en el período seleccionado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
