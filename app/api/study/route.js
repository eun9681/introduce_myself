import { db } from '../../lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

// 학습 카드 작성 (이미지 업로드 포함)
export async function POST(req) {
    try {
        const form = await req.formData();
        const title    = form.get('title');
        const category = form.get('category') || 'ETC';
        const content  = form.get('content');
        const code     = form.get('code') || null;
        const file     = form.get('image');

        if (!title || !content) {
            return Response.json(
                { error: '제목과 내용을 입력하세요' },
                { status: 400 }
            );
        }

        // 이미지 저장
        let imageUrl = null;
        if (file && typeof file === 'object' && file.size > 0) {
            // 5MB 제한
            if (file.size > 5 * 1024 * 1024) {
                return Response.json(
                    { error: '이미지 용량은 5MB 이하만 가능' },
                    { status: 400 }
                );
            }
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = path.extname(file.name) || '.png';
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, fileName), buffer);
            imageUrl = `/uploads/${fileName}`;
        }

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
        return Response.json({ error: 'DB 저장 실패' }, { status: 500 });
    }
}
