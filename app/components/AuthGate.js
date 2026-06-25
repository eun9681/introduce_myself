'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGate({ adminOnly = false, children }) {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((resp) => resp.ok ? resp.json() : { user: null })
      .then((data) => {
        const user = data.user;
        const allowed = Boolean(user && (!adminOnly || user.role === 'admin'));

        setState({ loading: false, allowed });
        if (!allowed) router.push(adminOnly ? '/study' : '/login');
      })
      .catch(() => {
        setState({ loading: false, allowed: false });
        router.push('/login');
      });
  }, [adminOnly, router]);

  if (state.loading) return <div className="loading">로그인 정보를 확인하는 중...</div>;
  if (!state.allowed) return <div className="loading">접근 권한이 없습니다.</div>;

  return children;
}
