import { canManageContent, requireUser } from '../../../lib/auth';
import { getFirestore, serverTimestamp } from '../../../lib/firebaseAdmin';

export const runtime = 'nodejs';

function topicResponse(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        title: data.title || '',
        body: data.body || '',
        author: data.author || '익명',
        author_uid: data.author_uid || '',
        date: data.date || '',
    };
}

export async function GET(req, { params }) {
    try {
        const firestore = getFirestore();
        const { id } = await params;
        const doc = await firestore.collection('topics').doc(id).get();

        if (!doc.exists) {
            return Response.json({ error: '글이 없습니다.' }, { status: 404 });
        }

        return Response.json(topicResponse(doc));
    } catch (err) {
        console.error('GET /api/topics/[id] error:', err);
        return Response.json({ error: '게시글 조회 실패' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await requireUser();
        const firestore = getFirestore();
        const { id } = await params;
        const { title, body } = await req.json();
        const ref = firestore.collection('topics').doc(id);
        const doc = await ref.get();

        if (!doc.exists) {
            return Response.json({ error: '글이 없습니다.' }, { status: 404 });
        }

        if (!canManageContent(user, doc.data())) {
            return Response.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        const updates = { updated_at: serverTimestamp() };
        if (title !== undefined) updates.title = title;
        if (body !== undefined) updates.body = body;

        await ref.update(updates);

        const updated = await ref.get();
        return Response.json(topicResponse(updated));
    } catch (err) {
        console.error('PATCH /api/topics/[id] error:', err);
        return Response.json(
            { error: err.message || '게시글 수정 실패' },
            { status: err.status || 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await requireUser();
        const firestore = getFirestore();
        const { id } = await params;
        const ref = firestore.collection('topics').doc(id);
        const doc = await ref.get();

        if (!doc.exists) {
            return Response.json({ error: '글이 없습니다.' }, { status: 404 });
        }

        if (!canManageContent(user, doc.data())) {
            return Response.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }

        await ref.delete();
        return Response.json({ ok: true });
    } catch (err) {
        console.error('DELETE /api/topics/[id] error:', err);
        return Response.json(
            { error: err.message || '게시글 삭제 실패' },
            { status: err.status || 500 }
        );
    }
}
