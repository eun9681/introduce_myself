'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthGate from '../components/AuthGate';
import SiteHeader from '../components/SiteHeader';

export default function AdminPage() {
  const [topics, setTopics] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/topics', { cache: 'no-store' }).then((resp) => resp.json()),
      fetch('/api/study', { cache: 'no-store' }).then((resp) => resp.json()),
      fetch('/api/admin/users', { cache: 'no-store' }).then((resp) => resp.json()),
    ]).then(([topicData, studyData, userData]) => {
      setTopics(Array.isArray(topicData) ? topicData : []);
      setStudyLogs(Array.isArray(studyData) ? studyData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    });
  }, []);

  return (
    <>
      <SiteHeader />
      <AuthGate adminOnly>
        <div className="admin-wrap">
          <h2>관리자 대시보드</h2>

          <div className="admin-stats">
            <div><strong>{topics.length}</strong><span>게시글</span></div>
            <div><strong>{studyLogs.length}</strong><span>공부 기록</span></div>
            <div><strong>{users.length}</strong><span>사용자</span></div>
          </div>

          <section className="admin-section">
            <h3>게시판 관리</h3>
            <table className="board">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr key={topic.id}>
                    <td>{topic.title}</td>
                    <td>{topic.author || '익명'}</td>
                    <td><Link href={`/read/${topic.id}`}>보기</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-section">
            <h3>공부 기록 관리</h3>
            <table className="board">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {studyLogs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td><Link href={`/study/${item.id}`}>보기</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </AuthGate>
    </>
  );
}
