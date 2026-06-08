import { db } from '../../../lib/db';
import { saveStudyImage } from '../../../lib/studyImage';

export const runtime = 'nodejs';

// 상세 조회
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const [rows] = await db.query(
            `SELECT id, title, category, content, code, image_url, created_at
               FROM study_logs WHERE id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return Response.json({ error: '없습니다' }, { status: 404 });
        }
        return Response.json(rows[0]);
    } catch (err) {
        console.error('GET /api/study/[id] error:', err);
        return Response.json({ error: 'DB 조회 실패' }, { status: 500 });
    }
}

// 수정
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const form = await req.formData();

        const title    = form.get('title');
        const category = form.get('category');
        const content  = form.get('content');
        const code     = form.get('code') ?? null;
        const image    = form.get('image');
        const imageUrl = await saveStudyImage(image);

        const [result] = await db.query(
            `UPDATE study_logs
                SET title    = COALESCE(?, title),
                    category = COALESCE(?, category),
                    content  = COALESCE(?, content),
                    code     = ?,
                    image_url = COALESCE(?, image_url)
              WHERE id = ?`,
            [title ?? null, category ?? null, content ?? null, code, imageUrl, id]
        );

        if (result.affectedRows === 0) {
            return Response.json({ error: '없습니다' }, { status: 404 });
        }

        return Response.json({ id: Number(id), ok: true });
    } catch (err) {
        console.error('PATCH /api/study/[id] error:', err);
        if (err.status) {
            return Response.json({ error: err.message }, { status: err.status });
        }
        return Response.json({ error: 'DB 수정 실패' }, { status: 500 });
    }
}

// 삭제
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        const [result] = await db.query(
            `DELETE FROM study_logs WHERE id = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            return Response.json({ error: '없습니다' }, { status: 404 });
        }
        return Response.json({ ok: true });
    } catch (err) {
        console.error('DELETE /api/study/[id] error:', err);
        return Response.json({ error: 'DB 삭제 실패' }, { status: 500 });
    }
}
