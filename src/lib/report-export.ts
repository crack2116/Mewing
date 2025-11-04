import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportData {
  selectedDate: Date;
  stats: Array<{
    title: string;
    value: string;
    change: string;
  }>;
  serviceData: Array<{
    name: string;
    onTime: number;
    delayed: number;
  }>;
  utilizationData: Array<{
    name: string;
    utilization: number;
  }>;
}

export function exportToPDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), "d/M/yy, HH:mm"), 14, 15);
  doc.text("Reporte - Mewing", pageWidth - 14, 15, { align: 'right' });
  
  // Company title - using text for truck icon
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 255);
  doc.setFont('helvetica', 'bold');
  // Draw a simple truck icon (red square)
  doc.setFillColor(255, 0, 0);
  doc.rect(14, 22, 5, 5, 'F');
  doc.text('Mewing Transport Manager', 21, 27);
  
  // Report date
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha del Reporte: ${format(data.selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}`, 14, 37);
  doc.text(`Generado: ${format(new Date(), "d/M/yyyy, HH:mm:ss")}`, 14, 44);
  
  // Main title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Transporte', pageWidth / 2, 58, { align: 'center' });
  
  let yPos = 70;
  
  // KPIs Section - Cards
  const cardWidth = 55;
  const cardHeight = 28;
  const spacing = 60;
  const startX = 14;
  
  data.stats.forEach((stat, index) => {
    const xPos = startX + (index * spacing);
    
    // Card background (light gray)
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'FD');
    
    // Title
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.title, xPos + 5, yPos + 10);
    
    // Value
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, xPos + 5, yPos + 22);
    
    // Change
    doc.setFontSize(8);
    doc.setTextColor(0, 150, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.change, xPos + 5, yPos + 26);
  });
  
  yPos += 45;
  
  // Service Performance Section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 255);
  doc.setFont('helvetica', 'bold');
  // Blue underline
  doc.setDrawColor(0, 0, 255);
  doc.setLineWidth(0.5);
  doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
  doc.text('Rendimiento del Servicio - Últimos 6 Meses', 14, yPos);
  
  yPos += 12;
  
  // Table headers
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Mes', 14, yPos);
  doc.text('Servicios a Tiempo (%)', 50, yPos);
  doc.text('Servicios Retrasados (%)', 120, yPos);
  
  // Table header line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);
  
  yPos += 8;
  
  // Table data
  doc.setFont('helvetica', 'normal');
  data.serviceData.forEach((row) => {
    doc.text(row.name, 14, yPos);
    doc.text(`${Math.round(row.onTime)}%`, 50, yPos);
    doc.text(`${Math.round(row.delayed)}%`, 120, yPos);
    
    // Row separator line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);
    
    yPos += 7;
  });
  
  // Footer page 1
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('about:blank', 14, pageHeight - 10);
  doc.text('1/2', pageWidth - 14, pageHeight - 10, { align: 'right' });
  
  // PAGE 2 - Vehicle Utilization
  doc.addPage();
  
  // Header page 2
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), "d/M/yy, HH:mm"), 14, 15);
  doc.text("Reporte - Mewing", pageWidth - 14, 15, { align: 'right' });
  
  yPos = 30;
  
  // Vehicle Utilization Section
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 255);
  doc.setFont('helvetica', 'bold');
  // Blue underline
  doc.setDrawColor(0, 0, 255);
  doc.setLineWidth(0.5);
  doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);
  doc.text('Utilización de Vehículos - Última Semana', 14, yPos);
  
  yPos += 12;
  
  // Table headers
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha', 14, yPos);
  doc.text('Utilización (%)', 100, yPos);
  
  // Table header line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);
  
  yPos += 8;
  
  // Table data - Convert dates from format "27 oct" to "27/10/2025"
  doc.setFont('helvetica', 'normal');
  data.utilizationData.forEach((row, index) => {
    // Parse the date name (e.g., "27 oct" -> "27/10/2025")
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const parts = row.name.toLowerCase().split(' ');
    const day = parseInt(parts[0]);
    const monthName = parts[1];
    const monthIndex = monthNames.indexOf(monthName);
    
    if (monthIndex === -1) {
      // Fallback if month name not found
      doc.text(row.name, 14, yPos);
    } else {
      // Calculate date based on selected date
      const reportDate = new Date(data.selectedDate);
      let year = reportDate.getFullYear();
      
      // If the month in the data is greater than the report month, it's from the previous year
      // For example, if report is November (10) and data is October (9), it's same year
      // But if report is January (0) and data is December (11), it's previous year
      if (monthIndex > reportDate.getMonth()) {
        year = year - 1;
      }
      
      // Special case: if we're in early months and data shows late months, it's from previous year
      // This handles cases like being in January but showing October-November data
      if (reportDate.getMonth() < 3 && monthIndex >= 9) {
        year = year - 1;
      }
      
      const dateStr = day < 10 ? `0${day}` : day.toString();
      const monthStr = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : (monthIndex + 1).toString();
      const formattedDate = `${dateStr}/${monthStr}/${year}`;
      
      doc.text(formattedDate, 14, yPos);
    }
    
    doc.text(`${Math.round(row.utilization)}%`, 100, yPos);
    
    // Row separator line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(14, yPos + 3, pageWidth - 14, yPos + 3);
    
    yPos += 7;
  });
  
  // Footer page 2
  yPos = pageHeight - 30;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${format(data.selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} - Mewing Transport Manager`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Este es un reporte generado automáticamente por el sistema de gestión de transporte.', pageWidth / 2, yPos, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('about:blank', 14, pageHeight - 10);
  doc.text('2/2', pageWidth - 14, pageHeight - 10, { align: 'right' });
  
  // Save PDF
  doc.save(`Reporte_Transporte_${format(data.selectedDate, 'yyyy-MM-dd')}.pdf`);
}

export async function exportToExcel(data: ReportData) {
  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Mewing Transport Manager';
  workbook.created = new Date();
  
  // Sheet 1: Summary Report
  const summarySheet = workbook.addWorksheet('Reporte');
  
  // Header
  const headerRow1 = summarySheet.addRow(['Mewing Transport Manager', '', '']);
  headerRow1.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF0066CC' } };
  headerRow1.height = 25;
  
  const dateRow1 = summarySheet.addRow(['Fecha del Reporte:', format(data.selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }), '']);
  dateRow1.getCell(1).font = { bold: true };
  
  const dateRow2 = summarySheet.addRow(['Generado:', format(new Date(), "d/M/yyyy, HH:mm:ss"), '']);
  dateRow2.getCell(1).font = { bold: true };
  
  summarySheet.addRow([]);
  
  // Main title
  const titleRow = summarySheet.addRow(['Reporte de Transporte', '', '']);
  titleRow.getCell(1).font = { bold: true, size: 18 };
  titleRow.getCell(1).alignment = { horizontal: 'center' };
  summarySheet.mergeCells(`A${titleRow.number}:C${titleRow.number}`);
  titleRow.height = 30;
  
  summarySheet.addRow([]);
  
  // KPIs Section
  const kpiHeaderRow = summarySheet.addRow(['INDICADORES CLAVE (KPIs)', '', '']);
  kpiHeaderRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  kpiHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };
  kpiHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.mergeCells(`A${kpiHeaderRow.number}:C${kpiHeaderRow.number}`);
  kpiHeaderRow.height = 25;
  
  // KPI rows
  data.stats.forEach((stat, index) => {
    const row = summarySheet.addRow([stat.title, stat.value, stat.change]);
    
    // Title cell
    row.getCell(1).font = { bold: true };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
    row.getCell(1).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Value cell
    row.getCell(2).font = { bold: true, size: 14 };
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(2).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Change cell
    row.getCell(3).font = { color: { argb: 'FF00AA00' } };
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF0' } };
    row.getCell(3).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    row.height = 22;
  });
  
  summarySheet.addRow([]);
  
  // Service Performance Section
  const serviceHeaderRow = summarySheet.addRow(['Rendimiento del Servicio - Últimos 6 Meses', '', '']);
  serviceHeaderRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
  serviceHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  serviceHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  serviceHeaderRow.getCell(1).border = {
    top: { style: 'medium' },
    bottom: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' }
  };
  summarySheet.mergeCells(`A${serviceHeaderRow.number}:C${serviceHeaderRow.number}`);
  serviceHeaderRow.height = 25;
  
  // Table headers
  const tableHeaderRow = summarySheet.addRow(['Mes', 'Servicios a Tiempo (%)', 'Servicios Retrasados (%)']);
  tableHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  tableHeaderRow.height = 20;
  
  // Table data
  data.serviceData.forEach((row) => {
    const dataRow = summarySheet.addRow([row.name, Math.round(row.onTime), Math.round(row.delayed)]);
    dataRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    dataRow.getCell(1).alignment = { horizontal: 'center' };
    dataRow.getCell(1).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    dataRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
    dataRow.getCell(2).alignment = { horizontal: 'center' };
    dataRow.getCell(2).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    dataRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
    dataRow.getCell(3).alignment = { horizontal: 'center' };
    dataRow.getCell(3).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    dataRow.height = 18;
  });
  
  // Set column widths
  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 25;
  summarySheet.getColumn(3).width = 28;
  
  // Sheet 2: Vehicle Utilization
  const utilizationSheet = workbook.addWorksheet('Utilización');
  
  const utilHeaderRow = utilizationSheet.addRow(['Utilización de Vehículos - Última Semana', '']);
  utilHeaderRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF0066CC' } };
  utilHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F2FF' } };
  utilHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  utilHeaderRow.getCell(1).border = {
    top: { style: 'medium' },
    bottom: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' }
  };
  utilizationSheet.mergeCells(`A${utilHeaderRow.number}:B${utilHeaderRow.number}`);
  utilHeaderRow.height = 25;
  
  utilizationSheet.addRow([]);
  
  // Table headers
  const utilTableHeaderRow = utilizationSheet.addRow(['Fecha', 'Utilización (%)']);
  utilTableHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  utilTableHeaderRow.height = 20;
  
  // Table data
  data.utilizationData.forEach((row) => {
    // Parse the date name (e.g., "27 oct" -> "27/10/2025")
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const parts = row.name.toLowerCase().split(' ');
    const day = parseInt(parts[0]);
    const monthName = parts[1];
    const monthIndex = monthNames.indexOf(monthName);
    
    let formattedDate = row.name;
    if (monthIndex !== -1) {
      const reportDate = new Date(data.selectedDate);
      let year = reportDate.getFullYear();
      
      if (monthIndex > reportDate.getMonth()) {
        year = year - 1;
      }
      
      if (reportDate.getMonth() < 3 && monthIndex >= 9) {
        year = year - 1;
      }
      
      const dateStr = day < 10 ? `0${day}` : day.toString();
      const monthStr = (monthIndex + 1) < 10 ? `0${monthIndex + 1}` : (monthIndex + 1).toString();
      formattedDate = `${dateStr}/${monthStr}/${year}`;
    }
    
    const dataRow = utilizationSheet.addRow([formattedDate, Math.round(row.utilization)]);
    dataRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    dataRow.getCell(1).alignment = { horizontal: 'center' };
    dataRow.getCell(1).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    dataRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } };
    dataRow.getCell(2).alignment = { horizontal: 'center' };
    dataRow.getCell(2).numFmt = '0"%';
    dataRow.getCell(2).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    dataRow.height = 18;
  });
  
  // Set column widths
  utilizationSheet.getColumn(1).width = 20;
  utilizationSheet.getColumn(2).width = 20;
  
  // Save Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_Transporte_${format(data.selectedDate, 'yyyy-MM-dd')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

