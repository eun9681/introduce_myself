'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarkdownView from "../../components/MarkdownView";
import SiteHeader from "../../components/SiteHeader";

export default function Read() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [topic, setTopic] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [topicResp, meResp] = await Promise.all([
          fetch(`/api/topics/${id}`),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);

        if (!topicResp.ok) throw new Error('데이터가 없습니다.');

        const topicData = await topicResp.json();
        const meData = meResp.ok ? await meResp.json() : { user: null };

        if (!topicData || !topicData.title) {
          setError(true);
          return;
        }

        setTopic(topicData);
        setUser(meData.user || null);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    fetchData();
  }, [id]);

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const resp = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) throw new Error(data.error || "삭제 실패");

      alert("삭제가 완료되었습니다.");
      router.push(user?.role === 'admin' ? '/admin' : '/board');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err.message || "삭제 중 오류 발생");
    }
  }

  if (!topic && !error) {
    return <div className="loading">로딩중...</div>;
  }

  if (error) {
    return (
      <>
        <SiteHeader />
        <div className="read-container">
          <div className="read-card">
            <h2>글을 찾을 수 없습니다</h2>
            <button onClick={() => router.push('/board')}>목록으로</button>
          </div>
        </div>
      </>
    );
  }

  const canManage = user && (user.role === 'admin' || user.uid === topic.author_uid);

  return (
    <>
      <SiteHeader />
      <div className="read-container">
        <div className="read-card">
          <h2 className="read-title">{topic.title}</h2>

          <p style={{ color: "#888", marginBottom: "10px" }}>
            작성자: {topic.author || "익명"} | 날짜: {topic.date || "날짜 없음"}
          </p>

          <MarkdownView content={topic.body} />

          <div className="read-buttons">
            <button onClick={() => router.push('/board')}>목록</button>
            {user?.role === 'admin' && (
              <button onClick={() => router.push('/admin')}>관리자 페이지</button>
            )}
            {canManage && (
              <>
                <button onClick={() => router.push(`/update/${id}`)}>수정</button>
                <button onClick={handleDelete}>삭제</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
