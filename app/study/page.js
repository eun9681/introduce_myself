'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StudyList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/study', { cache: 'no-store' });
        const data = await resp.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 카테고리별로 다른 이모지 배경
  const categoryEmoji = (cat) => {
    const map = {
      'Next.js': '⚛️',
      'React': '⚛️',
      'JavaScript': '📜',
      'CSS': '🎨',
      'HTML': '📄',
      'MySQL': '🗄️',
      'Node.js': '🟢',
    };
    return map[cat] || '📚';
  };

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

      {/* 안내 문구 */}
      <div className="study-intro">
        <p>일일 공부 기록</p>
        <p>학습 내용을 카드로 정리</p>
      </div>

      {/* 카드 그리드 */}
      <div className="study-wrap">
        {loading ? (
          <div className="loading">로딩중...</div>
        ) : items.length === 0 ? (
          <div className="study-empty">아직 작성한 공부기록이 없습니다.</div>
        ) : (
          <div className="study-grid">
            {items.map((it) => (
              <Link href={`/study/${it.id}`} key={it.id} className="study-card">
                <div className="study-thumb">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.title} className="study-cover-img" />
                  ) : (
                    <span className="study-thumb-placeholder">
                      {categoryEmoji(it.category)}
                    </span>
                  )}
                </div>
                <div className="study-card-body">
                  <span className="study-tag">{it.category || 'ETC'}</span>
                  <h3 className="study-card-title">{it.title}</h3>
                  <p className="study-card-text">{it.content}</p>
                  <div className="study-card-date">
                    {(it.created_at || '').slice(0, 10).replaceAll('-', '. ')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="study-bottom">
          <Link href="/study/create">
            <button className="write-btn">글쓰기</button>
          </Link>
        </div>
      </div>
    </>
  );
}
