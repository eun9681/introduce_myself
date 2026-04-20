'use client'

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Update() {
  console.log("API:", process.env.NEXT_PUBLIC_API_URL);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // 기존 데이터 불러오기
  useEffect(() => {
    async function fetchData() {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`);
      const data = await resp.json();
      setTitle(data.title);
      setBody(data.body);
    }
    fetchData();
  }, [id]);

  // 수정 요청
  async function handleSubmit(e) {
    e.preventDefault();

    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, body })
    });

    if (!resp.ok) {
      alert("수정 실패");
      return;
    }

    const data = await resp.json();
    router.push(`/read/${data.id}`);
  }

  return (
    <div className="form-container">
      <h2>글 수정</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="btn-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => router.push('/board')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}