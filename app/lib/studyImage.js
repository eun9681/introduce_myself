import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'study');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

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

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = IMAGE_EXTENSIONS[file.type];
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(UPLOAD_DIR, fileName), bytes);

    return `/uploads/study/${fileName}`;
}
