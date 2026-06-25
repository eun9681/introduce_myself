'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";

export default function StudyList() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [studyResp, meResp] = await Promise.all([
          fetch('/api/study', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);
        const studyData = await studyResp.json();
        const meData = meResp.ok ? await meResp.json() : { user: null };
        setItems(Array.isArray(studyData) ? studyData : []);
        setUser(meData.user || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryEmoji = (cat) => {
    const map = {
      'Next.js': 'N',
      'React': 'R',
      'JavaScript': 'JS',
      'CSS': 'CSS',
      'HTML': 'HTML',
      'MySQL': 'SQL',
      'Node.js': 'Node',
    };
    return map[cat] || 'ETC';
  };

  return (
    <>
      <SiteHeader />

      <div className="study-intro">
        <p>오늘도 열심히 공부했군요..!</p>
        <p>학습 내용을 카드로 정리해보세요</p>
      </div>

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

        {user?.role === 'admin' && (
          <div className="study-bottom">
            <Link href="/study/create">
              <button className="write-btn">글쓰기</button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
