import { put } from '@vercel/blob';

export async function uploadToBlob(file: File, folder: string = 'uploads') {
    try {
        const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        return { url: blob.url, error: null };
    } catch (error) {
        console.error('Blob upload error:', error);
        return { url: null, error: 'Failed to upload image' };
    }
}

export async function uploadFileToBlob(file: File, type: string = 'general'): Promise<string> {
    const blob = await put(`${type}/${Date.now()}-${file.name}`, file, {
        access: 'public',
    });

    return blob.url;
}
