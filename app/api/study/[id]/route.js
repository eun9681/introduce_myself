import { db } from '../../../lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

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

        const title         = form.get('title');
        const category      = form.get('category');
        const content       = form.get('content');
        const code          = form.get('code') ?? null;
        const file          = form.get('image');           // File or null
        const removeImage   = form.get('remove_image') === '1';

        // 기존 row 조회 (이미지 처리용)
        const [exist] = await db.query(
            `SELECT image_url FROM study_logs WHERE id = ?`,
            [id]
        );
        if (exist.length === 0) {
            return Response.json({ error: '없습니다' }, { status: 404 });
        }
        let imageUrl = exist[0].image_url;

        // 새 이미지 업로드
        if (file && typeof file === 'object' && file.size > 0) {
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

            // 기존 이미지 파일 삭제 시도 (실패해도 무시)
            if (imageUrl) {
                const oldPath = path.join(process.cwd(), 'public', imageUrl);
                try { await unlink(oldPath); } catch {}
            }

            imageUrl = `/uploads/${fileName}`;
        } else if (removeImage) {
            // 사진 제거 요청
            if (imageUrl) {
                const oldPath = path.join(process.cwd(), 'public', imageUrl);
                try { await unlink(oldPath); } catch {}
            }
            imageUrl = null;
        }

        const [result] = await db.query(
            `UPDATE study_logs
                SET title     = COALESCE(?, title),
                    category  = COALESCE(?, category),
                    content   = COALESCE(?, content),
                    code      = ?,
                    image_url = ?
              WHERE id = ?`,
            [title ?? null, category ?? null, content ?? null, code, imageUrl, id]
        );

        if (result.affectedRows === 0) {
            return Response.json({ error: '없습니다' }, { status: 404 });
        }

        return Response.json({ id: Number(id), ok: true });
    } catch (err) {
        console.error('PATCH /api/study/[id] error:', err);
        return Response.json({ error: 'DB 수정 실패' }, { status: 500 });
    }
}

// 삭제
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        // 이미지 파일도 같이 삭제
        const [rows] = await db.query(
            `SELECT image_url FROM study_logs WHERE id = ?`,
            [id]
        );
        if (rows.length && rows[0].image_url) {
            const filePath = path.join(process.cwd(), 'public', rows[0].image_url);
            try { await unlink(filePath); } catch {}
        }

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
