import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string || "misc"; // 'avatar', 'post', 'car', etc.

        if (!file) {
            return NextResponse.json(
                { error: "No se ha subido ningún archivo" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads", type);
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const publicUrl = `/uploads/${type}/${filename}`;

        return NextResponse.json(
            { url: publicUrl },
            { status: 201 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Error al subir la imagen" },
            { status: 500 }
        );
    }
}
