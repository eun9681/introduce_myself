import { requireAdmin } from '../../../lib/auth';
import { getFirestore } from '../../../lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
    try {
        await requireAdmin();
        const firestore = getFirestore();
        const snapshot = await firestore.collection('users').orderBy('created_at', 'desc').get();
        const users = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                uid: doc.id,
                name: data.name || '',
                email: data.email || '',
                role: data.role || 'user',
            };
        });

        return Response.json(users);
    } catch (err) {
        return Response.json({ error: err.message }, { status: err.status || 500 });
    }
}
