'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthGate from "../components/AuthGate";
import MarkdownView from "../components/MarkdownView";
import SiteHeader from "../components/SiteHeader";

export default function Create() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const today = new Date().toISOString().slice(0, 10);

    const resp = await fetch('/api/topics', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        date: today
      })
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      alert(data.error || "작성 실패");
      return;
    }

    router.push('/board');
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <AuthGate>
        <div className="form-container">
          <h2>글쓰기</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <p className="markdown-help">Markdown 사용 가능: # 제목, **굵게**, *기울임*, ~~취소선~~, [링크](https://...), - 목록, 1. 목록, &gt; 인용, 표, ---</p>
            <textarea
              placeholder="내용을 입력하세요"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />

            <div className="markdown-preview">
              <h3>미리보기</h3>
              <MarkdownView content={body} />
            </div>

            <div className="btn-group">
              <button type="submit">등록</button>
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
