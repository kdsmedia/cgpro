import React, { useState, useEffect } from 'react';
import { 
  Home, Gamepad2, TrendingUp, User, Wallet, PiggyBank, 
  CheckCircle, CalendarCheck, RefreshCw, Trophy, Bell, ArrowLeft, PlayCircle,
  Eraser, Grid3x3, Dices, Brain, Activity, Bomb, Zap,
  Fish, Apple, Rocket, Crown, CircleDot, Car, ShieldCheck, Spade, Puzzle, Skull,
  Flame, Coins, Clover, Gem, Sparkles, Scroll, Ghost,
  Lollipop, Star, Dog, Mountain, Sword, ChevronRight, Calendar, Share2, Users, Gift, Percent, Disc,
  Ticket, ClipboardList, Target, Medal, CreditCard, Clock, QrCode, Smartphone, Landmark, Check, Menu, LogOut, LayoutGrid, X, Loader2, Copy, Link, Lock, Eye, EyeOff, UserPlus, LogIn, Search, Settings, Megaphone, Trash2, Info, AlertTriangle, AlertCircle
} from 'lucide-react';
import { UserState, Transaction, Tab, WalletInfo, Voucher, AdminSettings, TransactionStatus } from './types';
import { MonetagBanner, MonetagInterstitial } from './components/AdComponents';
import { DailyRoulette } from './components/Games';

// Firebase Imports
import { db } from './firebaseConfig';
import { 
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, 
  onSnapshot, runTransaction, addDoc, orderBy, limit, serverTimestamp, deleteDoc 
} from "firebase/firestore";

// --- Constants ---
const DAILY_CHECKIN_REWARD = 100;
const INITIAL_BALANCE = 500;
const PIGGY_DEDUCTION_RATE = 0.1; 
const WITHDRAW_FEE = 0; 

// Referral Config
const REFERRAL_BONUS_DOWNLINE = 1000; 
const REFERRAL_BONUS_UPLINE = 2500;   
const ROLLING_COMMISSION_PERCENT = 0.005; 

// Admin Credentials
const ADMIN_PHONE = '085813899649';
const ADMIN_PASS = 'Kdsmedia@123';

const INITIAL_SPLASH_DURATION = 2000;
const TRANSITION_DURATION = 1500;

type AdIntent = 'RANDOM_REWARD' | 'FREE_SPIN';

// --- CUSTOM POPUP COMPONENTS ---
interface CustomAlertProps {
    isOpen: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ isOpen, message, type = 'info', onClose }) => {
    if (!isOpen) return null;

    const bgIcon = type === 'success' ? 'bg-green-500/20' : type === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20';
    const textIcon = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400';
    const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-in-center animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`p-4 rounded-full ${bgIcon} ${textIcon} shadow-[0_0_15px_currentColor]`}>
                        <Icon size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            {type === 'success' ? 'Berhasil!' : type === 'error' ? 'Gagal!' : 'Info'}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition text-white mt-2 active:scale-95"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

interface CustomConfirmProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const CustomConfirm: React.FC<CustomConfirmProps> = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-in-center animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_currentColor]">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Konfirmasi</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                        <button 
                            onClick={onCancel} 
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition text-gray-300 active:scale-95"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition text-white shadow-lg shadow-blue-500/30 active:scale-95"
                        >
                            Ya, Lanjut
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: SPLASH SCREEN ---
const SplashScreen: React.FC<{ duration: number; message: string; subMessage?: string; onFinish: () => void }> = ({ duration, message, subMessage, onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onFinish();
      }
    }, 100); 

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(52,211,153,0.4)] animate-bounce">
                <span className="font-black text-4xl text-white tracking-tighter">CG</span>
            </div>
            
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Cuan<span className="text-green-400">Game</span> Pro</h1>
            <p className="text-gray-400 text-sm mb-12 animate-pulse">{message}</p>

            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden relative border border-white/10">
                <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-600 shadow-[0_0_10px_#34d399] transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-mono">{Math.floor(progress)}%</div>

            {subMessage && (
                <div className="mt-8 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <p className="text-xs text-gray-300 italic">💡 Info: {subMessage}</p>
                </div>
            )}
        </div>
    </div>
  );
};

// --- COMPONENT: AUTH SCREEN ---
const AuthScreen: React.FC<{ onLogin: (user: UserState | 'ADMIN') => void, notify: (msg: string, type: 'success'|'error'|'info') => void }> = ({ onLogin, notify }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    referral: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!form.phone || !form.password) return notify("Mohon lengkapi data!", 'error');
    
    // ADMIN CHECK
    if (mode === 'LOGIN' && form.phone === ADMIN_PHONE && form.password === ADMIN_PASS) {
        setLoading(true);
        setTimeout(() => {
            onLogin('ADMIN');
            setLoading(false);
        }, 1000);
        return;
    }

    if (mode === 'REGISTER' && !form.name) return notify("Masukkan nama lengkap!", 'error');

    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const userRef = doc(db, "users", form.phone);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data() as UserState;
            if (userData.password === form.password) {
                // Update Last Login
                onLogin(userData);
            } else {
                notify("Kata sandi salah!", 'error');
            }
        } else {
            notify("Nomor ponsel tidak ditemukan!", 'error');
        }
      } else {
        // REGISTER
        const userRef = doc(db, "users", form.phone);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            notify("Nomor ponsel sudah terdaftar!", 'error');
            setLoading(false);
            return;
        }

        // Transaction to handle registration & referral bonus atomically
        await runTransaction(db, async (transaction) => {
             let initialBalance = INITIAL_BALANCE;
             let referrerId: string | null = null;
             let referrerBonusMsg = "";

             if (form.referral) {
                // Find upline by their REFERRAL CODE (User ID)
                const q = query(collection(db, "users"), where("id", "==", form.referral));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const uplineDoc = querySnapshot.docs[0];
                    const uplineData = uplineDoc.data() as UserState;
                    
                    // Bonus Upline
                    const newUplineBalance = uplineData.balance + REFERRAL_BONUS_UPLINE;
                    transaction.update(uplineDoc.ref, { balance: newUplineBalance });

                    // Add Notification/Transaction to Upline (Optional, kept simple)
                    const uplineTxRef = doc(collection(db, `users/${uplineData.phoneNumber}/transactions`));
                    transaction.set(uplineTxRef, {
                        type: 'REFERRAL_BONUS',
                        amount: REFERRAL_BONUS_UPLINE,
                        date: new Date().toLocaleTimeString(),
                        description: 'Bonus Referral bawahan baru',
                        id: Date.now().toString()
                    });

                    initialBalance += REFERRAL_BONUS_DOWNLINE;
                    referrerId = uplineData.id;
                    referrerBonusMsg = `\nBonus Referral +Rp ${REFERRAL_BONUS_DOWNLINE}`;
                } 
             }

             const newUserId = Math.floor(1000000 + Math.random() * 9000000).toString();
             const newUser: UserState = {
                id: newUserId,
                name: form.name,
                phoneNumber: form.phone,
                password: form.password,
                balance: initialBalance,
                piggyBank: 0,
                invested: 0,
                lastCheckIn: null,
                tasksCompleted: [],
                energy: 100,
                wallet: null,
                spinChances: 0,
                referrerId: referrerId,
                totalTurnover: 0,
                referralCommission: 0
            };

            transaction.set(userRef, newUser);
            
            // Add Initial Transaction record for new user
            const userTxRef = doc(collection(db, `users/${form.phone}/transactions`));
            transaction.set(userTxRef, {
                type: 'BONUS',
                amount: initialBalance,
                date: new Date().toLocaleTimeString(),
                description: 'Bonus Pendaftaran',
                id: Date.now().toString()
            });
        });

        notify("Pendaftaran Berhasil!", 'success');
        // Fetch fresh data
        const newUserSnap = await getDoc(userRef);
        onLogin(newUserSnap.data() as UserState);
      }
    } catch (e) {
        console.error("Auth Error", e);
        notify("Terjadi kesalahan koneksi database.", 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px]"></div>

        <div className="w-full max-w-sm relative z-10">
            <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-bounce">
                    <span className="font-black text-3xl text-white">CG</span>
                </div>
                <h1 className="text-3xl font-black text-white">Cuan<span className="text-green-400">Game</span></h1>
                <p className="text-gray-400 text-sm mt-2">{mode === 'LOGIN' ? 'Masuk untuk mulai hasilkan uang' : 'Daftar sekarang & klaim bonus'}</p>
            </div>

            <div className="glass-card p-6 space-y-4 border border-white/10 shadow-2xl bg-black/40">
                {mode === 'REGISTER' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 ml-1">Nama Lengkap</label>
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-3 focus-within:border-green-500 transition">
                            <User size={18} className="text-gray-500 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Nama Anda"
                                className="bg-transparent w-full text-white text-sm outline-none placeholder-gray-600"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">Nomor Ponsel</label>
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-3 focus-within:border-green-500 transition">
                        <Smartphone size={18} className="text-gray-500 mr-2" />
                        <input 
                            type="tel" 
                            placeholder="Contoh: 0812..."
                            className="bg-transparent w-full text-white text-sm outline-none placeholder-gray-600"
                            value={form.phone}
                            onChange={e => setForm({...form, phone: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">Kata Sandi</label>
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-3 focus-within:border-green-500 transition">
                        <Lock size={18} className="text-gray-500 mr-2" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="******"
                            className="bg-transparent w-full text-white text-sm outline-none placeholder-gray-600"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                        />
                        <button onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                        </button>
                    </div>
                </div>

                {mode === 'REGISTER' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 ml-1">Kode Referral (Opsional)</label>
                        <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-3 focus-within:border-yellow-500 transition border-dashed">
                            <Ticket size={18} className="text-yellow-500 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Masukkan kode teman"
                                className="bg-transparent w-full text-yellow-100 text-sm outline-none placeholder-gray-600"
                                value={form.referral}
                                onChange={e => setForm({...form, referral: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (mode === 'LOGIN' ? <><LogIn size={18}/> Masuk</> : <><UserPlus size={18}/> Daftar</>)}
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                    {mode === 'LOGIN' ? "Belum punya akun?" : "Sudah punya akun?"} 
                    <button 
                        onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setForm({...form, referral: ''}); }}
                        className="text-green-400 font-bold ml-1 hover:underline"
                    >
                        {mode === 'LOGIN' ? "Daftar Disini" : "Masuk Sini"}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

// --- COMPONENT: ADMIN PANEL ---
const AdminPanel: React.FC<{ onLogout: () => void, notify: (msg: string, type: 'success'|'error'|'info') => void, confirm: (msg: string, cb: () => void) => void }> = ({ onLogout, notify, confirm }) => {
    const [adminTab, setAdminTab] = useState<'DASHBOARD'|'USERS'|'WITHDRAW'|'TOPUP'|'VOUCHER'|'SETTINGS'>('DASHBOARD');
    const [searchQuery, setSearchQuery] = useState('');
    const [voucherForm, setVoucherForm] = useState({ amount: 10000 });
    
    // Live Data
    const [stats, setStats] = useState({ userCount: 0, activeVouchers: 0, pendingWithdraw: 0 });
    const [users, setUsers] = useState<UserState[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [settings, setSettings] = useState<AdminSettings>({ gameWinRate: 0.3, globalMessage: '' });

    // Listeners
    useEffect(() => {
        // Users (Limit to 50 for performance if list huge)
        const qUsers = query(collection(db, "users"), limit(50)); 
        const unsubUsers = onSnapshot(qUsers, (snap) => {
            setUsers(snap.docs.map(d => d.data() as UserState));
            setStats(prev => ({...prev, userCount: snap.size })); // Approximate
        });

        // Withdrawals
        const qWithdraw = query(collection(db, "withdrawals"), orderBy("date", "desc"));
        const unsubWithdraw = onSnapshot(qWithdraw, (snap) => {
            const list = snap.docs.map(d => ({...d.data(), uid: d.id}));
            setWithdrawals(list);
            setStats(prev => ({...prev, pendingWithdraw: list.filter((x:any) => x.status === 'PENDING').length }));
        });

        // Vouchers
        const qVoucher = query(collection(db, "vouchers"));
        const unsubVoucher = onSnapshot(qVoucher, (snap) => {
             const list = snap.docs.map(d => d.data() as Voucher);
             setVouchers(list);
             setStats(prev => ({...prev, activeVouchers: list.filter(v => !v.isUsed).length }));
        });

        // Settings
        const unsubSettings = onSnapshot(doc(db, "settings", "global"), (doc) => {
            if (doc.exists()) setSettings(doc.data() as AdminSettings);
        });

        return () => { unsubUsers(); unsubWithdraw(); unsubVoucher(); unsubSettings(); };
    }, []);

    const handleWithdrawAction = async (txId: string, userPhone: string, amount: number, action: 'APPROVE' | 'REJECT') => {
        try {
            const txRef = doc(db, "withdrawals", txId);
            
            if (action === 'APPROVE') {
                await updateDoc(txRef, { status: 'SUCCESS' });
            } else {
                await runTransaction(db, async (transaction) => {
                    const userRef = doc(db, "users", userPhone);
                    const userDoc = await transaction.get(userRef);
                    
                    if (userDoc.exists()) {
                        const newBal = userDoc.data().balance + amount;
                        transaction.update(userRef, { balance: newBal });
                    }
                    transaction.update(txRef, { status: 'FAILED' });
                });
                notify("Withdraw ditolak, saldo dikembalikan.", 'info');
            }
        } catch (e) {
            console.error(e);
            notify("Gagal memproses.", 'error');
        }
    };

    const generateVoucher = async () => {
        const code = `CG-${Math.random().toString(36).substring(2,7).toUpperCase()}`;
        const v: Voucher = { code, amount: Number(voucherForm.amount), isUsed: false };
        await setDoc(doc(db, "vouchers", code), v);
        notify(`Voucher Created: ${code}`, 'success');
    };

    const deleteVoucher = (code: string) => {
        confirm("Hapus voucher?", async () => {
             await deleteDoc(doc(db, "vouchers", code));
             notify("Voucher dihapus", 'info');
        });
    };

    const updateWinRate = async (val: number) => {
        await setDoc(doc(db, "settings", "global"), { ...settings, gameWinRate: val });
    };

    const updateGlobalMsg = async (msg: string) => {
        await setDoc(doc(db, "settings", "global"), { ...settings, globalMessage: msg });
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.phoneNumber.includes(searchQuery) || 
        u.id.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            <div className="bg-red-900/80 p-4 flex justify-between items-center shadow-lg backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={28} className="text-white" />
                    <h1 className="text-xl font-black tracking-tighter">ADMIN <span className="text-red-400">PANEL</span></h1>
                </div>
                <button onClick={onLogout} className="bg-black/30 p-2 rounded-full hover:bg-black/50 transition"><LogOut size={20}/></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-20 bg-black/40 flex flex-col items-center py-4 gap-6 border-r border-white/5">
                    <button onClick={() => setAdminTab('DASHBOARD')} className={`p-3 rounded-xl transition ${adminTab==='DASHBOARD' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}><LayoutGrid size={24}/></button>
                    <button onClick={() => setAdminTab('USERS')} className={`p-3 rounded-xl transition ${adminTab==='USERS' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}><Users size={24}/></button>
                    <button onClick={() => setAdminTab('WITHDRAW')} className={`p-3 rounded-xl transition ${adminTab==='WITHDRAW' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}><Wallet size={24}/></button>
                    <button onClick={() => setAdminTab('TOPUP')} className={`p-3 rounded-xl transition ${adminTab==='TOPUP' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}><Zap size={24}/></button>
                    <button onClick={() => setAdminTab('VOUCHER')} className={`p-3 rounded-xl transition ${adminTab==='VOUCHER' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}><Ticket size={24}/></button>
                    <button onClick={() => setAdminTab('SETTINGS')} className={`p-3 rounded-xl transition ${adminTab==='SETTINGS' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}><Settings size={24}/></button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                    
                    {adminTab === 'DASHBOARD' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg">
                                    <p className="text-blue-200 text-sm font-bold">Total Pengguna</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.userCount}</h3>
                                </div>
                                <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl shadow-lg">
                                    <p className="text-green-200 text-sm font-bold">Voucher Aktif</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.activeVouchers}</h3>
                                </div>
                                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl shadow-lg">
                                    <p className="text-purple-200 text-sm font-bold">Pending Withdraw</p>
                                    <h3 className="text-4xl font-black mt-2">{stats.pendingWithdraw}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {adminTab === 'USERS' && (
                        <div className="space-y-4 animate-in fade-in">
                             <h2 className="text-2xl font-bold">Kelola Pengguna</h2>
                             <div className="flex items-center bg-black/30 p-3 rounded-xl border border-white/10">
                                 <Search className="text-gray-400 mr-2" />
                                 <input 
                                    type="text" 
                                    placeholder="Cari ID, Nama, atau No HP..." 
                                    className="bg-transparent w-full outline-none text-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                 />
                             </div>
                             <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                                 <table className="w-full text-sm text-left">
                                     <thead className="bg-white/5 text-gray-400 font-bold uppercase text-xs">
                                         <tr>
                                             <th className="p-4">User</th>
                                             <th className="p-4">Password</th>
                                             <th className="p-4">Saldo</th>
                                             <th className="p-4">Wallet</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {filteredUsers.map(u => (
                                             <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                                 <td className="p-4">
                                                     <div className="font-bold text-white">{u.name}</div>
                                                     <div className="text-xs text-gray-500">{u.phoneNumber} (ID: {u.id})</div>
                                                 </td>
                                                 <td className="p-4 font-mono text-yellow-500">{u.password}</td>
                                                 <td className="p-4 font-bold text-green-400">Rp {u.balance.toLocaleString()}</td>
                                                 <td className="p-4 text-xs text-gray-400">
                                                     {u.wallet ? `${u.wallet.type} - ${u.wallet.number}` : '-'}
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                    )}

                    {adminTab === 'WITHDRAW' && (
                        <div className="space-y-4 animate-in fade-in">
                            <h2 className="text-2xl font-bold">Permintaan Penarikan</h2>
                            <div className="space-y-2">
                                {withdrawals.map((w: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${w.status === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${w.status==='PENDING'?'bg-yellow-500 text-black':w.status==='SUCCESS'?'bg-green-500 text-black':'bg-red-500 text-white'}`}>{w.status}</span>
                                                <span className="font-bold text-white">Rp {w.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                User: {w.userPhone} | {w.walletType} - {w.walletNumber} ({w.walletName})
                                            </div>
                                        </div>
                                        {w.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleWithdrawAction(w.uid, w.userPhone, w.amount, 'REJECT')} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Tolak</button>
                                                <button onClick={() => handleWithdrawAction(w.uid, w.userPhone, w.amount, 'APPROVE')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Terima</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {withdrawals.length === 0 && (
                                    <div className="text-gray-500 text-center py-10">Belum ada permintaan.</div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {adminTab === 'TOPUP' && (
                         <div className="space-y-4 animate-in fade-in">
                            <h2 className="text-2xl font-bold">Riwayat Topup (QRIS)</h2>
                            <div className="bg-black/20 rounded-xl p-4 text-center text-gray-400 text-sm">
                                Fitur pemantauan otomatis Topup QRIS akan muncul di sini. 
                                <br/>(Saat ini sistem QRIS bersifat simulasi instant di sisi klien).
                            </div>
                         </div>
                    )}

                    {adminTab === 'VOUCHER' && (
                        <div className="space-y-6 animate-in fade-in">
                             <h2 className="text-2xl font-bold">Kelola Voucher</h2>
                             <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 items-end">
                                 <div className="flex-1">
                                     <label className="text-xs text-gray-400 mb-1 block">Nominal (Rp)</label>
                                     <input type="number" value={voucherForm.amount} onChange={e => setVoucherForm({...voucherForm, amount: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none" />
                                 </div>
                                 <button onClick={generateVoucher} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold h-10">Buat Voucher</button>
                             </div>

                             <div className="space-y-2">
                                 {vouchers.map((v, i) => (
                                     <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                                         <div>
                                             <div className="font-mono text-yellow-400 font-bold tracking-wider">{v.code}</div>
                                             <div className="text-xs text-gray-500">Nominal: Rp {v.amount.toLocaleString()}</div>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${v.isUsed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                 {v.isUsed ? `Digunakan` : 'AKTIF'}
                                             </span>
                                             <button onClick={() => deleteVoucher(v.code)} className="p-1 hover:bg-red-500/20 rounded"><Trash2 size={16} className="text-red-500"/></button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    {adminTab === 'SETTINGS' && (
                         <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-bold">Pengaturan Game & Global</h2>
                            
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Gamepad2/> Game Difficulty (Win Rate)</h3>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={(settings?.gameWinRate || 0.3) * 100} 
                                        onChange={(e) => updateWinRate(Number(e.target.value)/100)}
                                        className="w-full accent-red-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="font-mono font-bold text-xl w-16 text-right">{((settings?.gameWinRate || 0.3) * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Semakin tinggi persentase, semakin mudah user menang.</p>
                            </div>

                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Megaphone/> Pesan Global (Running Text)</h3>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={settings?.globalMessage || ''}
                                        onChange={(e) => updateGlobalMsg(e.target.value)}
                                        placeholder="Masukkan pesan pengumuman..."
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Kosongkan untuk menghapus notifikasi dari layar user.</p>
                            </div>
                         </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: APP ---
const App: React.FC = () => {
  // --- Global State ---
  const [user, setUser] = useState<UserState | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<AdminSettings>({ gameWinRate: 0.3, globalMessage: '' });
  
  // --- Popup State ---
  const [alertState, setAlertState] = useState<{isOpen: boolean, message: string, type: 'success'|'error'|'info'}>({ isOpen: false, message: '', type: 'info' });
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void, onCancel: () => void}>({ isOpen: false, message: '', onConfirm: () => {}, onCancel: () => {} });

  // --- App State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeTaskTab, setActiveTaskTab] = useState<'DEPOSIT' | 'BET'>('BET');
  
  // Transition States
  const [isInitialLoading, setIsInitialLoading] = useState(false); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<{ type: 'GAME' | 'PAGE', id: string, tab?: Tab } | null>(null);
  const [gameMenuOpen, setGameMenuOpen] = useState(false);
  
  // Forms & Modals
  const [selectedDeposit, setSelectedDeposit] = useState<number>(20000);
  const [showQris, setShowQris] = useState(false);
  const [qrisTimer, setQrisTimer] = useState(180); 
  const [withdrawAmount, setWithdrawAmount] = useState<number>(30000);
  const [selectedWalletType, setSelectedWalletType] = useState<'DANA' | 'OVO' | 'LINKAJA' | 'GOPAY'>('DANA');
  const [showBindWalletModal, setShowBindWalletModal] = useState(false);
  const [bindForm, setBindForm] = useState({ name: '', number: '' });
  const [inputReferralCode, setInputReferralCode] = useState('');
  
  // Voucher State
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAd, setShowAd] = useState(false);
  const [adIntent, setAdIntent] = useState<AdIntent>('RANDOM_REWARD');

  // --- LISTENERS ---
  
  // 1. Auth & User Data
  useEffect(() => {
    // Only if we have a user logged in, listen to changes
    if (user?.phoneNumber) {
        const unsubUser = onSnapshot(doc(db, "users", user.phoneNumber), (doc) => {
            if (doc.exists()) {
                setUser(doc.data() as UserState);
            }
        });

        // Transactions History
        const qTx = query(collection(db, `users/${user.phoneNumber}/transactions`), orderBy("id", "desc"), limit(20));
        const unsubTx = onSnapshot(qTx, (snap) => {
            setTransactions(snap.docs.map(d => d.data() as Transaction));
        });

        return () => { unsubUser(); unsubTx(); };
    }
  }, [user?.phoneNumber]);

  // 2. Global Settings
  useEffect(() => {
     const unsub = onSnapshot(doc(db, "settings", "global"), (doc) => {
         if (doc.exists()) setGlobalSettings(doc.data() as AdminSettings);
     });
     return () => unsub();
  }, []);

  // --- POPUP HANDLERS ---
  const showAlert = (message: string, type: 'success'|'error'|'info' = 'info') => {
      setAlertState({ isOpen: true, message, type });
  };
  
  const closeAlert = () => {
      setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
      setConfirmState({
          isOpen: true,
          message,
          onConfirm: () => {
              onConfirm();
              setConfirmState(prev => ({ ...prev, isOpen: false }));
          },
          onCancel: () => {
              setConfirmState(prev => ({ ...prev, isOpen: false }));
          }
      });
  };

  const handleLogout = () => {
      showConfirm("Yakin ingin keluar dari akun?", () => {
          setUser(null);
          setIsAdminLoggedIn(false);
          setActiveTab(Tab.HOME);
      });
  };

  // --- HELPER TO UPDATE DB ---
  const updateBalance = async (amount: number, type: 'DEPOSIT' | 'WITHDRAW', description: string) => {
    if (!user) return;
    try {
        const newBalance = type === 'DEPOSIT' ? user.balance + amount : user.balance - amount;
        await updateDoc(doc(db, "users", user.phoneNumber), { balance: newBalance });
        
        // Add Tx Record
        await addDoc(collection(db, `users/${user.phoneNumber}/transactions`), {
            type,
            amount,
            description,
            date: new Date().toLocaleTimeString(),
            id: Date.now().toString()
        });
        showAlert(description + " Berhasil!", 'success');
    } catch(e) {
        console.error(e);
        showAlert("Gagal update saldo", 'error');
    }
  };

  // --- GAME LOGIC (With Admin WinRate) ---
  const handleGamePlay = async (bet: number, win: number) => {
    if (!user) return;
    
    let finalWin = win;
    if (win > 0) {
        if (Math.random() > globalSettings.gameWinRate) {
            finalWin = 0; // Force lose based on difficulty
        }
    }

    let newBalance = user.balance - bet;
    let piggyDeposit = 0;

    if (finalWin > 0) {
      piggyDeposit = Math.floor(finalWin * PIGGY_DEDUCTION_RATE);
      newBalance += (finalWin - piggyDeposit);
    }
    
    // Optimistic UI Update (optional, but Firestore listener is fast enough)
    // We just write to DB
    await updateDoc(doc(db, "users", user.phoneNumber), {
        balance: newBalance,
        piggyBank: user.piggyBank + piggyDeposit,
        totalTurnover: user.totalTurnover + bet
    });
  };

  // ... (Other handlers unchanged, showing modified ones below) ...

  const handleWithdrawSubmit = async () => {
      if (!user) return;
      if (!user.wallet) { setShowBindWalletModal(true); return; }
      const totalDeduction = withdrawAmount + WITHDRAW_FEE;
      if (user.balance < totalDeduction) return showAlert("Saldo kurang!", 'error');

      try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, "users", user.phoneNumber);
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists()) throw "User not found";
            
            const currentBal = userDoc.data().balance;
            if (currentBal < totalDeduction) throw "Balance too low";

            transaction.update(userRef, { balance: currentBal - totalDeduction });

            // Create Withdraw Request in Main Collection
            const withdrawRef = doc(collection(db, "withdrawals"));
            transaction.set(withdrawRef, {
                userPhone: user.phoneNumber,
                walletType: user.wallet.type,
                walletName: user.wallet.name,
                walletNumber: user.wallet.number,
                amount: withdrawAmount,
                status: 'PENDING',
                date: new Date().toISOString()
            });

            // Create User History Record
            const historyRef = doc(collection(db, `users/${user.phoneNumber}/transactions`));
            transaction.set(historyRef, {
                 type: 'WITHDRAW',
                 amount: withdrawAmount,
                 description: 'Request Penarikan (Pending)',
                 date: new Date().toLocaleTimeString(),
                 id: Date.now().toString()
            });
        });
        showAlert("Permintaan penarikan berhasil dikirim!", 'success');
        setActiveTab(Tab.HOME);
      } catch (e) {
          console.error(e);
          showAlert("Gagal memproses penarikan.", 'error');
      }
  };
  
  const handleClaimVoucher = async () => {
      if (!voucherCodeInput) return;
      
      try {
        await runTransaction(db, async (transaction) => {
             const vRef = doc(db, "vouchers", voucherCodeInput);
             const vSnap = await transaction.get(vRef);
             
             if (!vSnap.exists()) throw "Voucher tidak ditemukan";
             const vData = vSnap.data() as Voucher;
             if (vData.isUsed) throw "Voucher sudah digunakan";

             const userRef = doc(db, "users", user!.phoneNumber);
             const userSnap = await transaction.get(userRef);
             const newBal = userSnap.data()!.balance + vData.amount;

             transaction.update(userRef, { balance: newBal });
             transaction.update(vRef, { isUsed: true, usedBy: user!.phoneNumber });

              // Record
            const historyRef = doc(collection(db, `users/${user!.phoneNumber}/transactions`));
            transaction.set(historyRef, {
                 type: 'VOUCHER',
                 amount: vData.amount,
                 description: `Klaim Voucher ${vData.code}`,
                 date: new Date().toLocaleTimeString(),
                 id: Date.now().toString()
            });
        });
        showAlert("Voucher Berhasil Diklaim!", 'success');
        setShowVoucherModal(false);
        setVoucherCodeInput('');
      } catch (e) {
          showAlert(typeof e === 'string' ? e : "Gagal klaim voucher", 'error');
      }
  };

  // --- Handlers reused ---
  const handleCheckIn = () => { /* Logic to checkIn via Firestore update */ };
  const handleRouletteStart = (c:number) => {}; 
  const handleRouletteEnd = (w:number) => { if(w>=0) handleGamePlay(0, w); }; 
  const handleWatchAdForSpin = () => { setShowAd(true); setAdIntent('FREE_SPIN'); };
  const handleAdReward = () => { /* */ };
  const handleDepositSubmit = () => { setQrisTimer(180); setShowQris(true); };
  const handleBindWalletSubmit = async () => { 
      if (!bindForm.name || !bindForm.number) return showAlert("Mohon isi data!", 'error');
      if(user) {
          await updateDoc(doc(db, "users", user.phoneNumber), { wallet: { type: selectedWalletType, name: bindForm.name, number: bindForm.number } });
          setShowBindWalletModal(false);
          showAlert("Wallet berhasil diikat!", 'success');
      }
  };
  const handleBindReferral = () => { /* */ };
  const handleClaimCommission = () => { /* */ };
  const copyReferralCode = () => { if(user) navigator.clipboard.writeText(user.id); showAlert("Copied!", 'success'); };

  const handleNavigate = (type: any, id: any, tab?: any) => { 
      if(type==='PAGE' && tab) setActiveTab(tab); 
      setIsTransitioning(true); 
      setTransitionTarget({type, id, tab});
  };
  const completeTransition = () => { setIsTransitioning(false); setTransitionTarget(null); if(transitionTarget?.type === 'GAME') setActiveGame(transitionTarget.id); };

  const renderActiveGame = () => {
    // --- TEMPAT INTEGRASI GAME ---
    // Di sini kita akan me-render komponen game berdasarkan `activeGame` ID.
    // Nanti, saat file game sudah ditambahkan, Anda bisa melakukan import dan switch case di sini.
    
    // Contoh Logika (Uncomment dan sesuaikan nanti):
    /*
    if (activeGame === 'GAME_1') {
        return (
            <div className="w-full h-screen bg-black">
                <Game1 
                    userBalance={user?.balance || 0}
                    onPlay={(bet, win) => handleGamePlay(bet, win)}
                    onClose={() => setActiveGame(null)}
                />
            </div>
        )
    }
    */

    return (
        <div className="w-full max-w-md h-screen relative z-10 flex flex-col bg-slate-900 shadow-2xl overflow-hidden">
            <div className="absolute top-4 left-4 z-50">
                <button onClick={() => setActiveGame(null)} className="bg-black/50 p-2 rounded-full text-white backdrop-blur-sm border border-white/10">
                    <ArrowLeft size={24} />
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-b from-slate-900 to-black">
                <Gamepad2 size={80} className="text-white opacity-50" />
                <h2 className="text-3xl font-black text-white">{activeGame}</h2>
                <p className="text-gray-400">Game sedang dimuat... (Menunggu Integrasi)</p>
            </div>
        </div>
    );
  };

  // --- RENDER HELPERS ---
  const renderHome = () => (
      <div className="space-y-6 pb-28 animate-float">
          {globalSettings.globalMessage && (
              <div className="bg-red-600/20 border border-red-500/50 p-2 rounded-lg overflow-hidden flex items-center gap-2">
                  <Megaphone size={16} className="text-red-400 shrink-0" />
                  <div className="whitespace-nowrap overflow-hidden w-full">
                      <div className="animate-[marquee_10s_linear_infinite] inline-block text-xs font-bold text-red-200">
                          {globalSettings.globalMessage} &nbsp;&nbsp;&nbsp;&nbsp; {globalSettings.globalMessage}
                      </div>
                  </div>
              </div>
          )}

          <div className="card-3d-wrapper mt-4">
            <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl p-6 text-white overflow-hidden border border-white/20">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-indigo-100 text-xs font-medium tracking-wider uppercase mb-1">Hi, {user?.name}</p>
                        <h1 className="text-4xl font-black neon-text">Rp {user?.balance.toLocaleString()}</h1>
                    </div>
                    <div className="glass p-2 rounded-xl"><Wallet className="text-white" size={24}/></div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex gap-3 z-10">
                    <button onClick={() => setActiveTab(Tab.TOPUP)} className="flex-1 bg-white/20 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Zap size={16} /> TOP UP</button>
                    <button onClick={() => setActiveTab(Tab.WITHDRAW)} className="flex-1 bg-black/20 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><ArrowLeft size={16} /> TARIK</button>
                </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setShowVoucherModal(true)} className="glass-card flex flex-col items-center justify-center p-3 gap-2 hover:bg-white/10 transition">
                <div className="p-3 rounded-full bg-white/5 text-purple-400 shadow"><Ticket size={22} /></div>
                <span className="text-[10px] font-bold text-gray-300">Voucher</span>
            </button>
            <button onClick={() => setActiveTab(Tab.LEADERBOARD)} className="glass-card flex flex-col items-center justify-center p-3 gap-2 hover:bg-white/10 transition">
                <div className="p-3 rounded-full bg-white/5 text-yellow-400 shadow"><Trophy size={22} /></div>
                <span className="text-[10px] font-bold text-gray-300">Rank</span>
            </button>
            <button onClick={() => setActiveTab(Tab.INVEST)} className="glass-card flex flex-col items-center justify-center p-3 gap-2 hover:bg-white/10 transition">
                <div className="p-3 rounded-full bg-white/5 text-green-400 shadow"><TrendingUp size={22} /></div>
                <span className="text-[10px] font-bold text-gray-300">Spin</span>
            </button>
            <button onClick={() => setActiveTab(Tab.TASKS)} className="glass-card flex flex-col items-center justify-center p-3 gap-2 hover:bg-white/10 transition">
                <div className="p-3 rounded-full bg-white/5 text-orange-400 shadow"><CheckCircle size={22} /></div>
                <span className="text-[10px] font-bold text-gray-300">Misi</span>
            </button>
          </div>
          <MonetagBanner />
      </div>
  );

  const renderGameLobby = () => <div className="space-y-4"><h2 className="text-2xl font-black">Lobby</h2><MonetagBanner/><div className="grid grid-cols-3 gap-3">{Array.from({length:18}).map((_,i)=><button key={i} onClick={()=>handleNavigate('GAME',`GAME_${i}`)} className="game-card-3d bg-gray-800 p-4 rounded-xl h-32 flex flex-col items-center justify-center border border-white/10"><Gamepad2 className="mb-2 text-gray-400"/><span className="text-xs font-bold">Game {i+1}</span></button>)}</div></div>;
  const renderInvest = () => <div className="space-y-4 text-center"><h2 className="text-2xl font-black neon-text">Lucky Spin</h2><div className="glass p-4 rounded-xl"><DailyRoulette userBalance={user!.balance} spinChances={user!.spinChances} onSpinStart={handleRouletteStart} onSpinEnd={handleRouletteEnd} onWatchAd={handleWatchAdForSpin} onAlert={showAlert} /></div></div>;
  const renderProfile = () => <div className="space-y-6"><div className="glass-card p-8 text-center"><div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl">😎</div><h2 className="font-bold text-2xl">{user?.name}</h2><p className="text-blue-200 text-sm font-mono">{user?.phoneNumber}</p></div><button onClick={handleLogout} className="w-full p-4 bg-red-500/10 text-red-400 rounded-xl font-bold flex justify-between">Keluar <LogOut size={16}/></button></div>;
  const renderEvents = () => <div className="text-center p-10 text-gray-400">Event Coming Soon</div>;
  const renderTasks = () => <div className="text-center p-10 text-gray-400">Tasks Coming Soon</div>;
  const renderWithdrawUser = () => {
    return (
        <div className="space-y-6 pb-28">
            <h2 className="text-2xl font-black text-white mb-4 neon-text">Penarikan Dana</h2>
            <div className="glass-card p-4 border-l-4 border-yellow-500 flex justify-between items-center">
                <div><p className="text-xs text-gray-400">Saldo Tersedia</p><h3 className="text-2xl font-black text-white">Rp {user!.balance.toLocaleString()}</h3></div>
                <div className="p-2 bg-yellow-500/10 rounded-full"><Wallet className="text-yellow-500" size={24}/></div>
            </div>
            <div className="glass-card p-4">
                 <div className="flex justify-between items-center mb-4"><p className="text-xs text-gray-400 font-bold uppercase">Rekening Tujuan</p><button onClick={() => setShowBindWalletModal(true)} className="text-xs text-blue-400 font-bold hover:underline">{user!.wallet ? 'Ganti' : 'Tambah'}</button></div>
                 {user!.wallet ? (<div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/10"><div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow">{user!.wallet.type}</div><div><p className="text-sm font-bold text-white">{user!.wallet.name}</p><p className="text-xs text-gray-500">{user!.wallet.number}</p></div></div>) : (<button onClick={() => setShowBindWalletModal(true)} className="w-full bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center"><p className="text-xs text-red-400 font-bold">+ Tambah Rekening</p></button>)}
            </div>
            <div className="space-y-2"><label className="text-xs text-gray-400 font-bold ml-1">Jumlah</label><input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white font-bold outline-none text-lg" placeholder="0"/></div>
            <button onClick={handleWithdrawSubmit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition" disabled={!user!.wallet || withdrawAmount < 30000 || user!.balance < withdrawAmount}>Tarik Sekarang</button>
            <p className="text-[10px] text-gray-500 text-center mt-2">Permintaan akan diproses admin (Status: PENDING).</p>
        </div>
    );
  };
  const renderTopup = () => <div className="text-center p-10"><button onClick={handleDepositSubmit} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">Isi Saldo (QRIS)</button>{showQris && <div className="mt-4 bg-white p-4 rounded text-black"><QrCode size={150} className="mx-auto"/><p className="font-bold mt-2">Scan QRIS</p><button onClick={()=>{updateBalance(20000,'DEPOSIT','QRIS'); setShowQris(false)}} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-xs">Simulasi Bayar</button></div>}</div>;
  const renderLeaderboard = () => <div className="text-center p-10 text-gray-400">Leaderboard</div>;
  const renderReferral = () => <div className="text-center p-10 text-gray-400">Referral System Active</div>;

  // --- MAIN RENDER ---
  if (isAdminLoggedIn) {
      return (
        <>
            <CustomAlert isOpen={alertState.isOpen} message={alertState.message} type={alertState.type} onClose={closeAlert} />
            <CustomConfirm isOpen={confirmState.isOpen} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={confirmState.onCancel} />
            <AdminPanel onLogout={handleLogout} notify={showAlert} confirm={showConfirm} />
        </>
      );
  }

  if (!user) {
      return (
        <>
            <CustomAlert isOpen={alertState.isOpen} message={alertState.message} type={alertState.type} onClose={closeAlert} />
            <AuthScreen onLogin={(loggedInUser) => { 
                if (loggedInUser === 'ADMIN') {
                    setIsAdminLoggedIn(true);
                } else {
                    setUser(loggedInUser); 
                }
            }} notify={showAlert} />
        </>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center text-white font-sans selection:bg-purple-500 selection:text-white overflow-hidden">
      {isTransitioning && <SplashScreen duration={TRANSITION_DURATION} message="Loading..." onFinish={completeTransition} />}

      <CustomAlert isOpen={alertState.isOpen} message={alertState.message} type={alertState.type} onClose={closeAlert} />
      <CustomConfirm isOpen={confirmState.isOpen} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={confirmState.onCancel} />

      {activeGame && !isTransitioning ? renderActiveGame() : (
        <div className="w-full max-w-md h-screen relative z-10 flex flex-col bg-slate-900 shadow-2xl overflow-hidden">
            <MonetagInterstitial isOpen={showAd} onClose={() => setShowAd(false)} onReward={handleAdReward} />
            
            <div className="px-5 py-4 sticky top-0 z-50 glass border-b-0 backdrop-blur-xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-lg">CG</div>
                    <span className="font-bold text-lg tracking-tight">Cuan<span className="text-green-400">Game</span></span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-3 py-1.5 rounded-full">
                    <Wallet size={14} className="text-green-400" />
                    <span className="text-xs font-bold font-mono">Rp {user.balance.toLocaleString()}</span>
                </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto hide-scrollbar pb-24">
                {activeTab === Tab.HOME && renderHome()}
                {activeTab === Tab.GAMES && renderGameLobby()}
                {activeTab === Tab.INVEST && renderInvest()}
                {activeTab === Tab.PROFILE && renderProfile()}
                {activeTab === Tab.EVENTS && renderEvents()}
                {activeTab === Tab.TASKS && renderTasks()}
                {activeTab === Tab.TOPUP && renderTopup()}
                {activeTab === Tab.WITHDRAW && renderWithdrawUser()}
                {activeTab === Tab.LEADERBOARD && renderLeaderboard()}
                {activeTab === Tab.REFERRAL && renderReferral()}
            </div>

            {/* Voucher Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Ticket className="text-yellow-400"/> Klaim Voucher</h3>
                            <button onClick={() => setShowVoucherModal(false)}><X size={20} className="text-gray-500"/></button>
                        </div>
                        <p className="text-xs text-gray-400">Masukkan kode voucher dari Admin untuk mendapatkan saldo gratis.</p>
                        <input 
                            type="text" 
                            placeholder="Contoh: CG-X829" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center font-mono font-bold text-yellow-400 tracking-widest outline-none focus:border-yellow-500 uppercase"
                            value={voucherCodeInput}
                            onChange={e => setVoucherCodeInput(e.target.value.toUpperCase())}
                        />
                        <button onClick={handleClaimVoucher} className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg">Klaim Sekarang</button>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div className="absolute bottom-6 left-0 right-0 z-40 px-4 w-full">
                <div className="glass h-16 rounded-2xl flex items-center justify-around px-2 shadow-2xl bg-black/40 backdrop-blur-xl border border-white/10">
                    <button onClick={() => { setActiveTab(Tab.HOME); setActiveGame(null); }} className={`p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.HOME ? 'bg-white/10 text-green-400 scale-110 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><Home size={24} strokeWidth={activeTab === Tab.HOME ? 2.5 : 2} /></button>
                    <button onClick={() => { setActiveTab(Tab.GAMES); setActiveGame(null); }} className={`p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.GAMES ? 'bg-white/10 text-yellow-400 scale-110 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><Gamepad2 size={24} strokeWidth={activeTab === Tab.GAMES ? 2.5 : 2} /></button>
                    <button onClick={() => { setActiveTab(Tab.INVEST); setActiveGame(null); }} className="relative -top-6 bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/40 transform transition hover:scale-105 border-4 border-slate-900"><Disc size={24} className="text-white" /></button>
                    <button onClick={() => { setActiveTab(Tab.EVENTS); setActiveGame(null); }} className={`p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.EVENTS ? 'bg-white/10 text-orange-400 scale-110 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><Calendar size={24} strokeWidth={activeTab === Tab.EVENTS ? 2.5 : 2} /></button>
                    <button onClick={() => { setActiveTab(Tab.PROFILE); setActiveGame(null); }} className={`p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.PROFILE ? 'bg-white/10 text-blue-400 scale-110 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}><User size={24} strokeWidth={activeTab === Tab.PROFILE ? 2.5 : 2} /></button>
                </div>
            </div>

            {showBindWalletModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 space-y-4 animate-in slide-in-from-bottom-10 shadow-2xl">
                        <div className="flex justify-between items-center"><h3 className="font-bold text-white text-lg">Tautkan E-Wallet</h3><button onClick={() => setShowBindWalletModal(false)}><X size={20} className="text-gray-500" /></button></div>
                        <div className="grid grid-cols-4 gap-2">{['DANA', 'OVO', 'GOPAY', 'LINKAJA'].map((type) => (<button key={type} onClick={() => setSelectedWalletType(type as any)} className={`py-2 rounded-lg text-[10px] font-bold border transition ${selectedWalletType === type ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>{type}</button>))}</div>
                        <div className="space-y-3"><div className="space-y-1"><label className="text-[10px] text-gray-400 font-bold ml-1">Nama Lengkap</label><input type="text" placeholder="Sesuai E-Wallet" value={bindForm.name} onChange={e => setBindForm({...bindForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500 transition"/></div><div className="space-y-1"><label className="text-[10px] text-gray-400 font-bold ml-1">Nomor HP</label><input type="tel" placeholder="08xxxxxxxxxx" value={bindForm.number} onChange={e => setBindForm({...bindForm, number: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-blue-500 transition"/></div></div>
                        <button onClick={handleBindWalletSubmit} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg active:scale-95 transition mt-2">Simpan Akun</button>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default App;