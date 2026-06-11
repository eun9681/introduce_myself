import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getStorageBucket } from './firebaseAdmin';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'study');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

function shouldUseFirebaseStorage() {
    return process.env.VERCEL === '1' || Boolean(process.env.FIREBASE_STORAGE_BUCKET);
}

async function saveStudyImageToStorage(file, bytes, ext) {
    const bucket = getStorageBucket();
    const token = randomUUID();
    const filePath = `uploads/study/${Date.now()}-${randomUUID()}${ext}`;
    const storageFile = bucket.file(filePath);

    await storageFile.save(bytes, {
        metadata: {
            contentType: file.type,
            metadata: {
                firebaseStorageDownloadTokens: token,
            },
        },
    });

    const encodedPath = encodeURIComponent(filePath);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
}

async function saveStudyImageToLocal(fileName, bytes) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, fileName), bytes);
    return `/uploads/study/${fileName}`;
}

export async function saveStudyImage(file) {
    if (!file || typeof file === 'string' || file.size === 0) {
        return null;
    }

    if (!IMAGE_EXTENSIONS[file.type]) {
        throw Object.assign(new Error('이미지 파일만 업로드할 수 있습니다.'), { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
        throw Object.assign(new Error('이미지는 5MB 이하로 업로드해주세요.'), { status: 400 });
    }

    const ext = IMAGE_EXTENSIONS[file.type];
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (shouldUseFirebaseStorage()) {
        return saveStudyImageToStorage(file, bytes, ext);
    }

    return saveStudyImageToLocal(fileName, bytes);
}
