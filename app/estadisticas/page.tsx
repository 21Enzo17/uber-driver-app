"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, subDays, differenceInDays, getDay } from "date-fns"
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

  // NUEVAS ESTADÍSTICAS AVANZADAS

  // 1. Días con más ganancias (Top 5)
  const topEarningDays = filteredActivities
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, 5)
    .map(activity => ({
      date: format(new Date(activity.date), "dd/MM/yyyy", { locale: es }),
      amount: activity.totalEarned,
      hours: activity.hoursWorked
    }))

  // 2. Análisis por día de la semana
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const weekdayStats = dayNames.map((dayName, index) => {
    const dayActivities = filteredActivities.filter(activity => 
      getDay(new Date(activity.date)) === index
    )
    const totalEarnings = dayActivities.reduce((sum, act) => sum + act.totalEarned, 0)
    const totalHours = dayActivities.reduce((sum, act) => sum + act.hoursWorked, 0)
    const avgEarnings = dayActivities.length > 0 ? totalEarnings / dayActivities.length : 0
    const avgHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0
    
    return {
      day: dayName,
      avgEarnings,
      avgHourlyRate,
      workDays: dayActivities.length
    }
  }).sort((a, b) => b.avgEarnings - a.avgEarnings)

  // 3. Análisis de gastos en nafta
  const fuelExpenses = filteredExpenses
    .filter(expense => expense.category === 'Nafta')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const fuelStats = {
    totalSpent: fuelExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    avgFrequency: fuelExpenses.length > 1 ? 
      Math.round(differenceInDays(new Date(fuelExpenses[fuelExpenses.length - 1].date), new Date(fuelExpenses[0].date)) / (fuelExpenses.length - 1)) : 0,
    avgAmount: fuelExpenses.length > 0 ? fuelExpenses.reduce((sum, exp) => sum + exp.amount, 0) / fuelExpenses.length : 0,
    count: fuelExpenses.length
  }

  // 4. Días consecutivos trabajados
  const workDays = filteredActivities
    .map(act => act.date)
    .sort()
  
  let maxStreak = 0
  let currentStreak = 1
  
  for (let i = 1; i < workDays.length; i++) {
    const prevDate = new Date(workDays[i - 1])
    const currentDate = new Date(workDays[i])
    const dayDiff = differenceInDays(currentDate, prevDate)
    
    if (dayDiff === 1) {
      currentStreak++
    } else {
      maxStreak = Math.max(maxStreak, currentStreak)
      currentStreak = 1
    }
  }
  maxStreak = Math.max(maxStreak, currentStreak)

  // 5. Eficiencia general
  const totalEarned = filteredActivities.reduce((sum, act) => sum + act.totalEarned, 0)
  const totalExpensesAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const fuelPercentage = fuelStats.totalSpent > 0 && totalEarned > 0 ? (fuelStats.totalSpent / totalEarned) * 100 : 0
  const daysWorked = filteredActivities.length
  const totalDaysInPeriod = dateRange?.from && dateRange?.to ? 
    differenceInDays(dateRange.to, dateRange.from) + 1 : 0
  const workFrequency = totalDaysInPeriod > 0 ? (daysWorked / totalDaysInPeriod) * 100 : 0

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

      {/* NUEVAS ESTADÍSTICAS AVANZADAS */}
      
      {/* Sección de Estadísticas de Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mejor Día</CardTitle>
          </CardHeader>
          <CardContent>
            {topEarningDays.length > 0 ? (
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${topEarningDays[0].amount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topEarningDays[0].date}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Sin datos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mejor Día de Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {weekdayStats.length > 0 && weekdayStats[0].workDays > 0 ? (
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {weekdayStats[0].day}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${weekdayStats[0].avgEarnings.toFixed(0)} promedio
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Sin datos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Racha Máxima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {maxStreak} días
            </div>
            <p className="text-xs text-muted-foreground">
              Consecutivos trabajados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frecuencia Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {workFrequency.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {daysWorked} de {totalDaysInPeriod} días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Top Días */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top 5 Mejores Días</CardTitle>
            <CardDescription>Tus días con mayores ganancias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEarningDays.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{day.date}</p>
                      <p className="text-xs text-muted-foreground">{formatHours(day.hours)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${day.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {topEarningDays.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay datos para mostrar
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Performance por Día de Semana</CardTitle>
            <CardDescription>Tus días más productivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekdayStats.slice(0, 7).map((stat, index) => (
                <div key={stat.day} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                      {stat.day.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{stat.day}</p>
                      <p className="text-xs text-muted-foreground">{stat.workDays} días trabajados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${stat.avgEarnings.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">${stat.avgHourlyRate.toFixed(0)}/h</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Análisis de Gastos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>⛽ Análisis de Nafta</CardTitle>
            <CardDescription>Estadísticas de combustible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total gastado:</span>
              <span className="font-bold text-red-600">${fuelStats.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cargas realizadas:</span>
              <span className="font-bold">{fuelStats.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Frecuencia:</span>
              <span className="font-bold">
                {fuelStats.avgFrequency > 0 ? `cada ${fuelStats.avgFrequency} días` : 'Sin datos'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Promedio por carga:</span>
              <span className="font-bold">${fuelStats.avgAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">% de ganancias:</span>
              <span className={`font-bold ${fuelPercentage > 30 ? 'text-red-600' : fuelPercentage > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                {fuelPercentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Eficiencia General</CardTitle>
            <CardDescription>Resumen de tu performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Días trabajados:</span>
              <span className="font-bold text-blue-600">{daysWorked}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total ganado:</span>
              <span className="font-bold text-green-600">${totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total gastado:</span>
              <span className="font-bold text-red-600">${totalExpensesAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance neto:</span>
              <span className={`font-bold ${(totalEarned - totalExpensesAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalEarned - totalExpensesAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Promedio por día:</span>
              <span className="font-bold">
                ${daysWorked > 0 ? (totalEarned / daysWorked).toFixed(0) : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📈 Tendencias</CardTitle>
            <CardDescription>Patrones identificados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                🎯 Mejor estrategia
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {weekdayStats.length > 0 && weekdayStats[0].workDays > 0
                  ? `Trabajar los ${weekdayStats[0].day}s (${weekdayStats[0].avgHourlyRate.toFixed(0)}$/h)`
                  : 'Necesitas más datos'}
              </p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ⛽ Control de nafta
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                {fuelPercentage < 20 
                  ? 'Excelente control de combustible' 
                  : fuelPercentage < 30 
                  ? 'Control moderado de combustible'
                  : 'Considera optimizar el uso de nafta'}
              </p>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                📅 Consistencia
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-300">
                {workFrequency > 70 
                  ? 'Muy consistente trabajando' 
                  : workFrequency > 40 
                  ? 'Moderadamente consistente'
                  : 'Podrías trabajar más seguido'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
