import React, { useState, useMemo, useEffect, useRef, ChangeEvent } from 'react';
import { 
    BookOpen, FileText, PieChart, Plus, Upload, 
    Wallet, Building2, Trash2, PlusCircle, ArrowRight,
    Menu, X, LogOut, User, Mail, Phone, MessageCircle, Loader2,
    Search, ChevronDown, Download, Calendar, Filter
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import SearchableSelect from './components/SearchableSelect';
import { DEFAULT_ACCOUNTS, Account } from './constants/accounts';

interface UserData {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  provider: string;
}

interface JournalEntry {
  accountId: string;
  dr: number;
  cr: number;
  desc?: string;
}

interface Journal {
  id: string;
  date: string;
  note: string;
  type: 'INCOME' | 'EXPENSE';
  entries: JournalEntry[];
}

interface LineItem {
  id: number;
  accountId: string;
  description: string;
  amount: string;
}

interface PaymentItem {
  id: number;
  accountId: string;
  amount: string;
}

// ── ຄຳສັ່ງໃຫ້ AI (Claude Vision) ອ່ານ ແລະ ເຂົ້າໃຈສະລິບ ──
const SLIP_PROMPT = `You are an accounting assistant for a Lao SME app. You read bank transfer slips and receipts from Laos (and sometimes Thailand).

Analyze the slip/receipt image and return ONLY a valid JSON object — no markdown, no commentary.

JSON schema:
{
  "transactionType": "INCOME" | "EXPENSE",
  "amount": <primary transaction amount as a plain number, no commas or currency symbols>,
  "currency": "LAK" | "THB" | "USD",
  "bankName": "<bank or e-wallet name on the slip, or null>",
  "date": "<YYYY-MM-DD, or null if not shown>",
  "description": "<short description of what the transaction is, or null>",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}

How to decide transactionType — the COLOR of the amount is the main signal:
- A GREEN amount = money RECEIVED into the account → "INCOME".
- A RED amount = money PAID OUT, sent, or withdrawn → "EXPENSE".
- If the amount has no clear color, use the wording/arrows: "received"/"deposit"/in-transfer → INCOME; "paid"/"transfer out"/"withdraw"/out-transfer → EXPENSE.

Other rules:
- Slips are almost always in Lao Kip — set "currency" to "LAK" (ກີບ) unless the slip clearly shows ฿/THB or $/USD.
- "amount" must be the PRIMARY transfer amount only — never a fee, a balance, or a running total.
- If the amount or its color is unclear, set "confidence" to "LOW".`;

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loginMethod, setLoginMethod] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState<Record<string, Account>>(DEFAULT_ACCOUNTS);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNote, setRecordNote] = useState('');
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([{ id: 1, accountId: '102', amount: '' }]);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: 1, accountId: '707', description: '', amount: '' }]);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');
  
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('anthropic_api_key') || ''; } catch (_) { return ''; }
  });
  const saveApiKey = (v: string) => {
    setApiKey(v);
    try { localStorage.setItem('anthropic_api_key', v); } catch (_) {}
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('lo-LA', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num || 0);

  const handleLogin = (method: string) => {
    setLoginMethod(method);
    setTimeout(() => {
      let mockUser: UserData = { uid: 'user_123', name: '', provider: '' };
      if (method === 'gmail') mockUser = { ...mockUser, name: 'SME Owner', email: 'owner@gmail.com', provider: 'Google' };
      if (method === 'phone') mockUser = { ...mockUser, name: 'ຜູ້ໃຊ້ເບີໂທ', phone: '+856 20 9999 8888', provider: 'Phone' };
      if (method === 'whatsapp') mockUser = { ...mockUser, name: 'SME Shop (WA)', phone: '+856 20 5555 4444', provider: 'WhatsApp' };
      setUser(mockUser);
      setActiveTab('dashboard');
    }, 1000);
  };

  const handleLogout = () => { setUser(null); setLoginMethod(null); };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (!apiKey) {
      setOcrMessage('⚠️ ກະລຸນາໃສ່ Anthropic API Key ກ່ອນ (ທີ່ເມນູຕັ້ງຄ່າ)');
      setTimeout(() => setOcrMessage(''), 6000);
      return;
    }

    setIsProcessing(true);
    setOcrMessage('ກຳລັງວິເຄາະສະລິບດ້ວຍ AI...');

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-latest',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type || 'image/jpeg', data: base64 } },
              { type: 'text', text: SLIP_PROMPT },
            ],
          }],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setOcrMessage('AI ຜິດພາດ: ' + (json?.error?.message || ('HTTP ' + res.status)));
        return;
      }
      const rawText = json.content?.find((b: any) => b.type === 'text')?.text || '{}';
      let data;
      try { data = JSON.parse(rawText.replace(/```[\w]*|```/g, '').trim()); }
      catch { data = { error: 'parse_failed' }; }

      if (data.error || !(data.amount > 0)) {
        setOcrMessage('AI ບໍ່ສາມາດອ່ານຍອດເງິນຈາກສະລິບໄດ້ — ກະລຸນາໃສ່ເອງ');
      } else {
        const isIncome = data.transactionType === 'INCOME';
        const currency = data.currency || 'LAK';

        setTransactionType(isIncome ? 'INCOME' : 'EXPENSE');
        setLineItems([{
          id: 1,
          accountId: isIncome ? '707' : '601',
          description: data.description || (isIncome ? 'ລາຍຮັບຈາກສະລິບ' : 'ລາຍຈ່າຍຈາກສະລິບ'),
          amount: String(data.amount),
        }]);
        setPaymentItems([{
          id: 1,
          accountId: '102',
          amount: String(data.amount),
        }]);
        if (data.date) setRecordDate(data.date);
        if (data.bankName) setRecordNote(data.bankName);

        setOcrMessage(
          'AI ອ່ານສຳເລັດ: ' + (isIncome ? 'ລາຍຮັບ (ສີຂຽວ)' : 'ລາຍຈ່າຍ (ສີແດງ)') +
          ' ' + formatNumber(data.amount) + ' ' + currency +
          ' · ຄວາມໝັ້ນໃຈ ' + (data.confidence || '-')
        );
      }
    } catch (err) {
      console.error(err);
      setOcrMessage('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ AI');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setOcrMessage(''), 6000);
    }
  };

  const addLineItem = () => {
    const newId = lineItems.length > 0 ? Math.max(...lineItems.map(l => l.id)) + 1 : 1;
    setLineItems([...lineItems, { id: newId, accountId: transactionType === 'INCOME' ? '707' : '601', description: '', amount: '' }]);
  };
  const removeLineItem = (id: number) => lineItems.length > 1 && setLineItems(lineItems.filter(item => item.id !== id));
  const updateLineItem = (id: number, field: keyof LineItem, value: string) => setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  
  const addPaymentItem = () => {
    const newId = paymentItems.length > 0 ? Math.max(...paymentItems.map(l => l.id)) + 1 : 1;
    setPaymentItems([...paymentItems, { id: newId, accountId: '101', amount: '' }]);
  };
  const removePaymentItem = (id: number) => paymentItems.length > 1 && setPaymentItems(paymentItems.filter(item => item.id !== id));
  const updatePaymentItem = (id: number, field: keyof PaymentItem, value: string) => setPaymentItems(paymentItems.map(item => item.id === id ? { ...item, [field]: value } : item));

  const calculateTotalCategory = () => lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const calculateTotalPayment = () => paymentItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSaveTransaction = () => {
    const totalCategory = calculateTotalCategory();
    const totalPayment = calculateTotalPayment();

    if (totalCategory <= 0 || totalPayment <= 0) return alert('ກະລຸນາໃສ່ຈຳນວນເງິນໃຫ້ຖືກຕ້ອງ');
    if (totalCategory !== totalPayment) return alert(`ຍອດເງິນບໍ່ສົມດຸນ! ຝັ່ງການຊຳລະ: ${formatNumber(totalPayment)} vs ຝັ່ງໝວດໝູ່: ${formatNumber(totalCategory)}`);

    let entries: JournalEntry[] = [];
    if (transactionType === 'INCOME') {
      paymentItems.forEach(item => { if (parseFloat(item.amount) > 0) entries.push({ accountId: item.accountId, dr: parseFloat(item.amount), cr: 0 }); });
      lineItems.forEach(item => { if (parseFloat(item.amount) > 0) entries.push({ accountId: item.accountId, dr: 0, cr: parseFloat(item.amount), desc: item.description }); });
    } else if (transactionType === 'EXPENSE') {
      lineItems.forEach(item => { if (parseFloat(item.amount) > 0) entries.push({ accountId: item.accountId, dr: parseFloat(item.amount), cr: 0, desc: item.description }); });
      paymentItems.forEach(item => { if (parseFloat(item.amount) > 0) entries.push({ accountId: item.accountId, dr: 0, cr: parseFloat(item.amount) }); });
    }

    const newJournal: Journal = {
      id: editingJournalId || Date.now().toString(),
      date: recordDate,
      note: recordNote || (transactionType === 'INCOME' ? 'ຮັບເງິນ' : 'ຈ່າຍເງິນ'),
      type: transactionType,
      entries: entries,
    };

    if (editingJournalId) {
      setJournals(journals.map(j => j.id === editingJournalId ? newJournal : j));
    } else {
      setJournals([newJournal, ...journals]);
    }
    
    resetRecordForm();
    setActiveTab('dashboard'); 
  };

  const resetRecordForm = () => {
    setEditingJournalId(null);
    setRecordNote('');
    setPreviewUrl(null);
    setLineItems([{ id: 1, accountId: transactionType === 'INCOME' ? '707' : '601', description: '', amount: '' }]);
    setPaymentItems([{ id: 1, accountId: '102', amount: '' }]);
  };

  const loadJournalForEditing = (j: Journal) => {
    setEditingJournalId(j.id);
    setRecordDate(j.date);
    setRecordNote(j.note);
    setTransactionType(j.type);
    
    const payments = j.entries.filter(e => (j.type === 'INCOME' ? e.dr > 0 : e.cr > 0))
      .map((e, idx) => ({ id: idx + 1, accountId: e.accountId, amount: String(e.dr || e.cr) }));
    const categories = j.entries.filter(e => (j.type === 'INCOME' ? e.cr > 0 : e.dr > 0))
      .map((e, idx) => ({ id: idx + 1, accountId: e.accountId, description: e.desc || '', amount: String(e.cr || e.dr) }));
    
    setPaymentItems(payments);
    setLineItems(categories);
    setActiveTab('record');
  };

  const [newAccData, setNewAccData] = useState({ code: '', name: '', type: 'EXPENSE' });
  const handleAddAccount = () => {
    if (!newAccData.code || !newAccData.name) return alert('ກະລຸນາໃສ່ລະຫັດ ແລະ ຊື່ບັນຊີ');
    if (accounts[newAccData.code]) return alert('ລະຫັດບັນຊີນີ້ມີຢູ່ແລ້ວ');
    setAccounts({
      ...accounts,
      [newAccData.code]: { id: newAccData.code, name: newAccData.name, type: newAccData.type as any, normalBalance: ['ASSET', 'EXPENSE'].includes(newAccData.type) ? 'DR' : 'CR', openingBalance: 0 }
    });
    setNewAccData({ code: '', name: '', type: 'EXPENSE' });
  };
  const updateOpeningBalance = (code: string, amount: string) => setAccounts({ ...accounts, [code]: { ...accounts[code], openingBalance: parseFloat(amount) || 0 } });

  const [editAccForm, setEditAccForm] = useState({ code: '', name: '', type: '' });
  
  // --- States ສຳລັບ Report ---
  const [reportRange, setReportRange] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY'); 
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const startEditAccount = (acc: Account) => {
    setEditingAccountId(acc.id);
    setEditAccForm({ code: acc.id, name: acc.name, type: acc.type });
  };
  const saveEditedAccount = () => {
    if (!editAccForm.name) return alert('ກະລຸນາໃສ່ຊື່ບັນຊີ');
    const newAccounts = { ...accounts };
    if (editingAccountId && editAccForm.code !== editingAccountId) {
      if (newAccounts[editAccForm.code]) return alert('ລະຫັດນີ້ມີຢູ່ແລ້ວ');
      delete newAccounts[editingAccountId];
    }
    if (editingAccountId) {
      newAccounts[editAccForm.code] = { 
        id: editAccForm.code, 
        name: editAccForm.name, 
        type: editAccForm.type as any,
        normalBalance: ['ASSET', 'EXPENSE'].includes(editAccForm.type) ? 'DR' : 'CR',
        openingBalance: accounts[editingAccountId].openingBalance
      };
      setAccounts(newAccounts);
      setEditingAccountId(null);
    }
  };

  const ledger = useMemo(() => {
    const balances: Record<string, number> = {};
    Object.keys(accounts).forEach(id => balances[id] = accounts[id].openingBalance || 0);
    journals.forEach(journal => journal.entries.forEach(entry => {
        const acc = accounts[entry.accountId];
        if (!acc) return; 
        if (acc.normalBalance === 'DR') balances[entry.accountId] += (entry.dr - entry.cr);
        else balances[entry.accountId] += (entry.cr - entry.dr);
    }));
    return balances;
  }, [journals, accounts]);

  const reportData = useMemo(() => {
    const periodBalances: Record<string, number> = {};
    const cumulativeBalances: Record<string, number> = {};
    
    Object.keys(accounts).forEach(id => {
      periodBalances[id] = 0;
      cumulativeBalances[id] = accounts[id].openingBalance || 0;
    });

    journals.forEach(j => {
      const d = new Date(j.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const isSameYear = y === reportYear;
      const isSameMonth = m === reportMonth && isSameYear;
      
      const isInPeriod = reportRange === 'MONTHLY' ? isSameMonth : isSameYear;
      const isBeforeOrInEnd = reportRange === 'MONTHLY' 
        ? (y < reportYear || (y === reportYear && m <= reportMonth))
        : (y <= reportYear);

      j.entries.forEach(e => {
        const acc = accounts[e.accountId];
        if (!acc) return;
        
        const movement = acc.normalBalance === 'DR' ? (e.dr - e.cr) : (e.cr - e.dr);
        
        if (isInPeriod) periodBalances[e.accountId] += movement;
        if (isBeforeOrInEnd) cumulativeBalances[e.accountId] += movement;
      });
    });

    return { periodBalances, cumulativeBalances };
  }, [journals, accounts, reportRange, reportMonth, reportYear]);

  const exportToPDF = (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const opt = {
      margin: 10,
      filename: fileName + '.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full text-center animate-in fade-in duration-300">
        <div className="flex justify-center mb-5">
          <div className="bg-blue-600 p-4 rounded-xl shadow-md"><Building2 className="w-10 h-10 text-white" /></div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SME Cloud Acc</h1>
        <p className="text-gray-500 text-sm mb-8">ລະບົບບັນຊີສຳລັບທຸລະກິດລາວ</p>
        <div className="space-y-4">
          <button onClick={() => handleLogin('gmail')} className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-4 rounded-xl transition">
            <Mail className="w-5 h-5 text-red-500" /><span>ເຂົ້າສູ່ລະບົບດ້ວຍ Gmail</span>
          </button>
          <button onClick={() => handleLogin('phone')} className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl transition shadow-sm">
            <Phone className="w-5 h-5 text-blue-200" /><span>ເຂົ້າສູ່ລະບົບດ້ວຍເບີໂທ (OTP)</span>
          </button>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div><span className="mx-4 text-gray-400 text-sm">ຫຼື</span><div className="flex-grow border-t border-gray-200"></div>
          </div>
          <button onClick={() => handleLogin('whatsapp')} className="w-full flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3.5 px-4 rounded-xl transition shadow-sm">
            <MessageCircle className="w-5 h-5 text-white" /><span>ເຂົ້າສູ່ລະບົບດ້ວຍ WhatsApp</span>
          </button>
        </div>
        {loginMethod && <p className="mt-6 text-sm text-blue-600 animate-pulse font-medium">ກຳລັງຢືນຢັນຕົວຕົນຜ່ານ {loginMethod}...</p>}
      </div>
    </div>
  );

  if (!user) return renderLogin();

  const totalAssets = Object.values(accounts).filter(a => a.type === 'ASSET').reduce((sum, a) => sum + ledger[a.id], 0);
  const totalIncome = Object.values(accounts).filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + ledger[a.id], 0);
  const totalExpense = Object.values(accounts).filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + ledger[a.id], 0);
  const cashBankAccounts = Object.values(accounts).filter(a => a.type === 'ASSET' || a.type === 'LIABILITY');
  const categoryAccounts = Object.values(accounts).filter(a => transactionType === 'INCOME' ? a.type === 'REVENUE' : a.type === 'EXPENSE');
  
  const menuItems = [
    { id: 'dashboard', label: 'ພາບລວມ (Home)', icon: PieChart },
    { id: 'record', label: 'ບັນທຶກ (Record)', icon: Plus },
    { id: 'accounts', label: 'ຜັງບັນຊີ (Accounts)', icon: BookOpen },
    { id: 'reports', label: 'ລາຍງານ (Reports)', icon: FileText }
  ];

  const accountTypes = [
    { id: 'ASSET', name: 'ຊັບສິນ (ASSET)' },
    { id: 'LIABILITY', name: 'ໜີ້ສິນ (LIABILITY)' },
    { id: 'EQUITY', name: 'ທຶນເຈົ້າຂອງ (EQUITY)' },
    { id: 'REVENUE', name: 'ລາຍຮັບ (REVENUE)' },
    { id: 'EXPENSE', name: 'ລາຍຈ່າຍ (EXPENSE)' }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
          <div className="flex items-center space-x-2"><div className="bg-blue-600 p-1.5 rounded-lg"><Building2 className="w-5 h-5 text-white" /></div><span className="font-bold text-lg text-gray-900 tracking-tight">Cupfee account</span></div>
          <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} /><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
          <div className="flex items-center space-x-3 overflow-hidden mb-4"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600"><User className="w-5 h-5" /></div><div className="truncate"><p className="text-sm font-bold text-gray-900 truncate">{user.name}</p><p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p></div></div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-sm text-red-600 font-bold bg-white border border-red-100 py-2.5 rounded-xl hover:bg-red-50 transition"><LogOut className="w-4 h-4" /><span>ອອກຈາກລະບົບ</span></button>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/50 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center"><button className="md:hidden mr-4 text-gray-600 hover:text-gray-900 p-1.5 bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu className="w-6 h-6" /></button><h1 className="text-lg font-bold text-gray-800">{menuItems.find(m => m.id === activeTab)?.label.split(' ')[0]}</h1></div>
          <div className="hidden md:flex items-center space-x-3 bg-gray-50 px-3.5 py-2 rounded-full border border-gray-200"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider pr-3 border-r border-gray-300">{user.provider}</span><span className="text-sm font-bold text-gray-800">{user.name}</span></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50"></div><p className="text-sm font-medium text-gray-500 mb-1 relative z-10">ຊັບສິນລວມ (Cash & Bank)</p><p className="text-3xl font-bold text-gray-900 relative z-10">{formatNumber(totalAssets)} <span className="text-lg font-medium">₭</span></p></div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 bg-green-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50"></div><p className="text-sm font-medium text-gray-500 mb-1 relative z-10">ລາຍຮັບສະສົມ (Income)</p><p className="text-3xl font-bold text-green-600 relative z-10">{formatNumber(totalIncome)} <span className="text-lg font-medium">₭</span></p></div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 bg-red-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 opacity-50"></div><p className="text-sm font-medium text-gray-500 mb-1 relative z-10">ລາຍຈ່າຍສະສົມ (Expense)</p><p className="text-3xl font-bold text-red-600 relative z-10">{formatNumber(totalExpense)} <span className="text-lg font-medium">₭</span></p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-gray-800">ລາຍການເຄື່ອນໄຫວຫຼ້າສຸດ</h2><button onClick={() => setActiveTab('record')} className="text-sm text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-4 py-2 rounded-lg">+ ບັນທຶກໃໝ່</button></div>
                  {journals.length === 0 ? <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50"/><p>ຍັງບໍ່ມີລາຍການເຄື່ອນໄຫວ</p></div> : 
                  <div className="space-y-3">
                    {journals.slice(0, 10).map(j => {
                      const totalAmount = j.entries.filter(e => (j.type === 'INCOME' ? e.dr > 0 : e.cr > 0)).reduce((sum, e) => sum + (e.dr || e.cr), 0);
                      return (
                        <div key={j.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition group">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${j.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              <ArrowRight className={`w-5 h-5 transform ${j.type === 'INCOME' ? 'rotate-45' : '-rotate-45'}`} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{j.note}</p>
                              <p className="text-xs text-gray-500">{j.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`font-bold text-lg ${j.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                              {j.type === 'INCOME' ? '+' : '-'}{formatNumber(totalAmount)}
                            </div>
                            <button onClick={() => loadJournalForEditing(j)} className="p-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition">
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>}
                </div>
              </div>
            )}

            {/* Record Tab */}
            {activeTab === 'record' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">ອັບໂຫລດສະລິບ (AI ອ່ານໃຫ້)</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-white transition" onClick={() => document.getElementById('slipUpload')?.click()}>
                    <input type="file" id="slipUpload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    {previewUrl ? <img src={previewUrl} className="max-h-48 mx-auto rounded-lg shadow-sm" alt="Slip" /> : <div className="text-gray-400"><Upload className="w-10 h-10 mx-auto mb-2 opacity-50"/><p className="text-sm">ຄລິກເພື່ອອັບໂຫລດສະລິບ</p><p className="text-[11px] mt-1 text-gray-400">AI ຈະອ່ານ ແລະ ແຍກລາຍຮັບ/ລາຍຈ່າຍໃຫ້</p></div>}
                  </div>
                  {isProcessing && <p className="mt-4 text-sm text-blue-600 flex justify-center bg-blue-50 py-2 rounded-lg font-medium"><Loader2 className="w-4 h-4 mr-2 animate-spin"/>ກຳລັງອ່ານຂໍ້ມູນ...</p>}
                  {ocrMessage && !isProcessing && <p className="mt-4 text-sm text-center font-bold bg-white p-2 rounded-lg border text-green-700 shadow-sm">{ocrMessage}</p>}
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Anthropic API Key</label>
                    <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => saveApiKey(e.target.value)} className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">ໃສ່ Key ຄັ້ງດຽວ — ເກັບໄວ້ໃນ browser ນີ້ (localStorage). {apiKey ? '✅ ບັນທຶກແລ້ວ' : '⚠️ ຍັງບໍ່ມີ Key'}</p>
                  </div>
                </div>
                <div className="w-full md:w-2/3 p-6">
                  <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-xl">
                    <button className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${transactionType === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`} onClick={() => { setTransactionType('INCOME'); setLineItems([{ id: 1, accountId: '707', description: '', amount: '' }]); }}>ຮັບເງິນ (Income)</button>
                    <button className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${transactionType === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`} onClick={() => { setTransactionType('EXPENSE'); setLineItems([{ id: 1, accountId: '601', description: '', amount: '' }]); }}>ຈ່າຍເງິນ (Expense)</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">ວັນທີ</label><input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={recordDate} onChange={e => setRecordDate(e.target.value)} /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">ອະທິບາຍລວມ (Note)</label><input type="text" placeholder="ເຊັ່ນ: ຂາຍເຄື່ອງ..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={recordNote} onChange={e => setRecordNote(e.target.value)} /></div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-3 border-b pb-2">{transactionType === 'INCOME' ? '1. ຝັ່ງຮັບເງິນ (Bank/Cash)' : '1. ຝັ່ງຈ່າຍເງິນ (Bank/Cash)'}</label>
                    <div className="space-y-3">
                      {paymentItems.map((item) => (
                        <div key={item.id} className="flex gap-2">
                          <div className="w-1/2">
                            <SearchableSelect 
                              options={cashBankAccounts} 
                              value={item.accountId} 
                              onChange={val => updatePaymentItem(item.id, 'accountId', val)} 
                              placeholder="ເລືອກບັນຊີເງິນ..."
                            />
                          </div>
                          <div className="w-1/2 relative">
                            <input type="number" placeholder="ຈຳນວນເງິນ" className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2.5 text-right font-bold outline-none" value={item.amount} onChange={e => updatePaymentItem(item.id, 'amount', e.target.value)} />
                            {paymentItems.length > 1 && <button onClick={() => removePaymentItem(item.id)} className="absolute -right-8 top-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addPaymentItem} className="mt-3 text-sm text-blue-600 font-bold flex items-center hover:bg-blue-50 px-3 py-1.5 rounded-lg"><PlusCircle className="w-4 h-4 mr-1.5" /> ເພີ່ມບັນຊີຊຳລະ</button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-3 border-b pb-2">{transactionType === 'INCOME' ? '2. ຝັ່ງໝວດໝູ່ລາຍຮັບ (Category)' : '2. ຝັ່ງໝວດໝູ່ລາຍຈ່າຍ (Category)'}</label>
                    <div className="space-y-3">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex gap-2">
                          <div className="w-1/3">
                            <SearchableSelect 
                              options={categoryAccounts} 
                              value={item.accountId} 
                              onChange={val => updateLineItem(item.id, 'accountId', val)} 
                              placeholder="ເລືອກໝວດໝູ່..."
                            />
                          </div>
                          <div className="w-1/3">
                            <input type="text" placeholder="ຄຳອະທິບາຍ" className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2.5 font-medium outline-none" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} />
                          </div>
                          <div className="w-1/3 relative">
                            <input type="number" placeholder="ຈຳນວນເງິນ" className="w-full text-sm bg-white border border-gray-200 rounded-xl p-2.5 text-right font-bold outline-none" value={item.amount} onChange={e => updateLineItem(item.id, 'amount', e.target.value)} />
                            {lineItems.length > 1 && <button onClick={() => removeLineItem(item.id)} className="absolute -right-8 top-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addLineItem} className="mt-3 text-sm text-blue-600 font-bold flex items-center hover:bg-blue-50 px-3 py-1.5 rounded-lg"><PlusCircle className="w-4 h-4 mr-1.5" /> ເພີ່ມລາຍການ</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">ລວມຝັ່ງຊຳລະ</span>
                      <span className="text-lg font-bold text-gray-900">{formatNumber(calculateTotalPayment())} ₭</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">ລວມຝັ່ງໝວດໝູ່</span>
                      <span className="text-lg font-bold text-gray-900">{formatNumber(calculateTotalCategory())} ₭</span>
                    </div>
                  </div>
                  
                  <button onClick={handleSaveTransaction} className={`w-full font-bold py-4 rounded-xl shadow-md transition ${calculateTotalPayment() === calculateTotalCategory() && calculateTotalPayment() > 0 ? 'bg-blue-600 hover:bg-slate-800 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    {editingJournalId ? 'ອັບເດດລາຍການ' : 'ບັນທຶກລົງບັນຊີ'}
                  </button>
                  {editingJournalId && <button onClick={resetRecordForm} className="w-full mt-3 text-sm font-bold text-gray-500 hover:text-gray-700">ຍົກເລີກການແກ້ໄຂ</button>}
                </div>
              </div>
            )}

            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                  <h3 className="font-bold text-gray-800 mb-5 border-b pb-3">ເພີ່ມຜັງບັນຊີໃໝ່</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">ໝວດໝູ່</label>
                      <SearchableSelect 
                        options={accountTypes} 
                        value={newAccData.type} 
                        onChange={val => setNewAccData({...newAccData, type: val})} 
                        placeholder="ເລືອກປະເພດບັນຊີ..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">ລະຫັດ</label>
                      <input type="text" className="w-full border border-gray-200 p-3 rounded-xl font-medium outline-none" value={newAccData.code} onChange={e => setNewAccData({...newAccData, code: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1.5">ຊື່ບັນຊີ</label>
                      <input type="text" className="w-full border border-gray-200 p-3 rounded-xl font-medium outline-none" value={newAccData.name} onChange={e => setNewAccData({...newAccData, name: e.target.value})} />
                    </div>
                    <button onClick={handleAddAccount} className="w-full bg-gray-900 text-white font-bold p-3 rounded-xl hover:bg-black transition">ບັນທຶກຜັງບັນຊີ</button>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3 border-b pb-3">ຜັງບັນຊີ ແລະ ຍອດຍົກມາ</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="p-3">ລະຫັດ</th>
                          <th className="p-3">ຊື່ບັນຊີ</th>
                          <th className="p-3 text-right">ຍອດຍົກມາ (₭)</th>
                          <th className="p-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(accounts).sort((a,b) => a.id.localeCompare(b.id)).map(acc => (
                          <tr key={acc.id} className="border-b border-gray-50 hover:bg-gray-50">
                            {editingAccountId === acc.id ? (
                              <>
                                <td className="p-2"><input type="text" className="w-full border border-gray-200 p-2 rounded-lg" value={editAccForm.code} onChange={e => setEditAccForm({...editAccForm, code: e.target.value})} /></td>
                                <td className="p-2">
                                  <input type="text" className="w-full border border-gray-200 p-2 rounded-lg mb-1" value={editAccForm.name} onChange={e => setEditAccForm({...editAccForm, name: e.target.value})} />
                                  <SearchableSelect 
                                    options={accountTypes} 
                                    value={editAccForm.type} 
                                    onChange={val => setEditAccForm({...editAccForm, type: val})} 
                                    placeholder="ປະເພດ..."
                                  />
                                </td>
                                <td className="p-2 text-right">-</td>
                                <td className="p-2 text-center">
                                  <div className="flex justify-center space-x-2">
                                    <button onClick={saveEditedAccount} className="p-1.5 bg-green-100 text-green-600 rounded-lg"><Plus className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingAccountId(null)} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-3 font-medium text-gray-400">{acc.id}</td>
                                <td className="p-3 font-semibold text-gray-800">
                                  {acc.name} 
                                  <span className="block text-[10px] text-gray-400 uppercase">{acc.type}</span>
                                </td>
                                <td className="p-3 text-right">
                                  {['ASSET', 'LIABILITY', 'EQUITY'].includes(acc.type) ? 
                                    <input type="number" className="w-32 text-right border border-gray-200 rounded-lg p-2 bg-white font-bold outline-none" value={acc.openingBalance} onChange={(e) => updateOpeningBalance(acc.id, e.target.value)} /> 
                                    : <span className="text-gray-300">-</span>
                                  }
                                </td>
                                <td className="p-3 text-center">
                                  <button onClick={() => startEditAccount(acc)} className="p-2 text-gray-400 hover:text-blue-600 transition">
                                    <FileText className="w-4 h-4" />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-8">
                {/* Report Filters */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ໄລຍະເວລາລາຍງານ</label>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                      <button onClick={() => setReportRange('MONTHLY')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportRange === 'MONTHLY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>ລາຍເດືອນ</button>
                      <button onClick={() => setReportRange('ANNUAL')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportRange === 'ANNUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>ລາຍປີ</button>
                    </div>
                  </div>
                  {reportRange === 'MONTHLY' && (
                    <div className="w-full md:w-40">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ເດືອນ</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-bold outline-none" value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))}>
                        {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>ເດືອນ {i+1}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="w-full md:w-32">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">ປີ</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-bold outline-none" value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))}>
                      {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="md:ml-auto">
                    <button onClick={() => exportToPDF('financial-report', `Financial_Report_${reportRange}_${reportYear}_${reportMonth}`)} className="flex items-center space-x-2 bg-blue-600 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md">
                      <Download className="w-4 h-4" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>

                {/* Financial Report Content */}
                <div id="financial-report" className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm max-w-4xl mx-auto text-gray-900">
                  <div className="text-center mb-10 pb-6 border-b-2 border-gray-900">
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-gray-900">ໃບສະຫຼຸບລາຍງານການເງິນ</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                      {reportRange === 'MONTHLY' ? `ປະຈຳເດືອນ ${reportMonth} ປີ ${reportYear}` : `ປະຈຳປີ ${reportYear}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Income Statement */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-black border-b-2 border-gray-200 pb-2 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        ໃບສະຫຼຸບລາຍຮັບ-ລາຍຈ່າຍ
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-black text-blue-600 uppercase mb-2 tracking-widest">ລາຍຮັບ (Income)</p>
                          {Object.values(accounts).filter(a => a.type === 'REVENUE').map(acc => {
                            const bal = reportData.periodBalances[acc.id] || 0;
                            if (bal === 0) return null;
                            return (
                              <div key={acc.id} className="flex justify-between py-1.5 text-sm border-b border-gray-50 px-2 hover:bg-gray-50">
                                <span className="font-medium text-gray-700">{acc.name}</span>
                                <span className="font-bold">{formatNumber(bal)}</span>
                              </div>
                            );
                          })}
                          <div className="flex justify-between font-black text-gray-900 pt-3 mt-2 bg-blue-50/50 px-3 py-2 rounded-lg">
                            <span>ລວມລາຍຮັບ</span>
                            <span>{formatNumber(Object.values(accounts).filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + (reportData.periodBalances[a.id] || 0), 0))}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black text-red-600 uppercase mb-2 tracking-widest">ລາຍຈ່າຍ (Expenses)</p>
                          {Object.values(accounts).filter(a => a.type === 'EXPENSE').map(acc => {
                            const bal = reportData.periodBalances[acc.id] || 0;
                            if (bal === 0) return null;
                            return (
                              <div key={acc.id} className="flex justify-between py-1.5 text-sm border-b border-gray-50 px-2 hover:bg-gray-50">
                                <span className="font-medium text-gray-700">{acc.name}</span>
                                <span className="font-bold">{formatNumber(bal)}</span>
                              </div>
                            );
                          })}
                          <div className="flex justify-between font-black text-gray-900 pt-3 mt-2 bg-red-50/50 px-3 py-2 rounded-lg">
                            <span>ລວມລາຍຈ່າຍ</span>
                            <span>{formatNumber(Object.values(accounts).filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + (reportData.periodBalances[a.id] || 0), 0))}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t-2 border-gray-900 mt-6">
                          <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg">
                            <span className="font-black text-lg">ກຳໄລສຸດທິ</span>
                            <span className="text-2xl font-black tracking-tight">
                              {formatNumber(
                                Object.values(accounts).filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + (reportData.periodBalances[a.id] || 0), 0) -
                                Object.values(accounts).filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + (reportData.periodBalances[a.id] || 0), 0)
                              )} ₭
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Sheet */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-black border-b-2 border-gray-200 pb-2 flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-green-600" />
                        ໃບສະຫຼຸບຊັບສົມບັດ
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-black text-green-600 uppercase mb-2 tracking-widest">ຊັບສິນ (Assets)</p>
                          {Object.values(accounts).filter(a => a.type === 'ASSET').map(acc => {
                            const bal = reportData.cumulativeBalances[acc.id] || 0;
                            if (bal === 0) return null;
                            return (
                              <div key={acc.id} className="flex justify-between py-1.5 text-sm border-b border-gray-50 px-2 hover:bg-gray-50">
                                <span className="font-medium text-gray-700">{acc.name}</span>
                                <span className="font-bold">{formatNumber(bal)}</span>
                              </div>
                            );
                          })}
                          <div className="flex justify-between font-black text-gray-900 pt-3 mt-2 bg-green-50 px-3 py-2 rounded-lg">
                            <span>ລວມຊັບສິນ</span>
                            <span>{formatNumber(Object.values(accounts).filter(a => a.type === 'ASSET').reduce((sum, a) => sum + (reportData.cumulativeBalances[a.id] || 0), 0))}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-black text-orange-600 uppercase mb-2 tracking-widest">ໜີ້ສິນ ແລະ ທຶນ (Liabilities & Equity)</p>
                          {Object.values(accounts).filter(a => a.type === 'LIABILITY' || a.type === 'EQUITY').map(acc => {
                            const bal = reportData.cumulativeBalances[acc.id] || 0;
                            if (bal === 0) return null;
                            return (
                              <div key={acc.id} className="flex justify-between py-1.5 text-sm border-b border-gray-50 px-2 hover:bg-gray-50">
                                <span className="font-medium text-gray-700">{acc.name}</span>
                                <span className="font-bold">{formatNumber(bal)}</span>
                              </div>
                            );
                          })}
                          
                          <div className="flex justify-between py-1.5 text-sm border-b border-gray-50 px-2 italic text-slate-800">
                            <span className="font-medium">ກຳໄລສະສົມ (Retained Earnings)</span>
                            <span className="font-bold">
                              {formatNumber(
                                Object.values(accounts).filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + (reportData.cumulativeBalances[a.id] || 0), 0) -
                                Object.values(accounts).filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + (reportData.cumulativeBalances[a.id] || 0), 0)
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between font-black text-gray-900 pt-3 mt-2 bg-orange-50 px-3 py-2 rounded-lg">
                            <span>ລວມໜີ້ສິນ ແລະ ທຶນ</span>
                            <span>
                              {formatNumber(
                                Object.values(accounts).filter(a => a.type === 'LIABILITY' || a.type === 'EQUITY').reduce((sum, a) => sum + (reportData.cumulativeBalances[a.id] || 0), 0) +
                                (Object.values(accounts).filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + (reportData.cumulativeBalances[a.id] || 0), 0) -
                                 Object.values(accounts).filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + (reportData.cumulativeBalances[a.id] || 0), 0))
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 flex justify-around text-center border-t-2 border-gray-100 pt-8">
                    <div className="w-40">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-12 tracking-widest">ຜູ້ເຮັດບົດລາຍງານ</p>
                      <div className="border-b border-gray-300 w-full mb-2"></div>
                      <p className="text-sm font-bold text-gray-400">..............................</p>
                    </div>
                    <div className="w-40">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-12 tracking-widest">ຜູ້ອະນຸມັດ</p>
                      <div className="border-b border-gray-300 w-full mb-2"></div>
                      <p className="text-sm font-bold text-gray-400">..............................</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
