import Link from "next/link";

export default async function Home() {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
    cache: "no-store",
  });

  const topics = await resp.json();

  return (
    <>
      {/* 🔵 헤더 */}
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="logo" />
          <h1>김다은</h1>
        </div>

        <div className="menu">
          <Link href="https://introduce-myself-orpin.vercel.app/">홈</Link>
          <Link href="/">게시판</Link>
          <a href="https://share.google/D5ClHaEjnHNU6YscY">채용공고 확인</a>
          <a href="https://share.google/D25ngATn7ulcb0MBA">IBK기업은행 홈페이지</a>
        </div>
      </header>

      {/* 게시판 */}
      <div className="container">
        <h2 className="title">게시판</h2>

        {/* 검색 */}
        <div className="search-box">
          <select>
            <option>제목+내용</option>
            <option>제목</option>
            <option>내용</option>
          </select>
          <input placeholder="검색어 입력" />
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
            {topics.map((topic, index) => (
              <tr key={topic.id}>
                <td>{topics.length - index}</td>
                <td>
                  <Link href={`/read/${topic.id}`}>
                    {topic.title}
                  </Link>
                </td>
                <td>관리자</td>
                <td>2026.03.19</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 버튼 */}
        <div className="bottom">
          <Link href="/create">
            <button className="write-btn">글쓰기</button>
          </Link>
        </div>
      </div>
    </>
  );
}