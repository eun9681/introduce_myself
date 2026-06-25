import { cookies } from 'next/headers';
import { getAuth, getFirestore, serverTimestamp } from './firebaseAdmin';

const AUTH_COOKIE = 'auth_token';

function getFirebaseApiKey() {
    const key = process.env.FIREBASE_WEB_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!key) {
        throw Object.assign(
            new Error('FIREBASE_WEB_API_KEY 환경변수를 설정하세요.'),
            { status: 500 }
        );
    }
    return key;
}

function getAdminEmails() {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

function isAdminEmail(email) {
    return getAdminEmails().includes(String(email || '').toLowerCase());
}

async function firebaseAuthRequest(action, payload) {
    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${getFirebaseApiKey()}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = data.error?.message || 'Firebase 인증 요청에 실패했습니다.';
        throw Object.assign(new Error(message), { status: 400 });
    }

    return data;
}

function authError(message = '로그인이 필요합니다.', status = 401) {
    return Object.assign(new Error(message), { status });
}

function normalizeRole(role) {
    return role === 'admin' ? 'admin' : 'user';
}

function roleForEmail(email, storedRole = 'user') {
    if (isAdminEmail(email)) return 'admin';
    return normalizeRole(storedRole);
}

export async function signUpWithEmail({ name, email, password }) {
    const authData = await firebaseAuthRequest('signUp', {
        email,
        password,
        returnSecureToken: true,
    });

    const firestore = getFirestore();
    const role = roleForEmail(email);

    await firestore.collection('users').doc(authData.localId).set({
        uid: authData.localId,
        name,
        email,
        role,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });

    return { ...authData, user: { uid: authData.localId, name, email, role } };
}

export async function signInWithEmail({ email, password }) {
    const authData = await firebaseAuthRequest('signInWithPassword', {
        email,
        password,
        returnSecureToken: true,
    });
    const user = await getUserProfile(authData.localId, authData.email);
    return { ...authData, user };
}

export async function getUserProfile(uid, fallbackEmail = '') {
    const firestore = getFirestore();
    const ref = firestore.collection('users').doc(uid);
    const doc = await ref.get();

    if (!doc.exists) {
        const authUser = await getAuth().getUser(uid).catch(() => null);
        const email = fallbackEmail || authUser?.email || '';
        const name = authUser?.displayName || email.split('@')[0] || '사용자';
        const role = roleForEmail(email);
        const user = { uid, name, email, role };

        await ref.set({
            ...user,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        });

        return user;
    }

    const data = doc.data();
    const email = data.email || fallbackEmail;
    const role = roleForEmail(email, data.role);

    if (role !== data.role) {
        await ref.update({
            role,
            updated_at: serverTimestamp(),
        });
    }

    return {
        uid,
        name: data.name || email || '사용자',
        email,
        role,
    };
}

export async function setAuthCookie(idToken) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, idToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60,
    });
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;

    try {
        const decoded = await getAuth().verifyIdToken(token);
        return getUserProfile(decoded.uid, decoded.email);
    } catch {
        return null;
    }
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) throw authError();
    return user;
}

export async function requireAdmin() {
    const user = await requireUser();
    if (user.role !== 'admin') {
        throw authError('관리자 권한이 필요합니다.', 403);
    }
    return user;
}

export function canManageContent(user, data) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Boolean(data?.author_uid && data.author_uid === user.uid);
}
