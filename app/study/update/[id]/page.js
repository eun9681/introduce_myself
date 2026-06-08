'use client'

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudyUpdate() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Next.js');
  const [content, setContent] = useState('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  // 기존 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/study/${id}`);
        if (!resp.ok) throw new Error('not found');
        const data = await resp.json();
        setTitle(data.title || '');
        setCategory(data.category || 'ETC');
        setContent(data.content || '');
        setCode(data.code || '');
        setExistingImageUrl(data.image_url || '');
      } catch {
        alert('데이터를 불러올 수 없습니다');
        router.push('/study');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

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
    fd.append('code', code || '');
    if (image) fd.append('image', image);

    try {
      const resp = await fetch(`/api/study/${id}`, {
        method: 'PATCH',
        body: fd,
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || '수정 실패');
      }
      router.push(`/study/${id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">로딩중...</div>;

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
        <h2>공부기록 수정</h2>
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
            placeholder="학습 내용"
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

          {(previewUrl || existingImageUrl) && (
            <div className="file-preview">
              <img
                src={previewUrl || existingImageUrl}
                alt="커버 이미지 미리보기"
              />
            </div>
          )}

          <div className="btn-group">
            <button type="submit" disabled={submitting}>
              {submitting ? '저장중...' : '수정'}
            </button>
            <button type="button" onClick={() => router.push(`/study/${id}`)}>
              취소
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
