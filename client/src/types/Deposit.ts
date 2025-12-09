export interface Deposit {
  id: string;
  amount: number;
  preview: string | null;
  file: File | undefined;
  status: 'pending' | 'approved' | 'declined';
  date?: Date;
}
