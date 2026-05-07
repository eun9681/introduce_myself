import mysql from 'mysql2/promise';

// 전역 변수에 보관해서 Next.js dev 모드 HMR 시 커넥션 풀이 중복 생성되지 않도록 함
const globalForDb = globalThis;

export const db =
    globalForDb.__mysqlPool ||
    mysql.createPool({
        host:     process.env.DB_HOST     || 'localhost',
        port:     Number(process.env.DB_PORT) || 3306,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'study_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        dateStrings: true, // DATE/DATETIME 을 문자열로 받기 (JSON 직렬화 편의)
    });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.__mysqlPool = db;
}
