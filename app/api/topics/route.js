import { requireUser } from '../../lib/auth';
import { getFirestore, serverTimestamp } from '../../lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const firestore = getFirestore();
        const snapshot = await firestore
            .collection('topics')
            .orderBy('created_at', 'asc')
            .get();

        const rows = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                body: data.body || '',
                author: data.author || '익명',
                author_uid: data.author_uid || '',
                date: data.date || '',
            };
        });

        return Response.json(rows);
    } catch (err) {
        console.error('GET /api/topics error:', err);
        return Response.json({ error: '게시글 조회 실패' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await requireUser();
        const firestore = getFirestore();
        const { title, body, date } = await req.json();

        if (!title || !body) {
            return Response.json(
                { error: '제목과 내용을 입력하세요.' },
                { status: 400 }
            );
        }

        const today = date || new Date().toISOString().slice(0, 10);
        const doc = await firestore.collection('topics').add({
            title,
            body,
            author: user.name,
            author_email: user.email,
            author_uid: user.uid,
            date: today,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });

        return Response.json(
            {
                id: doc.id,
                title,
                body,
                author: user.name,
                author_uid: user.uid,
                date: today,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error('POST /api/topics error:', err);
        return Response.json(
            { error: err.message || '게시글 저장 실패' },
            { status: err.status || 500 }
        );
    }
}
