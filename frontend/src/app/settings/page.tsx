'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import {
  User,
  Shield,
  Wallet,
  Bell,
  Save,
  Lock,
  Eye,
  EyeOff,
  Building,
  Coins,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Check,
} from 'lucide-react';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'payout' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('GB');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('TRADER');
  const [kycStatus, setKycStatus] = useState('NOT_REQUIRED');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Payout Details State
  const [payoutMethod, setPayoutMethod] = useState<'USDT_TRC20' | 'BANK_WIRE' | 'PAYPAL'>('USDT_TRC20');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Notification Preferences State
  const [notifPayouts, setNotifPayouts] = useState(true);
  const [notifBreaches, setNotifBreaches] = useState(true);
  const [notifPasses, setNotifPasses] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);
  const [browserNotifs, setBrowserNotifs] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.token) {
      router.push('/login');
      return;
    }

    setEmail(session.email || '');

    // Fetch user details
    fetch('http://127.0.0.1:8000/api/v1/users/me', {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setCountry(data.country || 'GB');
          setPhone(data.phone || '');
          setRole(data.role || 'TRADER');
          setKycStatus(data.kyc_status || 'NOT_REQUIRED');
        }
      })
      .catch(() => {});

    // Load stored payout & notification prefs from localStorage
    try {
      const savedPayout = localStorage.getItem('maxfunded_payout_details');
      if (savedPayout) {
        const p = JSON.parse(savedPayout);
        if (p.method) setPayoutMethod(p.method);
        if (p.usdtAddress) setUsdtAddress(p.usdtAddress);
        if (p.bankName) setBankName(p.bankName);
        if (p.accountName) setAccountName(p.accountName);
        if (p.accountNumber) setAccountNumber(p.accountNumber);
        if (p.swiftCode) setSwiftCode(p.swiftCode);
        if (p.paypalEmail) setPaypalEmail(p.paypalEmail);
      }

      const savedNotifs = localStorage.getItem('maxfunded_notification_prefs');
      if (savedNotifs) {
        const n = JSON.parse(savedNotifs);
        setNotifPayouts(n.payouts ?? true);
        setNotifBreaches(n.breaches ?? true);
        setNotifPasses(n.passes ?? true);
        setNotifDigest(n.digest ?? false);
        setBrowserNotifs(n.browser ?? false);
      }
    } catch {}
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const session = getSession();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          country: country,
          phone: phone,
        }),
      });

      if (res.ok) {
        toast.success('Profile details updated successfully');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Failed to update profile');
      }
    } catch {
      toast.error('Network connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const session = getSession();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Could not change password');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayoutDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      method: payoutMethod,
      usdtAddress,
      bankName,
      accountName,
      accountNumber,
      swiftCode,
      paypalEmail,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('maxfunded_payout_details', JSON.stringify(details));
    toast.success('Payout withdrawal destination saved');
  };

  const handleSaveNotifications = () => {
    const prefs = {
      payouts: notifPayouts,
      breaches: notifBreaches,
      passes: notifPasses,
      digest: notifDigest,
      browser: browserNotifs,
    };
    localStorage.setItem('maxfunded_notification_prefs', JSON.stringify(prefs));
    toast.success('Notification preferences saved');
  };

  const handleToggleBrowserNotifs = async () => {
    if (!browserNotifs && typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setBrowserNotifs(true);
        toast.success('Browser notifications allowed');
      } else {
        toast.error('Browser notification permission was denied');
      }
    } else {
      setBrowserNotifs(!browserNotifs);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
              TRADER PROFILE
            </span>
            <span className="text-xs text-neutral-500 font-mono">ROLE: {role}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your personal profile, security credentials, payout payout rails, and notification rules.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Information
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            Security & 2FA
          </button>

          <button
            onClick={() => setActiveTab('payout')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'payout'
                ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Payout Details
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PROFILE INFORMATION */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2">Trader Dossier</h2>
            <p className="text-xs text-neutral-400 mb-6">
              Ensure your identity matches your official KYC documentation for frictionless payout disbursements.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Legal Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]/50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Account Email (Primary)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-[#111418]/50 border border-white/5 rounded-xl px-4 py-3 text-neutral-400 text-sm cursor-not-allowed"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Email address cannot be modified once verified.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Country of Residence
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ccff00]/50"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#111418] text-white">
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7911 123456"
                    className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]/50 text-sm"
                  />
                </div>
              </div>

              {/* KYC Status Card */}
              <div className="bg-[#111418] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 font-semibold block">KYC Verification Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-md ${
                        kycStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : kycStatus === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {kycStatus}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {kycStatus === 'APPROVED'
                        ? 'Unlimited payout clearance enabled'
                        : 'Required to withdraw live challenge profits'}
                    </span>
                  </div>
                </div>
                {kycStatus !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => router.push('/kyc')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition"
                  >
                    Complete KYC &rarr;
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ccff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#b8e600] transition disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SECURITY & PASSWORD */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-2">Change Password</h2>
              <p className="text-xs text-neutral-400 mb-6">
                Update your login credentials. You will not be logged out of active trading sessions.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#ccff00]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#ccff00]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-[#111418] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ccff00]/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#ccff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#b8e600] transition disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* 2FA Card */}
            <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-6 sm:p-8 flex items-start gap-4">
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">Two-Factor Authentication (2FA)</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                  Add an extra layer of protection using Google Authenticator, Authy, or hardware security keys on withdrawals and risk dashboard sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PAYOUT DETAILS */}
        {/* ========================================================================= */}
        {activeTab === 'payout' && (
          <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2">Default Withdrawal Destinations</h2>
            <p className="text-xs text-neutral-400 mb-6">
              Configure where profit splits are sent when you request payouts from passed evaluations.
            </p>

            <form onSubmit={handleSavePayoutDetails} className="space-y-6">
              {/* Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('USDT_TRC20')}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    payoutMethod === 'USDT_TRC20'
                      ? 'bg-[#ccff00]/10 border-[#ccff00]'
                      : 'bg-[#111418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Coins className={`w-6 h-6 ${payoutMethod === 'USDT_TRC20' ? 'text-[#ccff00]' : 'text-neutral-400'}`} />
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      INSTANT
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">USDT (TRC-20)</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Zero bank fees, rapid settlement</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('BANK_WIRE')}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    payoutMethod === 'BANK_WIRE'
                      ? 'bg-[#ccff00]/10 border-[#ccff00]'
                      : 'bg-[#111418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Building className={`w-6 h-6 ${payoutMethod === 'BANK_WIRE' ? 'text-[#ccff00]' : 'text-neutral-400'}`} />
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                      1-2 DAYS
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Bank Wire / SWIFT</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Direct to corporate or retail account</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('PAYPAL')}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    payoutMethod === 'PAYPAL'
                      ? 'bg-[#ccff00]/10 border-[#ccff00]'
                      : 'bg-[#111418] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <CreditCard className={`w-6 h-6 ${payoutMethod === 'PAYPAL' ? 'text-[#ccff00]' : 'text-neutral-400'}`} />
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      GLOBAL
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">PayPal</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Email-linked balance payout</p>
                  </div>
                </button>
              </div>

              {/* Conditional Inputs */}
              {payoutMethod === 'USDT_TRC20' && (
                <div className="space-y-3 bg-[#111418] p-5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      USDT TRC-20 Wallet Address
                    </label>
                    <span className="text-[11px] font-mono text-[#ccff00]">Network: TRON (TRC20)</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    placeholder="T..."
                    className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#ccff00]/50"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Always confirm you provide a valid TRC-20 TRON address. Transactions sent to incorrect networks cannot be recovered.
                  </p>
                </div>
              )}

              {payoutMethod === 'BANK_WIRE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#111418] p-5 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Barclays / Chase"
                      className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Must match KYC legal name"
                      className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Account / IBAN Number
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="GB29..."
                      className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      required
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="BARCGB22"
                      className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {payoutMethod === 'PAYPAL' && (
                <div className="space-y-3 bg-[#111418] p-5 rounded-xl border border-white/5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    PayPal Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="paypal@trader.com"
                    className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ccff00]/50"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="bg-[#ccff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#b8e600] transition text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Payout Information
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NOTIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2">Notification Preferences</h2>
            <p className="text-xs text-neutral-400 mb-6">
              Control the operational emails and real-time alerts dispatched to your devices.
            </p>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#111418] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <div>
                  <span className="font-bold text-sm text-white block">Payout Approvals & Dispatches</span>
                  <span className="text-xs text-neutral-400">Receive an email whenever profit disbursements are finalized</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPayouts}
                  onChange={(e) => setNotifPayouts(e.target.checked)}
                  className="w-5 h-5 accent-[#ccff00] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111418] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <div>
                  <span className="font-bold text-sm text-white block">Drawdown & Risk Alerts</span>
                  <span className="text-xs text-neutral-400">Instant notification if daily loss threshold reaches 80%</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifBreaches}
                  onChange={(e) => setNotifBreaches(e.target.checked)}
                  className="w-5 h-5 accent-[#ccff00] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111418] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <div>
                  <span className="font-bold text-sm text-white block">Phase Passed Celebrations</span>
                  <span className="text-xs text-neutral-400">Receive certificate links when Phase 1 or Phase 2 targets are hit</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPasses}
                  onChange={(e) => setNotifPasses(e.target.checked)}
                  className="w-5 h-5 accent-[#ccff00] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#111418] border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <div>
                  <span className="font-bold text-sm text-white block">Weekly Trading Digest</span>
                  <span className="text-xs text-neutral-400">Sunday performance recap with profit factor and win-rate statistics</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifDigest}
                  onChange={(e) => setNotifDigest(e.target.checked)}
                  className="w-5 h-5 accent-[#ccff00] cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleToggleBrowserNotifs}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition ${
                    browserNotifs ? 'bg-[#ccff00]/10 border-[#ccff00]/50' : 'bg-[#111418] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="text-left">
                    <span className="font-bold text-sm text-white block">Browser Desktop Notifications</span>
                    <span className="text-xs text-neutral-400">
                      {browserNotifs ? 'Active — Real-time alerts will pop up on your desktop' : 'Click to enable system notifications'}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${browserNotifs ? 'bg-[#ccff00] border-[#ccff00]' : 'border-neutral-600'}`}>
                    {browserNotifs && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </div>
                </button>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  className="bg-[#ccff00] text-black font-black px-6 py-3 rounded-xl hover:bg-[#b8e600] transition text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
