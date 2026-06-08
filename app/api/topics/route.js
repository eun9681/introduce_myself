import { db } from '../../lib/db';

// 게시글 목록
export async function GET() {
    try {
        const [rows] = await db.query(
            `SELECT id, title, body, author, date
               FROM topics
              ORDER BY id ASC`
        );
        return Response.json(rows);
    } catch (err) {
        console.error('GET /api/topics error:', err);
        return Response.json({ error: 'DB 조회 실패' }, { status: 500 });
    }
}

// 게시글 작성
export async function POST(req) {
    try {
        const { title, body, author, date } = await req.json();

        if (!title || !body) {
            return Response.json(
                { error: '제목과 내용을 입력하세요' },
                { status: 400 }
            );
        }

        const today = date || new Date().toISOString().slice(0, 10);

        const [result] = await db.query(
            `INSERT INTO topics (title, body, author, date)
             VALUES (?, ?, ?, ?)`,
            [title, body, author || '익명', today]
        );

        return Response.json(
            {
                id: result.insertId,
                title,
                body,
                author: author || '익명',
                date: today,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error('POST /api/topics error:', err);
        return Response.json({ error: 'DB 저장 실패' }, { status: 500 });
    }
}
