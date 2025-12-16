import * as XLSX from 'xlsx';
import type { WinnersExportModel } from '../../types/WinnersExportModel';

export function exportXlsx(model: WinnersExportModel) {
  const data = [
    [`Spil: Uge ${model.week} – ${model.year}`],
    [`Antal vindere: ${model.totalWinners}`],
    [`Samlet omsætning: ${model.totalRevenue},-`],
    [],
    ['Navn', 'Antal spil', 'Total brugt', 'Vinder tal'],
    ...model.rows.map((r) => [r.name, r.plays, `${r.spent},-`, r.numbers]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Vindere');
  XLSX.writeFile(wb, `${model.week}_${model.year}_vindere.xlsx`);
}
