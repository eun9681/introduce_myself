'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) throw new Error(data.error || '로그인에 실패했습니다.');

      if (accountType === 'admin') {
        if (data.user?.role !== 'admin') {
          await fetch('/api/auth/logout', { method: 'POST' });
          throw new Error('관리자 권한이 없는 계정입니다.');
        }
        router.push('/admin');
      } else {
        router.push('/board');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <section className="auth-card auth-card-structured">
          <div className="auth-heading">
            <h2>로그인</h2>
            <p>
              {accountType === 'admin'
                ? '관리자 이메일과 비밀번호로 로그인하면 관리자 페이지로 이동합니다.'
                : '로그인을 하시면 게시판 작성 기능을 이용할 수 있습니다.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="회원 유형">
            <button
              className={`auth-tab ${accountType === 'user' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setAccountType('user');
                setError('');
              }}
            >
              일반 회원
            </button>
            <button
              className={`auth-tab ${accountType === 'admin' ? 'active' : ''}`}
              type="button"
              onClick={() => {
                setAccountType('admin');
                setError('');
              }}
            >
              admin 계정
            </button>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? '로그인 중...' : 'Login'}
            </button>
          </form>

          <nav className="auth-sub-actions" aria-label="로그인 보조 메뉴">
            <Link href="/signup">회원가입</Link>
            <span aria-hidden="true" />
            <Link href="/board">게시판 보기</Link>
          </nav>
        </section>
      </main>
    </>
  );
}
