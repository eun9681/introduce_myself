import admin from 'firebase-admin';

function requiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} 환경변수를 .env.local에 설정하세요.`);
    }
    return value;
}

function cleanEnvValue(value) {
    const cleaned = value
        .trim()
        .replace(/,$/, '')
        .replace(/^['"]/, '')
        .replace(/['"]$/, '');

    const jsonField = cleaned.match(/^"?[A-Z_a-z]+"?\s*:\s*"([\s\S]*)"$/);
    return jsonField ? jsonField[1] : cleaned;
}

function getFirebaseEnv(name) {
    return cleanEnvValue(requiredEnv(name));
}

function getPrivateKey() {
    return getFirebaseEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
}

export function getFirestore() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: getFirebaseEnv('FIREBASE_PROJECT_ID'),
                clientEmail: getFirebaseEnv('FIREBASE_CLIENT_EMAIL'),
                privateKey: getPrivateKey(),
            }),
        });
    }

    return admin.firestore();
}

export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
