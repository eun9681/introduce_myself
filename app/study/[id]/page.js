'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarkdownView from "../../components/MarkdownView";
import SiteHeader from "../../components/SiteHeader";

export default function StudyRead() {
  const router = useRouter();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [studyResp, meResp] = await Promise.all([
          fetch(`/api/study/${id}`),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);
        if (!studyResp.ok) throw new Error('not found');
        const studyData = await studyResp.json();
        const meData = meResp.ok ? await meResp.json() : { user: null };
        setItem(studyData);
        setUser(meData.user || null);
      } catch {
        setError(true);
      }
    })();
  }, [id]);

  const onDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const resp = await fetch(`/api/study/${id}`, { method: 'DELETE' });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      alert(data.error || '삭제 실패');
    }
  };

  if (!item && !error) return <div className="loading">로딩중...</div>;
  if (error) {
    return (
      <>
        <SiteHeader />
        <div className="read-container">
          <div className="read-card">
            <h2>글을 찾을 수 없습니다</h2>
            <button onClick={() => router.push('/study')}>목록으로</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      <div className="read-container">
        <div className="read-card">
          <span className="study-tag">{item.category || 'ETC'}</span>
          <h2 className="read-title">{item.title}</h2>
          <p className="study-meta">
            작성일 {(item.created_at || '').slice(0, 10)}
          </p>

          {item.image_url && (
            <div className="study-detail-img">
              <img src={item.image_url} alt={item.title} />
            </div>
          )}

          <MarkdownView content={item.content} />

          {item.code && (
            <pre className="study-code">{item.code}</pre>
          )}

          <div className="read-buttons">
            <button onClick={() => router.push('/study')}>목록</button>
            {user?.role === 'admin' && (
              <>
                <button onClick={() => router.push('/admin')}>관리자 페이지</button>
                <button onClick={() => router.push(`/study/update/${id}`)}>
                  수정
                </button>
                <button onClick={onDelete} style={{ backgroundColor: '#dc3545' }}>
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
