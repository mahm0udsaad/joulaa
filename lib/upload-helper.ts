import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'website')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, bucket = "website"): Promise<string> {
  try {
    // Always use the "website" bucket that's already set up
    // This avoids RLS policy violations when trying to create new buckets
    bucket = "website"

    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload the file
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Use true to overwrite if file exists
    })

    if (uploadError) {
      // Check if the error is related to RLS
      if (uploadError.message.includes("row-level security")) {
        throw new Error(
          `Row Level Security is preventing uploads to the "${bucket}" bucket. Please update RLS policies.`,
        )
      }

      throw new Error(`Error uploading file: ${uploadError.message}`)
    }

    // Get the public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}
