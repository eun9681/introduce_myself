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
  const [existingImage, setExistingImage] = useState(null); // 기존 DB의 image_url
  const [removeImage, setRemoveImage] = useState(false);    // 이미지 제거 체크
  const [file, setFile] = useState(null);                   // 새 업로드 파일
  const [preview, setPreview] = useState(null);             // 새 파일 프리뷰
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setExistingImage(data.image_url || null);
      } catch {
        alert('데이터를 불러올 수 없습니다');
        router.push('/study');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하만 업로드 가능');
      e.target.value = '';
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveImage(false); // 새 파일 올리면 제거 체크 해제
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
    fd.append('code', code || '');
    if (file) fd.append('image', file);
    if (removeImage && !file) fd.append('remove_image', '1');

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

          {/* 기존 이미지 */}
          {existingImage && !file && !removeImage && (
            <div className="file-preview">
              <p style={{ marginBottom: 8, color: '#5282b8', fontSize: 13 }}>
                현재 이미지
              </p>
              <img src={existingImage} alt="current" />
              <label style={{ display: 'block', marginTop: 10 }}>
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                이미지 삭제
              </label>
            </div>
          )}

          {/* 새 이미지 프리뷰 */}
          {preview && (
            <div className="file-preview">
              <p style={{ marginBottom: 8, color: '#004b9e', fontSize: 13 }}>
                새 이미지 (저장 시 기존 이미지 교체)
              </p>
              <img src={preview} alt="preview" />
            </div>
          )}

          <label className="file-label">
            📎 {existingImage ? '이미지 교체' : '이미지 첨부'} (jpg, png, gif, webp · 최대 5MB)
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={onFileChange}
            />
          </label>

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
