import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from 'docx';
import type { WinnersExportModel } from '../../types/WinnersExportModel';
import { downloadBlob } from '../download/download';

const title = (text: string) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        size: 28, // 14 pt
        bold: true,
      }),
    ],
  });

const meta = (text: string) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        size: 24, // 12 pt
      }),
    ],
  });

const headerCell = (text: string) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 24, // 12 pt
            bold: true,
          }),
        ],
      }),
    ],
  });

const bodyCell = (text: string) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 24, // 12 pt
          }),
        ],
      }),
    ],
  });

export async function exportDocx(model: WinnersExportModel) {
  const doc = new Document({
    sections: [
      {
        children: [
          title(`Spil: Uge ${model.week} – ${model.year}`),
          meta(`Antal vindere: ${model.totalWinners}`),
          meta(`Samlet omsætning: ${model.totalRevenue},-`),
          new Paragraph(''),

          new Table({
            rows: [
              new TableRow({
                children: ['Navn', 'Antal spil', 'Total brugt', 'Vinder tal'].map(headerCell),
              }),

              ...model.rows.map(
                (r) =>
                  new TableRow({
                    children: [r.name, r.plays.toString(), `${r.spent},-`, r.numbers].map(bodyCell),
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${model.week}_${model.year}_vindere.docx`);
}
