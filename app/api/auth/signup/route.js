import { setAuthCookie, signUpWithEmail } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
    try {
        const { name, email, password, confirmPassword } = await req.json();

        if (!name || !email || !password) {
            return Response.json({ error: '이름, 이메일, 비밀번호를 입력하세요.' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return Response.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 400 });
        }

        if (password.length < 6) {
            return Response.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
        }

        const result = await signUpWithEmail({ name, email, password });
        await setAuthCookie(result.idToken);

        return Response.json({ user: result.user }, { status: 201 });
    } catch (err) {
        console.error('POST /api/auth/signup error:', err);
        return Response.json(
            { error: err.message || '회원가입에 실패했습니다.' },
            { status: err.status || 500 }
        );
    }
}
