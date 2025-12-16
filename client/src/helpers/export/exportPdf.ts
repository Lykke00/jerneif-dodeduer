import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WinnersExportModel } from '../../types/WinnersExportModel';

export function exportPdf(model: WinnersExportModel) {
  const doc = new jsPDF();

  doc.text(`Spil: Uge ${model.week} – ${model.year}`, 14, 14);
  doc.text(`Antal vindere: ${model.totalWinners}`, 14, 22);
  doc.text(`Samlet omsætning: ${model.totalRevenue},-`, 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [['Navn', 'Antal spil', 'Total brugt', 'Vinder tal']],
    body: model.rows.map((r) => [r.name, r.plays, `${r.spent},-`, r.numbers]),
  });

  doc.save(`${model.week}_${model.year}_vindere.pdf`);
}
