//image upload using cloudinary
//hmare nodejs ke file handling ke methods yahan pr kaam aayenge 

import { NextRequest,NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";

//pehle cloudinary ko configure krenge yeh sab humne kiya hua hai apne demo project mai backend ke time pr


type CloudinaryUploadResult = {
    public_id: string;
    [key: string]: any;
}

cloudinary.config({
    cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret:process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
})


export async function POST(request:NextRequest){
    //kya user authenaticated hai ya nhi agar hai toh hi aage jayega warna wahi rok denge
    const { userId } = await auth();

    if(!userId){
        return NextResponse.json({error: "User not authorized"}, {status: 401})
    }

    try {
        //file upload hogi ab cloudinary pr 
        // we are using  FormData → File → Buffer → Stream → Cloudinary
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        
        if(!file){
            return NextResponse.json({error:"File not found"},{status:400})
        }
        //file ko buffer mai convert kr denge
        const buffer = await file.arrayBuffer()
        const bytes = Buffer.from(buffer)

        const result = await new Promise<CloudinaryUploadResult>((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream(
                    {folder: "next-cloudinary-uploads"},
                    (error, result) => {
                    if(error) reject(error);
                    else resolve(result as CloudinaryUploadResult);
                }
            );
            uploadStream.end(bytes);
        }
        );
         return NextResponse.json(
            {
                publicId: result.public_id
            },
            {
                status: 200
            }
        )


        //what we did above ???
        /*
        You’re creating a new Promise.
        Inside, you’ll tell it when to resolve (success) or reject (failure).
        CloudinaryUploadResult is just a TypeScript type for the upload response.
        cloudinary.uploader.upload_stream gives you a Writable Stream object.

        It takes two arguments:
        Options ({ folder: "next-cloudinary-uploads" } → tells Cloudinary to put the file in that folder).
        Callback → runs when the upload finishes.
       If Cloudinary says “upload failed” → reject(error).
       If success → resolve(result).
      So at this point you’ve got an open stream called uploadStream waiting for file data.


      .end(buffer) writes your file data into the stream and closes it.
     That’s equivalent to saying:
       "Here’s the full file, I’m done sending data, now upload it."
      Once Cloudinary finishes processing, it calls your callback → which triggers resolve(result) or reject(error) → which fulfills the Promise.
        */



        
    } catch (error) {
        console.log("Upload image failed",error)
        return NextResponse.json({error:"Upload image failed"},{status:500})
    }
}


//well ek question yeh aaya hoga ki hum image upload mai kyu db ko include nhi kr rhe hai waise ??
//answer yeh hai ki image generally kaafi jyada small size ki hoti hai toh isiliye hume db se connection ki koi jarrurat nhi pdti

/*
For images (like profile pics, thumbnails, banners):
Many times, you don’t need to keep a DB record.
You can just store the Cloudinary public_id or URL directly in the user’s record (e.g., User.profilePic).
No need for a separate table unless you’re building something like a gallery system.

For videos:
Videos are heavier and usually content pieces (like a video post, lecture, short, etc.).
They need metadata (title, description, duration, sizes).
They’re not just “assets” attached to a user — they’re “entities” of your app.
That’s why you model them in a separate Video table

Images → often act as attributes of another model.
Example: User has a profilePicUrl. No need for a separate Image table.

Videos → usually standalone entities.
Example: YouTube’s Video table stores each video with metadata.
That’s why you explicitly created a row in Prisma.



*/


