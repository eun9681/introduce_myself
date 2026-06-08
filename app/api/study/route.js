import { db } from '../../lib/db';
import { saveStudyImage } from '../../lib/studyImage';

export const runtime = 'nodejs';

// 학습 카드 목록
export async function GET() {
    try {
        const [rows] = await db.query(
            `SELECT id, title, category, content, code, image_url, created_at
               FROM study_logs
              ORDER BY id DESC`
        );
        return Response.json(rows);
    } catch (err) {
        console.error('GET /api/study error:', err);
        return Response.json({ error: 'DB 조회 실패' }, { status: 500 });
    }
}

// 학습 카드 작성
export async function POST(req) {
    try {
        const form = await req.formData();
        const title    = form.get('title');
        const category = form.get('category') || 'ETC';
        const content  = form.get('content');
        const code     = form.get('code') || null;
        const image    = form.get('image');

        if (!title || !content) {
            return Response.json(
                { error: '제목과 내용을 입력하세요' },
                { status: 400 }
            );
        }

        const imageUrl = await saveStudyImage(image);

        const [result] = await db.query(
            `INSERT INTO study_logs (title, category, content, code, image_url)
             VALUES (?, ?, ?, ?, ?)`,
            [title, category, content, code, imageUrl]
        );

        return Response.json(
            { id: result.insertId, ok: true },
            { status: 201 }
        );
    } catch (err) {
        console.error('POST /api/study error:', err);
        if (err.status) {
            return Response.json({ error: err.message }, { status: err.status });
        }
        return Response.json({ error: 'DB 저장 실패' }, { status: 500 });
    }
}
