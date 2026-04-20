'use client'

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Board() {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('title');

  useEffect(() => {
    async function fetchData() {
      try {
        const resp = await fetch("http://localhost:9999/topics");
        const data = await resp.json();
        setTopics(data);
      } catch (err) {
        console.error("에러 발생:", err);
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
      {/* 헤더 */}
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="logo" />
          <h1>김다은</h1>
        </div>

        <div className="menu">
          <a href="/main/main.html">홈</a>
          <Link href="/board">게시판</Link>
          <a href="https://share.google/D5ClHaEjnHNU6YscY">채용공고 확인</a>
          <a href="https://share.google/D25ngATn7ulcb0MBA">IBK기업은행 홈페이지</a>
        </div>
      </header>

      <div className="container">
        <h2 className="title">게시판</h2>

        {/* 검색 */}
        <div className="search-box">
          <select onChange={(e) => setType(e.target.value)}>
            <option value="title">제목</option>
            <option value="body">내용</option>
          </select>

          <input
            placeholder="검색어 입력"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button>검색</button>
        </div>

        {/* 테이블 */}
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
                  <td>{filteredTopics.length - index}</td>

                  <td>
                    <Link href={`/read/${topic.id}`}>
                      {topic.title}
                    </Link>
                  </td>

                  <td>{topic.author || "익명"}</td>
                  <td>
                    {topic.date || new Date().toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="bottom">
          <Link href="/create">
            <button className="write-btn">글쓰기</button>
          </Link>
        </div>
      </div>
    </>
  );
}