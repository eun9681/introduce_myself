'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((resp) => resp.ok ? resp.json() : { user: null })
      .then((data) => {
        if (mounted) setUser(data.user || null);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/main/main.html');
    router.refresh();
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="/logo.png" alt="logo" />
        <h1>김다은</h1>
      </div>

      <div className="menu">
        <a href="/main/main.html">홈</a>
        <Link href="/board">게시판</Link>
        <Link href="/study">공부기록</Link>
        <a href="https://share.google/D5ClHaEjnHNU6YscY">채용공고 확인</a>
        <a href="https://share.google/D25ngATn7ulcb0MBA">IBK기업은행 홈페이지</a>
        {user ? (
          <>
            {user.role === 'admin' && <Link href="/admin">Admin</Link>}
            <span className="user-name">{user.name}</span>
            <button className="header-button" onClick={logout}>Logout</button>
          </>
        ) : !loading ? (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
