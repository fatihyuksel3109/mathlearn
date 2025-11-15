'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || t('pages.verifyEmail.error');
        let localizedError = errorMsg;
        
        if (errorMsg === 'Email and code are required') {
          localizedError = t('errors.emailRequired') + ' ' + t('errors.codeRequired');
        } else if (errorMsg === 'Invalid code format') {
          localizedError = t('errors.invalidCodeFormat');
        } else if (errorMsg === 'Invalid or expired OTP code') {
          localizedError = t('errors.invalidOrExpiredCode');
        } else if (errorMsg === 'OTP code has expired') {
          localizedError = t('errors.codeExpired');
        } else if (errorMsg === 'User not found') {
          localizedError = t('errors.userNotFound');
        }
        
        setError(localizedError);
        setLoading(false);
        return;
      }

      setSuccess(t('pages.verifyEmail.success'));
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    } catch (err) {
      setError(t('pages.verifyEmail.error'));
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError(t('pages.verifyEmail.emailRequired'));
      return;
    }

    setError('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || t('pages.verifyEmail.resendError');
        let localizedError = errorMsg;
        
        if (errorMsg === 'Email is required') {
          localizedError = t('errors.emailRequired');
        } else if (errorMsg.includes('SMTP')) {
          localizedError = t('errors.emailSendFailed');
        }
        
        setError(localizedError);
        setResending(false);
        return;
      }

      setSuccess(t('pages.verifyEmail.resendSuccess'));
      setResending(false);
    } catch (err) {
      setError(t('pages.verifyEmail.resendError'));
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white cute-border cute-shadow p-8 max-w-md w-full"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center mb-6"
        >
          <div className="text-6xl mb-4">✉️</div>
          <h1 className="text-3xl font-bold text-cute-primary">{t('pages.verifyEmail.title')}</h1>
        </motion.div>

        <p className="text-center text-gray-600 mb-6">
          {t('pages.verifyEmail.description')}
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pages.verifyEmail.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-4 border-cute-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-cute-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pages.verifyEmail.code')}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              required
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-2 border-4 border-cute-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-cute-accent text-center text-2xl font-bold tracking-widest"
            />
            <p className="text-xs text-gray-500 mt-1">{t('pages.verifyEmail.codeHint')}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border-4 border-red-400 rounded-xl p-3 text-red-700"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-100 border-4 border-green-400 rounded-xl p-3 text-green-700"
            >
              {success}
            </motion.div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || code.length !== 6}
            className="w-full bg-cute-primary text-white py-3 rounded-xl font-bold text-lg cute-shadow hover:bg-cute-secondary transition-colors disabled:opacity-50"
          >
            {loading ? t('pages.verifyEmail.verifying') : t('pages.verifyEmail.verifyButton')} ✅
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="text-cute-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? t('pages.verifyEmail.resending') : t('pages.verifyEmail.resendCode')}
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          {t('pages.verifyEmail.backToLogin')}{' '}
          <Link href={`/${locale}/login`} className="text-cute-primary font-bold hover:underline">
            {t('pages.verifyEmail.login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-purple to-pastel-blue">
        <div className="text-2xl text-cute-primary">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

