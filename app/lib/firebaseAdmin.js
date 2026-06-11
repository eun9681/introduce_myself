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

function getOptionalFirebaseEnv(name) {
    const value = process.env[name];
    return value ? cleanEnvValue(value) : undefined;
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
            storageBucket: getOptionalFirebaseEnv('FIREBASE_STORAGE_BUCKET'),
        });
    }

    return admin.firestore();
}

export function getStorageBucket() {
    getFirestore();

    const bucketName = getOptionalFirebaseEnv('FIREBASE_STORAGE_BUCKET');
    if (!bucketName) {
        throw Object.assign(
            new Error('FIREBASE_STORAGE_BUCKET 환경변수를 설정하세요.'),
            { status: 500 }
        );
    }

    return admin.storage().bucket(bucketName);
}

export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
