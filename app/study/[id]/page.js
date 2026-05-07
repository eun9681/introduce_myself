'use client'

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudyRead() {
  const router = useRouter();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/study/${id}`);
        if (!resp.ok) throw new Error('not found');
        const data = await resp.json();
        setItem(data);
      } catch {
        setError(true);
      }
    })();
  }, [id]);

  const onDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const resp = await fetch(`/api/study/${id}`, { method: 'DELETE' });
    if (resp.ok) {
      router.push('/study');
    } else {
      alert('삭제 실패');
    }
  };

  if (!item && !error) return <div className="loading">로딩중...</div>;
  if (error) {
    return (
      <div className="read-container">
        <div className="read-card">
          <h2>글을 찾을 수 없습니다</h2>
          <button onClick={() => router.push('/study')}>목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <>
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
        </div>
      </header>

      <div className="read-container">
        <div className="read-card">
          <span className="study-tag">{item.category || 'ETC'}</span>
          <h2 className="read-title">{item.title}</h2>
          <p className="study-meta">
            작성일: {(item.created_at || '').slice(0, 10)}
          </p>

          {item.image_url && (
            <div className="study-detail-img">
              <img src={item.image_url} alt={item.title} />
            </div>
          )}

          <p className="read-body" style={{ whiteSpace: 'pre-wrap' }}>
            {item.content}
          </p>

          {item.code && (
            <pre className="study-code">{item.code}</pre>
          )}

          <div className="read-buttons">
            <button onClick={() => router.push('/study')}>목록</button>
            <button onClick={() => router.push(`/study/update/${id}`)}>
              수정
            </button>
            <button onClick={onDelete} style={{ backgroundColor: '#dc3545' }}>
              삭제
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
