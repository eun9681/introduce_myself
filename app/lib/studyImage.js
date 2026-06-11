import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { getStorageBucket } from './firebaseAdmin';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'study');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

function cleanEnv(value) {
    return value?.trim().replace(/^['"]/, '').replace(/['"]$/, '');
}

function hasCloudinaryConfig() {
    return Boolean(
        cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) &&
        cleanEnv(process.env.CLOUDINARY_API_KEY) &&
        cleanEnv(process.env.CLOUDINARY_API_SECRET)
    );
}

function shouldUseFirebaseStorage() {
    return Boolean(process.env.FIREBASE_STORAGE_BUCKET);
}

function cloudinarySignature(params, apiSecret) {
    const payload = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');

    return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

async function saveStudyImageToCloudinary(file, bytes, fileName) {
    const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
    const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
    const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'study';
    const publicId = path.parse(fileName).name;
    const signature = cloudinarySignature({ folder, public_id: publicId, timestamp }, apiSecret);
    const form = new FormData();

    form.append('file', new Blob([bytes], { type: file.type }), fileName);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('public_id', publicId);
    form.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: form,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw Object.assign(
            new Error(data.error?.message || 'Cloudinary 이미지 업로드에 실패했습니다.'),
            { status: 500 }
        );
    }

    return data.secure_url;
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

    if (hasCloudinaryConfig()) {
        return saveStudyImageToCloudinary(file, bytes, fileName);
    }

    if (shouldUseFirebaseStorage()) {
        return saveStudyImageToStorage(file, bytes, ext);
    }

    if (process.env.VERCEL === '1') {
        throw Object.assign(
            new Error('Vercel에서 이미지 업로드를 사용하려면 Cloudinary 환경변수를 설정하세요.'),
            { status: 500 }
        );
    }

    return saveStudyImageToLocal(fileName, bytes);
}
