export interface WalletInfo {
  type: 'DANA' | 'OVO' | 'LINKAJA' | 'GOPAY';
  number: string;
  name: string;
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface UserState {
  id: string; // ID unik user (bisa random string atau phone number)
  name: string; // Nama Lengkap
  phoneNumber: string; // Nomor Ponsel (Unik, digunakan untuk login)
  password: string; // Kata sandi
  balance: number;
  piggyBank: number;
  invested: number;
  lastCheckIn: string | null;
  tasksCompleted: number[];
  energy: number; // For playing games
  wallet: WalletInfo | null;
  spinChances: number; // Jumlah kesempatan spin yang dimiliki
  referrerId: string | null; // Kode referral atasan (jika ada)
  totalTurnover: number; // Total taruhan rollingan hari ini
  referralCommission: number; // Komisi yang bisa diklaim
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'GAME_WIN' | 'GAME_LOSS' | 'BONUS' | 'INVEST' | 'PIGGY' | 'REFERRAL_BONUS' | 'VOUCHER';
  amount: number;
  date: string;
  description: string;
  status?: TransactionStatus; // Status transaksi
  walletData?: WalletInfo; // Snapshot wallet saat request
}

export interface Voucher {
  code: string;
  amount: number;
  isUsed: boolean;
  usedBy?: string;
}

export interface AdminSettings {
  gameWinRate: number; // 0.1 - 0.9 (Difficulty)
  globalMessage: string; // Running text
}

export interface InvestmentNews {
  trend: 'UP' | 'DOWN' | 'STABLE';
  percentage: number;
  message: string;
}

export enum Tab {
  HOME = 'HOME',
  GAMES = 'GAMES',
  INVEST = 'INVEST',
  PROFILE = 'PROFILE',
  EVENTS = 'EVENTS',
  TASKS = 'TASKS',
  TOPUP = 'TOPUP',
  WITHDRAW = 'WITHDRAW',
  LEADERBOARD = 'LEADERBOARD',
  REFERRAL = 'REFERRAL'
}

export interface GameResult {
  won: boolean;
  amount: number;
}