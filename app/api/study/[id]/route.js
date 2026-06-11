import { getFirestore, serverTimestamp } from '../../../lib/firebaseAdmin';
import { saveStudyImage } from '../../../lib/studyImage';

export const runtime = 'nodejs';

function toDateString(value) {
    if (!value) return '';
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    return String(value);
}

function studyResponse(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title || '',
        category: data.category || 'ETC',
        content: data.content || '',
        code: data.code || '',
        image_url: data.image_url || '',
        created_at: toDateString(data.created_at),
    };
}

export async function GET(req, { params }) {
    try {
        const firestore = getFirestore();
        const { id } = await params;
        const doc = await firestore.collection('study_logs').doc(id).get();

        if (!doc.exists) {
            return Response.json({ error: '공부 기록이 없습니다.' }, { status: 404 });
        }

        return Response.json(studyResponse(doc));
    } catch (err) {
        console.error('GET /api/study/[id] error:', err);
        return Response.json({ error: '공부 기록 조회 실패' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const firestore = getFirestore();
        const { id } = await params;
        const form = await req.formData();
        const ref = firestore.collection('study_logs').doc(id);
        const doc = await ref.get();

        if (!doc.exists) {
            return Response.json({ error: '공부 기록이 없습니다.' }, { status: 404 });
        }

        const image = form.get('image');
        const imageUrl = await saveStudyImage(image);
        const updates = { updated_at: serverTimestamp() };

        if (form.has('title')) updates.title = form.get('title');
        if (form.has('category')) updates.category = form.get('category') || 'ETC';
        if (form.has('content')) updates.content = form.get('content');
        if (form.has('code')) updates.code = form.get('code') || '';
        if (imageUrl) updates.image_url = imageUrl;

        await ref.update(updates);

        return Response.json({ id, ok: true });
    } catch (err) {
        console.error('PATCH /api/study/[id] error:', err);
        if (err.status) {
            return Response.json({ error: err.message }, { status: err.status });
        }
        return Response.json({ error: '공부 기록 수정 실패' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const firestore = getFirestore();
        const { id } = await params;
        const ref = firestore.collection('study_logs').doc(id);
        const doc = await ref.get();

        if (!doc.exists) {
            return Response.json({ error: '공부 기록이 없습니다.' }, { status: 404 });
        }

        await ref.delete();
        return Response.json({ ok: true });
    } catch (err) {
        console.error('DELETE /api/study/[id] error:', err);
        return Response.json({ error: '공부 기록 삭제 실패' }, { status: 500 });
    }
}
