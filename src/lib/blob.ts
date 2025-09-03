import { put } from "@vercel/blob";

export async function uploadImage(file: File) {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const { url } = await put(`images/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return url;
  } catch (error) {
    console.error("[BLOB_UPLOAD_ERROR]", error);
    throw new Error("Failed to upload image");
  }
}
