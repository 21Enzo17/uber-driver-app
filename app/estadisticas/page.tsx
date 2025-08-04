"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, subDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function EstadisticasPage() {
  const [activities, setActivities] = useState<DailyActivity[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
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

  const filterDataByDateRange = (data: any[], dateField: string) => {
    if (!dateRange?.from || !dateRange?.to) return data

    return data.filter((item) => {
      const itemDate = new Date(item[dateField])
      return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! })
    })
  }

  const filteredActivities = filterDataByDateRange(activities, "date")
  const filteredExpenses = filterDataByDateRange(expenses, "date")

  // Datos para gráfico de ganancias por día
  const earningsData = filteredActivities
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((activity) => ({
      date: format(new Date(activity.date), "dd/MM"),
      ganancias: activity.totalEarned,
      horas: activity.hoursWorked,
    }))

  // Datos para gráfico de gastos por categoría
  const expensesByCategory = filteredExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const expensesData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount: amount as number,
    percentage: ((amount as number / filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1),
  }))

  // Datos para gráfico de balance diario
  const balanceData = filteredActivities
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((activity) => {
      const dayExpenses = filteredExpenses
        .filter((expense) => expense.date === activity.date)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return {
        date: format(new Date(activity.date), "dd/MM"),
        ganancias: activity.totalEarned,
        gastos: dayExpenses,
        balance: activity.totalEarned - dayExpenses,
      }
    })

  // Datos para horas trabajadas por semana (lunes a domingo)
  const hoursData = filteredActivities.reduce(
    (acc, activity) => {
      const activityDate = new Date(activity.date)
      const weekStart = startOfWeek(activityDate, { weekStartsOn: 1 })
      const weekLabel = format(weekStart, "'Semana del' dd/MM", { locale: es })
      acc[weekLabel] = (acc[weekLabel] || 0) + activity.hoursWorked
      return acc
    },
    {} as Record<string, number>,
  )

  const weeklyHoursData = Object.entries(hoursData).map(([week, hours]) => ({
    week,
    horas: hours,
  }))

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Estadísticas</h2>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} showPeriodIndicator={true} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ganancias por Día</CardTitle>
            <CardDescription>Evolución de tus ganancias diarias</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ganancias: {
                  label: "Ganancias",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`$${value}`, "Ganancias"]} />
                  <Line
                    type="monotone"
                    dataKey="ganancias"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ fill: "#16a34a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución de tus gastos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Monto",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`$${value}`, "Monto"]} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Diario</CardTitle>
            <CardDescription>Comparación entre ganancias y gastos por día</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                ganancias: {
                  label: "Ganancias",
                  color: "hsl(var(--chart-1))",
                },
                gastos: {
                  label: "Gastos",
                  color: "hsl(var(--chart-2))",
                },
                balance: {
                  label: "Balance",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ganancias" fill="#16a34a" name="Ganancias" />
                  <Bar dataKey="gastos" fill="#dc2626" name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas Trabajadas</CardTitle>
            <CardDescription>Total de horas trabajadas por período</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                horas: {
                  label: "Horas",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [formatHours(Number(value)), "Tiempo"]} />
                  <Bar dataKey="horas" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
