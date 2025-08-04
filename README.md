# 🚗 Uber Driver Manager

Una aplicación web moderna y completa para la gestión financiera de conductores de Uber. Registra tus ganancias, controla tus gastos y obtén estadísticas detalladas para optimizar tu trabajo.

![Dashboard Preview](https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Uber+Driver+Manager)

## ✨ Características Principales

### 📊 **Dashboard Inteligente**
- **Métricas en tiempo real**: Total ganado, gastado, balance neto
- **Análisis temporal**: Comparativas semanales y por período personalizado
- **KPIs clave**: Ganancia por hora, % de ganancia, días trabajados
- **Período por defecto**: Últimos 7 días para seguimiento diario

### 📝 **Registro de Actividades**
- **Registro diario**: Fecha, ganancias totales, horas trabajadas
- **Comentarios opcionales**: Notas sobre el día de trabajo
- **Formato inteligente de horas**: 8h 30min en lugar de decimales confusos
- **Validación de datos**: Previene errores de entrada

### 💰 **Control de Gastos**
- **Categorías predefinidas**: Nafta, Comida, Mantenimiento, Peajes, Lavado
- **Tracking detallado**: Fecha, monto, categoría, comentarios
- **Análisis por categoría**: Distribución porcentual de gastos

### 📈 **Estadísticas Avanzadas**
- **🏆 Top Performance**: Mejores días, días de semana más rentables
- **⛽ Análisis de Nafta**: Frecuencia de carga, promedio por carga, % de ganancias
- **🔥 Rachas de Trabajo**: Días consecutivos trabajados, frecuencia laboral
- **📊 Eficiencia**: Gasto promedio, balance neto, recomendaciones inteligentes
- **📅 Patrones**: Identificación automática de tendencias

### 📋 **Informes Detallados**
- **Exportación a Excel**: Informes completos con múltiples hojas
- **Historial de transacciones**: Vista cronológica de todas las actividades
- **Análisis diario**: Performance día por día con métricas clave
- **Resumen ejecutivo**: Métricas consolidadas del período

### 🎯 **Características Técnicas**
- **Responsive Design**: Funciona perfectamente en móvil y desktop
- **Almacenamiento Local**: Todos tus datos se guardan en tu navegador
- **Períodos Flexibles**: Esta semana, mes pasado, últimos 30 días, rangos personalizados
- **Indicadores Inteligentes**: Muestra qué período estás visualizando
- **Modo Oscuro**: Interfaz adaptable a tus preferencias

## 🚀 Tecnologías Utilizadas

- **Framework**: Next.js 15.2.4 con React 19
- **Styling**: Tailwind CSS 4.1.9 con componentes shadcn/ui
- **Lenguaje**: TypeScript para mayor robustez
- **Iconos**: Lucide React para iconografía moderna
- **Gráficos**: Recharts para visualizaciones interactivas
- **Fechas**: date-fns con localización en español
- **Exportación**: XLSX para reportes en Excel
- **Notificaciones**: Sonner para feedback al usuario

## 📦 Instalación

### Prerrequisitos
- Node.js 18 o superior
- npm, yarn o pnpm

### Pasos de instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/21Enzo17/uber-driver-app.git
cd uber-driver-app
```

2. **Instala las dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Ejecuta en modo desarrollo**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. **Abre en tu navegador**
```
http://localhost:3000
```

## 🌐 Deploy en Netlify

Este proyecto está optimizado para deploy en Netlify con configuración automática.

1. **Conecta tu repositorio a Netlify**
2. **Configuración automática**: El archivo `netlify.toml` maneja todo
3. **Build command**: `npm run build`
4. **Publish directory**: `out`

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/21Enzo17/uber-driver-app)

## 📱 Uso de la Aplicación

### 1. **Registro de Actividades**
- Ve a la pestaña "Registro"
- Completa fecha, ganancias totales y tiempo trabajado
- Agrega comentarios opcionales sobre el día
- Los datos se guardan automáticamente

### 2. **Control de Gastos**
- En la misma pestaña "Registro"
- Selecciona categoría (Nafta, Comida, etc.)
- Ingresa monto y comentarios
- Tracking automático por categorías

### 3. **Análisis en Dashboard**
- Vista general con métricas clave
- Comparativas semanales automáticas
- Cambio de períodos con un click

### 4. **Estadísticas Avanzadas**
- Accede a "Estadísticas" para análisis profundo
- Identifica patrones y oportunidades de mejora
- Recomendaciones basadas en tus datos

### 5. **Generación de Informes**
- Ve a "Informes" para vista detallada
- Exporta a Excel con un click
- Múltiples hojas con diferentes análisis

## 💡 Consejos de Uso

### **Para Maximizar Ganancias**
- 📊 Revisa las estadísticas semanalmente
- 🏆 Identifica tus mejores días y horarios
- ⛽ Controla el % de nafta (ideal < 20%)
- 📅 Mantén consistencia en días trabajados

### **Para Control Financiero**
- 📝 Registra TODOS los gastos, no solo nafta
- 💰 Usa la función de comentarios para detalles
- 📋 Exporta informes mensuales para declaraciones
- 🎯 Establece metas semanales/mensuales

## 🛠️ Estructura del Proyecto

```
uber-driver-app/
├── app/                      # Páginas principales (App Router)
│   ├── page.tsx             # Dashboard principal
│   ├── registro/            # Registro de actividades y gastos
│   ├── informes/            # Informes y exportación
│   ├── estadisticas/        # Estadísticas avanzadas
│   └── layout.tsx           # Layout principal
├── components/              # Componentes reutilizables
│   ├── ui/                  # Componentes base (shadcn/ui)
│   ├── app-sidebar.tsx      # Navegación lateral
│   ├── date-range-picker.tsx # Selector de períodos
│   └── edit-*.tsx           # Dialogs de edición
├── lib/                     # Utilidades
├── public/                  # Archivos estáticos
└── styles/                  # Estilos globales
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🐛 Reportar Bugs

Si encuentras algún error o tienes sugerencias:

1. Revisa si ya existe un issue similar
2. Crea un nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducirlo
   - Capturas de pantalla si es visual
   - Información del navegador/dispositivo

## 🎯 Roadmap

### **Próximas características**
- [ ] 📱 Progressive Web App (PWA)
- [ ] ☁️ Sincronización en la nube opcional
- [ ] 📊 Más tipos de gráficos interactivos
- [ ] 🎯 Sistema de metas y objetivos
- [ ] 📧 Reportes automáticos por email
- [ ] 🌍 Soporte multi-idioma

### **Mejoras planificadas**
- [ ] 🔍 Búsqueda avanzada en transacciones
- [ ] 📅 Recordatorios de registro
- [ ] 🎨 Temas personalizables
- [ ] 📈 Predicciones basadas en IA
- [ ] 🔐 Backup y restore de datos

## 💬 Soporte

- **Documentación**: Este README y comentarios en el código
- **Issues**: [GitHub Issues](https://github.com/21Enzo17/uber-driver-app/issues)
- **Contacto**: [Tu email o social media]

---

**Desarrollado con ❤️ para la comunidad de conductores de Uber**

*¡Optimiza tu trabajo, maximiza tus ganancias!* 🚗💨
