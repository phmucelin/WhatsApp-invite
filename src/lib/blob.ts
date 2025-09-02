import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadImage(file: File) {
  try {
    const blob = await put(`events/${nanoid()}.${file.name.split(".").pop()}`, file, {
      access: "public",
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
} 