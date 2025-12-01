import { v2 as cloudinary } from 'cloudinary';
// Force update

import fs from 'fs';
import path from 'path';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToBlob(file: File, folder: string = 'uploads') {
    // Local Development Storage or if Cloudinary keys are missing
    if (process.env.NODE_ENV === 'development' || !process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const filepath = path.join(uploadDir, filename);

            fs.writeFileSync(filepath, buffer);

            const url = `/uploads/${folder}/${filename}`;
            return { url, error: null };
        } catch (error) {
            console.error('Local upload error:', error);
            return { url: null, error: 'Failed to save file locally' };
        }
    }

    // Production Cloudinary Storage
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: folder, resource_type: 'auto' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return { url: result.secure_url, error: null };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return { url: null, error: 'Failed to upload image' };
    }
}

export async function uploadFileToBlob(file: File, type: string = 'general'): Promise<string> {
    const { url, error } = await uploadToBlob(file, type);
    if (error || !url) {
        throw new Error(error || 'Upload failed');
    }
    return url;
}
