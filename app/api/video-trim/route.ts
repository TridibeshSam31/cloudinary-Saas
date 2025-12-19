import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "User not authorized" }, { status: 401 });
        }

        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json({ error: "Cloudinary credentials not found" }, { status: 500 });
        }

        const body = await request.json();
        const { publicId, startTime, endTime, title, description } = body;

        if (!publicId || startTime === undefined || endTime === undefined || !title) {
            return NextResponse.json(
                { error: "Missing required fields: publicId, startTime, endTime, title" },
                { status: 400 }
            );
        }

        if (startTime >= endTime) {
            return NextResponse.json(
                { error: "Start time must be less than end time" },
                { status: 400 }
            );
        }

        // Calculate duration
        const duration = endTime - startTime;

        // Get original video info
        const originalVideo = await prisma.video.findFirst({
            where: { publicId }
        });

        if (!originalVideo) {
            return NextResponse.json({ error: "Original video not found" }, { status: 404 });
        }

        // Create trimmed video URL with Cloudinary transformations
        // Using so_ (start offset) and eo_ (end offset) for video trimming
        // Cloudinary uses so_ and eo_ as transformation parameters
        const trimmedVideoUrl = cloudinary.url(publicId, {
            resource_type: "video",
            format: "mp4",
            transformation: [
                {
                    start_offset: startTime,
                    end_offset: endTime,
                    quality: "auto"
                }
            ]
        });

        // Generate a unique public ID for the trimmed video
        const trimmedPublicId = `video-uploads/trimmed/${publicId.split('/').pop()}_${Date.now()}`;

        // Fetch the trimmed video and upload it as a new resource
        // We need to download the trimmed video and re-upload it
        const response = await fetch(trimmedVideoUrl);
        if (!response.ok) {
            throw new Error("Failed to generate trimmed video");
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload the trimmed video to Cloudinary
        const trimmedResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "video",
                    public_id: trimmedPublicId,
                    folder: "video-uploads/trimmed",
                    format: "mp4",
                    overwrite: false,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // Create a new video record for the trimmed version
        const trimmedVideo = await prisma.video.create({
            data: {
                title: title || `${originalVideo.title} (Trimmed)`,
                description: description || originalVideo.description || "",
                publicId: trimmedResult.public_id,
                originalSize: originalVideo.originalSize,
                compressedSize: String(trimmedResult.bytes || originalVideo.compressedSize),
                duration: String(duration),
            }
        });

        return NextResponse.json(trimmedVideo);

    } catch (error) {
        console.error("Error trimming video:", error);
        return NextResponse.json(
            { error: "Error trimming video" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

