'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Something went wrong';
        let localizedError = errorMsg;
        
        if (errorMsg === 'Please provide all fields') {
          localizedError = t('pages.signup.allFieldsRequired');
        } else if (errorMsg === 'Password must be at least 6 characters') {
          localizedError = t('pages.signup.passwordMinLength');
        } else if (errorMsg === 'User already exists with this email') {
          localizedError = t('pages.signup.userAlreadyExists');
        } else if (errorMsg.includes('failed to send verification email')) {
          localizedError = t('pages.signup.emailSendFailed');
        }
        
        setError(localizedError);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(t('pages.signup.error'));
      setLoading(false);
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
          <div className="text-6xl mb-4">🦊</div>
          <h1 className="text-3xl font-bold text-cute-primary">{t('pages.signup.title')}</h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pages.signup.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border-4 border-cute-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-cute-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('pages.signup.email')}
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
              {t('pages.signup.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border-4 border-cute-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-cute-accent"
            />
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

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full bg-cute-primary text-white py-3 rounded-xl font-bold text-lg cute-shadow hover:bg-cute-secondary transition-colors disabled:opacity-50"
          >
            {loading ? t('pages.signup.creatingAccount') : t('pages.signup.signUpButton')} 🎉
          </motion.button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {t('pages.signup.hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="text-cute-primary font-bold hover:underline">
            {t('pages.signup.login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

