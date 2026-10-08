'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Could not process request. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Connection error. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-[#ccff00] rounded-xl flex items-center justify-center shadow-lg shadow-[#ccff00]/20">
              <span className="text-black font-black text-base">M</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">MaxFunded</span>
          </Link>
        </div>

        <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white mb-2">Forgot Password?</h1>
                <p className="text-neutral-400 text-sm">Enter your registered email and we'll send you a secure reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="trader@example.com"
                      className="w-full bg-[#111418] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]/50 text-sm transition"
                    />
                  </div>
                </div>

                {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ccff00] text-black font-black py-3 rounded-xl hover:bg-[#b8e600] transition disabled:opacity-50 shadow-lg shadow-[#ccff00]/10 text-sm uppercase tracking-wider"
                >
                  {loading ? 'Sending Request...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-[#ccff00] mx-auto mb-4" />
              <h2 className="text-xl font-black text-white mb-2">Check Your Inbox</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                If <strong className="text-white">{email}</strong> is registered, a password reset link has been dispatched.
              </p>
              <p className="text-neutral-500 text-xs mt-4">Check your spam folder if you do not receive it within 2 minutes.</p>
            </div>
          )}

          <div className="mt-6 text-center border-t border-white/5 pt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
