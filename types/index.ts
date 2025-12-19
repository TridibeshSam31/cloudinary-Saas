export interface Video {
  id: string;
  title: string;
  createdAt: Date;
  publicId: string; // Added property for Cloudinary publicId
  duration: number | string;
  description: string;
  originalSize: string;
  compressedSize: string;
  updatedAt?: Date;
  
}
