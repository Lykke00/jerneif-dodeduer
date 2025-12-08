export interface Deposit {
  id: string;
  amount: number;
  preview: string | null;
  status: 'pending' | 'approved' | 'declined';
  date?: Date;
}
