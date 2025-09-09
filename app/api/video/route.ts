import { NextRequest,NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()//initialising prisma db

export async function GET(request:NextRequest){
    try {
        const videos = await prisma.video.findMany({
            orderBy:{createdAt:"desc"}
        })
        //prisma.video.findMany() → fetches multiple rows from the video table.
        //orderBy: { createdAt: "desc" } → sorts results so the newest videos appear first.
        //So this line fetches all videos from your database, sorted by newest first.
        return NextResponse.json(videos)
    } catch (error) {
        return NextResponse.json({
            error:"Error Fetching Videos"
        },{status:500})
    } finally{
        await prisma.$disconnect()
    }

    //Ensures Prisma disconnects from the DB after every request.
    //This avoids keeping too many DB connections open.
}




/*
jo upar ek line likhi hai yeh wali 
const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" }
})
This line fetches rows from your Video table.
Because of orderBy: { createdAt: "desc" }, the newest video (createdAt most recent) comes first.

Each returned video object will look like this:
{
  "id": "ckzb1h8gq0001a1mz07q7y2ms",
  "title": "My First Upload",
  "description": "Test video",
  "publicId": "cloudinary_12345",
  "originalSize": "25MB",
  "compressedSize": "5MB",
  "duration": "00:01:23",
  "createdAt": "2025-09-09T10:15:30.000Z",
  "updatedAt": "2025-09-09T10:15:30.000Z"
}







*/