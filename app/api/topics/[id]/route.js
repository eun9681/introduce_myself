import { db } from '../../../lib/db';

// 게시글 상세 조회
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        const [rows] = await db.query(
            `SELECT id, title, body, author, date
               FROM topics
              WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return Response.json({ error: '글이 없습니다' }, { status: 404 });
        }

        return Response.json(rows[0]);
    } catch (err) {
        console.error('GET /api/topics/[id] error:', err);
        return Response.json({ error: 'DB 조회 실패' }, { status: 500 });
    }
}

// 게시글 수정
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const { title, body, author } = await req.json();

        const [result] = await db.query(
            `UPDATE topics
                SET title  = COALESCE(?, title),
                    body   = COALESCE(?, body),
                    author = COALESCE(?, author)
              WHERE id = ?`,
            [title ?? null, body ?? null, author ?? null, id]
        );

        if (result.affectedRows === 0) {
            return Response.json({ error: '글이 없습니다' }, { status: 404 });
        }

        const [rows] = await db.query(
            `SELECT id, title, body, author, date FROM topics WHERE id = ?`,
            [id]
        );

        return Response.json(rows[0]);
    } catch (err) {
        console.error('PATCH /api/topics/[id] error:', err);
        return Response.json({ error: 'DB 수정 실패' }, { status: 500 });
    }
}

// 게시글 삭제
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        const [result] = await db.query(
            `DELETE FROM topics WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return Response.json({ error: '글이 없습니다' }, { status: 404 });
        }

        return Response.json({ ok: true });
    } catch (err) {
        console.error('DELETE /api/topics/[id] error:', err);
        return Response.json({ error: 'DB 삭제 실패' }, { status: 500 });
    }
}
