export interface Video {
  id: string;
  title: string;
  url: string;
  createdAt: Date;
  size: number;
  publicId: string; // Added property for Cloudinary publicId
  duration:number;
  description:string;
  originalSize:string;
  compressedSize:string;
  // Add other fields as required
}
