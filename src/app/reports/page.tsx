'use client';

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileDown, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { exportToPDF, exportToExcel } from "@/lib/report-export";
import ServicePerformanceChart from "@/components/reports/service-performance-chart";
import VehicleUtilizationChart from "@/components/reports/vehicle-utilization-chart";

// Función para generar datos basados en la fecha
function generateReportData(selectedDate: Date) {
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();
  const year = selectedDate.getFullYear();
  
  // Generar datos únicos basados en la fecha
  const seed = month * 31 + day + year;
  
  // Datos para el gráfico de rendimiento del servicio
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const serviceData = months.map((name, index) => {
    const baseOnTime = 80 + (seed % 20) + (index * 3);
    const baseDelayed = 20 - (seed % 15) - (index * 2);
    return {
      name,
      onTime: Math.min(95, Math.max(75, baseOnTime)),
      delayed: Math.max(5, Math.min(25, baseDelayed)),
    };
  });
  
  // Datos para el gráfico de utilización de vehículos
  const weekDays = ["27 oct", "28 oct", "29 oct", "30 oct", "31 oct", "1 nov", "2 nov"];
  const utilizationData = weekDays.map((name, index) => {
    const baseUtil = 75 + (seed % 15) + (index * 2);
    return {
      name,
      utilization: Math.min(95, Math.max(70, baseUtil % 100)),
    };
  });
  
  // Estadísticas basadas en la fecha
  const totalServices = 200 + (seed % 100);
  const punctualityRate = 85 + (seed % 15);
  const avgUtilization = 70 + (seed % 20);
  
  const change1 = (seed % 20) - 5;
  const change2 = (seed % 15) - 3;
  const change3 = (seed % 12) - 2;
  
  return {
    serviceData,
    utilizationData,
    stats: [
      { 
        title: "Servicios Totales", 
        value: totalServices.toString(), 
        change: `${change1 >= 0 ? '+' : ''}${change1}% vs mes anterior`, 
        changeColor: change1 >= 0 ? "text-green-500" : "text-red-500" 
      },
      { 
        title: "Tasa de Puntualidad", 
        value: `${punctualityRate}%`, 
        change: `${change2 >= 0 ? '+' : ''}${change2}% vs mes anterior`, 
        changeColor: change2 >= 0 ? "text-green-500" : "text-red-500" 
      },
      { 
        title: "Utilización Promedio", 
        value: `${avgUtilization}%`, 
        change: `${change3 >= 0 ? '+' : ''}${change3}% vs mes anterior`, 
        changeColor: change3 >= 0 ? "text-green-500" : "text-red-500" 
      },
    ],
  };
}

export default function ReportsPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    
    const reportData = useMemo(() => generateReportData(selectedDate), [selectedDate]);

    const handleExportPDF = () => {
        exportToPDF({
            selectedDate,
            stats: reportData.stats,
            serviceData: reportData.serviceData,
            utilizationData: reportData.utilizationData,
        });
    };

    const handleExportExcel = async () => {
        await exportToExcel({
            selectedDate,
            stats: reportData.stats,
            serviceData: reportData.serviceData,
            utilizationData: reportData.utilizationData,
        });
    };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Reportes y Analíticas</h1>
            <p className="text-muted-foreground">Analiza el rendimiento y optimiza tus operaciones.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal hidden sm:flex",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                            format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                        ) : (
                            <span>Selecciona una fecha</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleExportExcel}>
                <FileDown className="mr-2"/>
                Exportar Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
                <FileDown className="mr-2"/>
                Exportar PDF
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Rendimiento del Servicio</CardTitle>
                <CardDescription>Servicios a Tiempo vs. Retrasados (Últimos 6 Meses)</CardDescription>
            </CardHeader>
            <CardContent>
                <ServicePerformanceChart data={reportData.serviceData} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Utilización de Vehículos</CardTitle>
                <CardDescription>Porcentaje de Uso Semanal de Vehículos</CardDescription>
            </CardHeader>
            <CardContent>
                <VehicleUtilizationChart data={reportData.utilizationData} />
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportData.stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader>
                    <CardTitle className="text-base font-medium text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold font-headline">{stat.value}</div>
                    <p className={`text-xs ${stat.changeColor} mt-1`}>{stat.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
