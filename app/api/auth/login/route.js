import { setAuthCookie, signInWithEmail } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: '이메일과 비밀번호를 입력하세요.' }, { status: 400 });
        }

        const result = await signInWithEmail({ email, password });
        await setAuthCookie(result.idToken);

        return Response.json({ user: result.user });
    } catch (err) {
        console.error('POST /api/auth/login error:', err);
        return Response.json(
            { error: '이메일 또는 비밀번호를 확인하세요.' },
            { status: err.status || 500 }
        );
    }
}
