'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Create() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    // 오늘 날짜 생성
    const today = new Date().toISOString().slice(0, 10);

    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        author: "익명",   // 추가
        date: today       // 추가
      })
    });

    if (!resp.ok) {
      alert("작성 실패");
      return;
    }

    router.push(`/board`);
  }

  return (
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

        <textarea
          placeholder="내용을 입력하세요"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />

        <div className="btn-group">
          <button type="submit">등록</button>
          <button type="button" onClick={() => router.push('/board')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}