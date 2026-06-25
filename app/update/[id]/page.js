'use client'

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import MarkdownView from "../../components/MarkdownView";
import SiteHeader from "../../components/SiteHeader";

export default function Update() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    async function fetchData() {
      const resp = await fetch(`/api/topics/${id}`);
      const data = await resp.json();
      setTitle(data.title || '');
      setBody(data.body || '');
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    const resp = await fetch(`/api/topics/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, body })
    });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      alert(data.error || "수정 실패");
      return;
    }

    router.push(`/read/${data.id}`);
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <AuthGate>
        <div className="form-container">
          <h2>글 수정</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <p className="markdown-help">Markdown 사용 가능: # 제목, **굵게**, *기울임*, ~~취소선~~, [링크](https://...), - 목록, 1. 목록, &gt; 인용, 표, ---</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <div className="markdown-preview">
              <h3>미리보기</h3>
              <MarkdownView content={body} />
            </div>

            <div className="btn-group">
              <button type="submit">수정</button>
              <button type="button" onClick={() => router.push('/board')}>
                취소
              </button>
            </div>
          </form>
        </div>
      </AuthGate>
    </>
  );
}
