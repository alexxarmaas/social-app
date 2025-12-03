export function ensureJpegForCloudinary(url: string | null | undefined) {
    if (!url) return url || '';

    try {
        const u = url.trim();
        // Only modify Cloudinary hosted images
        if (!u.includes('res.cloudinary.com')) return u;

        // If URL already contains a format forcing transformation, leave it
        // e.g., /upload/f_auto,q_auto/... or contains f_jpg
        if (u.includes('/upload/') && (u.includes('/f_') || u.includes('f_jpg') || u.includes('f_auto'))) {
            // If it already forces a format, return as-is, but ensure it's not .heic extension
            return u.replace(/\.(heic|heif)$/i, '.jpg');
        }

        // Insert f_jpg transformation right after /upload/
        const uploadIndex = u.indexOf('/upload/');
        if (uploadIndex === -1) return u;

        const before = u.substring(0, uploadIndex + '/upload/'.length);
        const after = u.substring(uploadIndex + '/upload/'.length);

        // If URL already ends with an explicit extension .heic, replace it to .jpg
        const replaced = (before + 'f_jpg/' + after).replace(/\.(heic|heif)$/i, '.jpg');
        return replaced;
    } catch (err) {
        return url;
    }
}
