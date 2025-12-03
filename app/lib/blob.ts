import { v2 as cloudinary } from 'cloudinary';
// Force update

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
            const uint8 = new Uint8Array(bytes);
            const buffer = Buffer.from(uint8);

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const lowerName = file.name?.toLowerCase() || '';
            const isHeic = file.type?.toLowerCase().includes('heic') || lowerName.endsWith('.heic') || lowerName.endsWith('.heif');

            let saveBuffer: Buffer = buffer;
            let filenameBase = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

            if (isHeic) {
                try {
                    // Convert HEIC/HEIF to JPEG in development using sharp for maximum compatibility
                    saveBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
                    // Ensure filename has .jpg extension
                    filenameBase = filenameBase.replace(/\.[^/.]+$/, '') + '.jpg';
                } catch (convErr) {
                    console.warn('HEIC conversion with sharp failed, saving original file:', convErr);
                    // fallback: keep original buffer and filename
                }
            }

            const filepath = path.join(uploadDir, filenameBase);

            fs.writeFileSync(filepath, saveBuffer);

            const url = `/uploads/${folder}/${filenameBase}`;
            return { url, error: null };
        } catch (error) {
            console.error('Local upload error:', error);
            return { url: null, error: 'Failed to save file locally' };
        }
    }

    // Production Cloudinary Storage
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const buffer = Buffer.from(uint8);

        // If the uploaded file is HEIC, ask Cloudinary to convert it to JPEG
        const lowerName = file.name?.toLowerCase() || '';
        const isHeic = file.type?.toLowerCase().includes('heic') || lowerName.endsWith('.heic') || lowerName.endsWith('.heif');

        const uploadOptions: any = { folder };
        // Prefer image resource type for images
        uploadOptions.resource_type = 'image';
        if (isHeic) {
            // Request Cloudinary to convert HEIC/HEIF to JPG on upload
            uploadOptions.format = 'jpg';
        }

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                uploadOptions,
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
