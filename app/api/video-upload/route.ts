//video ho ya image dono ke liye hume cloudinary ki nee hogi so install it and jo kaam humne apne yt ke backend ke clone ke time kiya tha yahan bhi wahi krenge

//I want to upload video of less than or equal to 60mb size

import { NextRequest,NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

type CloudinaryUploadResult = {
    public_id: string;
    [key: string]: any;
    bytes: number;
    duration?: number;
}

cloudinary.config({
    cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret:process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
})

const prisma = new PrismaClient()//initialising prisma db

export async function POST(request:NextRequest){
    //simialr to image upload the process is same we just have to change the resource type to video
    try {
       //user authenticated or not
     const {userId} =await auth();
     if(!userId){
        return NextResponse.json({error:"User not authorized"},{status:401})
     } 
     if(
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      )
      {
        return NextResponse.json({error: "Cloudinary credentials not found"}, {status: 500})
      }
      
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;

        if(!file||!title||!description||!originalSize){
            return NextResponse.json({error:"fill all the details"},{status:401})
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        //ab wahi krenge jo humne image upload ke time kra tha 
        //acha haan file upload bhi ek asynchronous task hota hai isiliye await use kr rhe hai backend mai ache se discuss kiya tha

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "video-uploads",
                        transformation: [
                            {quality: "auto", fetch_format: "mp4"},
                        ]
                    },
                    (error, result) => {
                        if(error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                )
                uploadStream.end(buffer)
            }
        )
        //ab database mai yeh jo video hai usko save 

        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: originalSize,
                compressedSize: String(result.bytes),
                duration: result.duration || 0,
            }
        })
        return NextResponse.json(video)

        /*
        1.prisma.video.create(...)
        This calls Prisma to insert a new row into your video table.
        2.data: { ... }
        You’re passing the values you want stored in DB.
       title, description → come from your form.
       publicId: result.public_id → Cloudinary gives you a unique identifier for the uploaded file. You’ll use this to fetch/play the video later:
       https://res.cloudinary.com/<cloud_name>/video/upload/<publicId>.mp4

       originalSize: originalSize → you’re storing the size the client sent in FormData. ⚠️ This is risky because the client could lie. Better to use file.size or result.bytes.

        compressedSize: String(result.bytes) → here’s the trap:

       result.bytes is the actual size of the uploaded file in bytes.

       You’re calling it "compressedSize", but it’s not compressed at this point — Cloudinary just gives you the original upload stats.

      duration: result.duration || 0 → Cloudinary returns video duration (in seconds). If missing, you default to 0.


      const video = await prisma.video.create(...)
     Prisma inserts the record in your DB.
     The returned video object contains all columns for that row, including auto-generated fields like id, createdAt, etc.
     return NextResponse.json(video)
     You return the inserted record as JSON response to the client.
     Example response could look like:
     
     {
      "id": "clxxxxxxx",
      "title": "My Video",
     "description": "Demo upload",
     "publicId": "video-uploads/abcd1234",
     "originalSize": "10485760",
    "compressedSize": "10485760",
      "duration": 120,
      "createdAt": "2025-09-14T12:34:56.000Z",
       "updatedAt": "2025-09-14T12:34:56.000Z"
     }

   
     



        */
      
    } catch (error) {
        console.log("Error in uploading video:",error)
        return NextResponse.json({error:"Error in uploading video"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}
    
