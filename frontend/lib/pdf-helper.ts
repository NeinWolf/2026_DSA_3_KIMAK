import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to remove Polish diacritics for jsPDF standard fonts compatibility
export const removePolishDiacritics = (text: string): string => {
  if (!text) return '';
  const map: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  };
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, match => map[match] || match);
};

export const downloadPdfReport = (report: any) => {
  if (!report) return;

  const doc = new jsPDF();

  const title = removePolishDiacritics(report.name || 'Raport');
  const dateRange = removePolishDiacritics(report.dateRange || '');
  const generatedAt = removePolishDiacritics(report.generatedAt || '');
  const generatedBy = removePolishDiacritics(report.generatedBy || 'System');

  // Set title and metadata
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.text(`Zakres dat: ${dateRange}`, 14, 28);
  doc.text(`Wygenerowano: ${generatedAt}`, 14, 34);
  doc.text(`Autor: ${generatedBy}`, 14, 40);

  // Draw horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, 196, 45);

  // Prepare table headers and body depending on report type
  let headers: string[][] = [];
  let body: any[][] = [];

  if (report.type === 'summary') {
    headers = [['Pracownik', 'Laczny czas (h)', 'Ilosc wpisow']];
    body = (report.data || []).map((row: any) => [
      row.username,
      `${row.totalHours}h`,
      row.totalEntries
    ]);
  } else if (report.type === 'detailed') {
    headers = [['Data', 'Pracownik', 'Projekt', 'Zadanie', 'Czas']];
    body = (report.data || []).map((row: any) => [
      row.date,
      row.username,
      row.projectName,
      row.taskName,
      row.duration
    ]);
  } else if (report.type === 'by-project') {
    headers = [['Projekt', 'Laczny czas (h)', 'Ilosc pracownikow']];
    body = (report.data || []).map((row: any) => [
      row.projectName,
      `${row.totalHours}h`,
      row.employeeCount
    ]);
  } else if (report.type === 'by-team') {
    headers = [['Zespol', 'Laczny czas (h)', 'Czlonkowie']];
    body = (report.data || []).map((row: any) => [
      row.teamName,
      `${row.totalHours}h`,
      row.memberCount
    ]);
  }

  // Remove Polish diacritics from all headers and cells
  const cleanHeaders = headers.map(row => row.map(cell => removePolishDiacritics(cell)));
  const cleanBody = body.map(row => row.map(cell => {
    if (cell === null || cell === undefined) return '';
    return removePolishDiacritics(String(cell));
  }));

  // Generate table
  autoTable(doc, {
    startY: 50,
    head: cleanHeaders,
    body: cleanBody,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
    styles: { fontSize: 9 },
  });

  // Save document
  const fileName = `${report.type || 'raport'}_${dateRange.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
