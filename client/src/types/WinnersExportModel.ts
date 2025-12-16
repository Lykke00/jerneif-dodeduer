import type { GameExtendedDto, UserWinnerDto } from '../generated-ts-client';

export type WinnersExportModel = {
  week: number;
  year: number;
  totalWinners: number;
  totalRevenue: number;
  rows: {
    name: string;
    plays: number;
    spent: number;
    numbers: string;
  }[];
};

export function mapToExportModel(
  game: GameExtendedDto,
  winners: UserWinnerDto[]
): WinnersExportModel {
  return {
    week: game.week,
    year: game.year,
    totalWinners: winners.length,
    totalRevenue: winners.reduce((s, w) => s + (w.totalSpent ?? 0), 0),
    rows: winners.map((w) => ({
      name: w.fullName ?? 'Ukendt',
      plays: w.winningPlays ?? 0,
      spent: w.totalSpent ?? 0,
      numbers: (w.playedNumbers?.[0] ?? []).join(' '),
    })),
  };
}
