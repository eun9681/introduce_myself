'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";

export default function Board() {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('title');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [topicResp, meResp] = await Promise.all([
          fetch('/api/topics', { cache: 'no-store' }),
          fetch('/api/auth/me', { cache: 'no-store' }),
        ]);

        if (!topicResp.ok) throw new Error('데이터 불러오기 실패');

        const topicData = await topicResp.json();
        const meData = meResp.ok ? await meResp.json() : { user: null };

        setTopics(Array.isArray(topicData) ? topicData : []);
        setUser(meData.user || null);
      } catch (err) {
        console.error('에러 발생:', err);
      }
    }

    fetchData();
  }, []);

  const filteredTopics = topics.filter((topic) => {
    if (!search) return true;
    return topic[type]?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <SiteHeader />

      <div className="container">
        <h2 className="title">게시판</h2>

        <div className="search-box">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="title">제목</option>
            <option value="body">내용</option>
          </select>

          <input
            placeholder="검색어 입력"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="button">검색</button>
        </div>

        <table className="board">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
            </tr>
          </thead>

          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan="4">게시글이 없습니다</td>
              </tr>
            ) : (
              filteredTopics.map((topic, index) => (
                <tr key={topic.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link href={`/read/${topic.id}`}>
                      {topic.title}
                    </Link>
                  </td>
                  <td>{topic.author || "익명"}</td>
                  <td>{topic.date || new Date().toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="bottom">
          {user ? (
            <Link href="/create">
              <button className="write-btn">글쓰기</button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="write-btn">로그인 후 글쓰기</button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
