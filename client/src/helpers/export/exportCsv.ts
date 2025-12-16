import type { WinnersExportModel } from '../../types/WinnersExportModel';
import { download } from '../download/download';

export function exportCsv(model: WinnersExportModel) {
  const lines = [
    `Spil: Uge ${model.week} – ${model.year}`,
    `Antal vindere: ${model.totalWinners}`,
    `Samlet omsætning: ${model.totalRevenue},-`,
    '',
    'Navn,Antal spil,Total brugt,Vinder tal',
    ...model.rows.map((r) => `"${r.name}",${r.plays},"${r.spent},-","${r.numbers}"`),
  ];

  const csvContent = '\uFEFF' + lines.join('\n');

  download(csvContent, `${model.week}_${model.year}_vindere.csv`, 'text/csv;charset=utf-8;');
}
