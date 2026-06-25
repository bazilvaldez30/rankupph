import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env, features } from "./env";

if (features.cloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  mimeType?: string;
}

/** Upload an image buffer to Cloudinary. Returns null if not configured. */
export async function uploadImage(
  buffer: Buffer,
  folder = "rankupph/chat",
): Promise<UploadResult | null> {
  if (!features.cloudinary) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          mimeType: result.format ? `image/${result.format}` : undefined,
        });
      },
    );
    stream.end(buffer);
  });
}

export const cloudinaryEnabled = features.cloudinary;
