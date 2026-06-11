import { getFirestore, serverTimestamp } from '../../lib/firebaseAdmin';
import { saveStudyImage } from '../../lib/studyImage';

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

export async function GET() {
    try {
        const firestore = getFirestore();
        const snapshot = await firestore
            .collection('study_logs')
            .orderBy('created_at', 'desc')
            .get();

        return Response.json(snapshot.docs.map(studyResponse));
    } catch (err) {
        console.error('GET /api/study error:', err);
        return Response.json({ error: '공부 기록 조회 실패' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const firestore = getFirestore();
        const form = await req.formData();
        const title = form.get('title');
        const category = form.get('category') || 'ETC';
        const content = form.get('content');
        const code = form.get('code') || '';
        const image = form.get('image');

        if (!title || !content) {
            return Response.json(
                { error: '제목과 내용을 입력하세요.' },
                { status: 400 }
            );
        }

        const imageUrl = await saveStudyImage(image);
        const doc = await firestore.collection('study_logs').add({
            title,
            category,
            content,
            code,
            image_url: imageUrl || '',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });

        return Response.json({ id: doc.id, ok: true }, { status: 201 });
    } catch (err) {
        console.error('POST /api/study error:', err);
        if (err.status) {
            return Response.json({ error: err.message }, { status: err.status });
        }
        return Response.json({ error: '공부 기록 저장 실패' }, { status: 500 });
    }
}
