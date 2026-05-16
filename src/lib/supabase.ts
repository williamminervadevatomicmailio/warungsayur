import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase (for file uploads from browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export const STORAGE_BUCKET = 'warung-sayur'

/**
 * Upload a file to Supabase Storage and return the public URL
 */
export async function uploadFile(
  file: File,
  path: string
): Promise<string | null> {
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([path])
  return !error
}
