'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StudyCreate() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Next.js');
  const [content, setContent] = useState('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('제목과 내용을 입력하세요');
      return;
    }
    setSubmitting(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('category', category);
    fd.append('content', content);
    if (code) fd.append('code', code);
    if (image) fd.append('image', image);

    try {
      const resp = await fetch('/api/study', { method: 'POST', body: fd });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || '저장 실패');
      }
      router.push('/study');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
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

      <div className="form-container">
        <h2>공부기록 작성</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="study-select"
          >
            <option>Next.js</option>
            <option>React</option>
            <option>JavaScript</option>
            <option>CSS</option>
            <option>HTML</option>
            <option>MySQL</option>
            <option>Node.js</option>
            <option>ETC</option>
          </select>

          <textarea
            placeholder="학습 내용을 자유롭게 작성하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <textarea
            placeholder="(선택) 코드 예시"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ fontFamily: 'monospace', height: 120 }}
          />

          <label className="file-label">
            커버 이미지
            <input type="file" accept="image/*" onChange={onImageChange} />
          </label>

          {previewUrl && (
            <div className="file-preview">
              <img src={previewUrl} alt="커버 이미지 미리보기" />
            </div>
          )}

          <div className="btn-group">
            <button type="submit" disabled={submitting}>
              {submitting ? '저장중...' : '등록'}
            </button>
            <button type="button" onClick={() => router.push('/study')}>
              취소
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
