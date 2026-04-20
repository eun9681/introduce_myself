'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Read() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [topic, setTopic] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`);
        
        if (!resp.ok) {
          throw new Error("데이터 없음");
        }

        const data = await resp.json();

        if (!data || !data.title) {
          setError(true);
          return;
        }

        setTopic(data);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    fetchData();
  }, [id]);

  async function handleDelete() {
  const confirmDelete = confirm("정말 삭제하시겠습니까?");
  if (!confirmDelete) return;

  try {
    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics/${id}`, {
      method: "DELETE",
    });

    if (!resp.ok) {
      throw new Error("삭제 실패");
    }

    alert("삭제가 완료되었습니다");

    // 삭제 후 목록으로 이동
    router.push('/');
    router.refresh();

  } catch (err) {
    console.error(err);
    alert("삭제 중 오류 발생");
  }
}

  // 로딩
  if (!topic && !error) {
    return <div className="loading">로딩중...</div>;
  }

  // 에러
  if (error) {
    return (
      <div className="read-container">
        <div className="read-card">
          <h2>글을 찾을 수 없습니다</h2>
          <button onClick={() => router.push('/board')}>목록으로</button>
        </div>
      </div>
    );
  }

  return (
    <div className="read-container">
        <div className="read-card">
            <h2 className="read-title">{topic.title}</h2>
            <h2 className="read-title">{topic.title}</h2>

            <p style={{ color: "#888", marginBottom: "10px" }}>
                작성자: {topic.author || "익명"} | 날짜: {topic.date || "날짜 없음"}
            </p>
            <p className="read-body">{topic.body}</p>
            <p className="read-body">{topic.body}</p>

            <div className="read-buttons">
                <button onClick={() => router.push('/board')}>목록</button>
                <button onClick={() => router.push(`/update/${id}`)}>수정</button>
                <button onClick={handleDelete}>삭제</button>
            </div>
        </div>
    </div>
  );
}