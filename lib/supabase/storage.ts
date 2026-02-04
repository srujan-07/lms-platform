import { createClient } from './server';
import { createAdminClient } from './server';

const BUCKET_NAME = 'lecture-notes';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf'];
const SIGNED_URL_EXPIRY = 900; // 15 minutes in seconds

export interface UploadResult {
    success: boolean;
    filePath?: string;
    error?: string;
}

export interface SignedUrlResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload a PDF file to Supabase Storage
 * @param file - The file to upload
 * @param courseId - The course ID for organizing files
 * @param userId - The user uploading the file
 * @returns Upload result with file path or error
 */
export async function uploadPDF(
    file: File,
    courseId: string,
    userId: string
): Promise<UploadResult> {
    try {
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return {
                success: false,
                error: 'Only PDF files are allowed',
            };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            };
        }

        const supabase = createAdminClient();

        // Generate unique file path
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${courseId}/${timestamp}-${sanitizedFileName}`;

        // Upload file
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);

            // If bucket doesn't exist, try to create it and retry upload
            // The error message from Supabase storage for missing bucket can vary, so we'll check broadly
            if (error.message.includes('Bucket not found') || error.message.includes('The resource was not found')) {
                console.log('Bucket not found, attempting to create...');
                const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                    public: false,
                    fileSizeLimit: MAX_FILE_SIZE,
                    allowedMimeTypes: ALLOWED_MIME_TYPES
                });

                if (createError) {
                    console.error('Failed to create bucket:', createError);
                    return { success: false, error: 'Storage configuration error' };
                }

                // Retry upload
                const { data: retryData, error: retryError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (retryError) {
                    return { success: false, error: retryError.message };
                }

                return { success: true, filePath: retryData.path };
            }

            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            filePath: data.path,
        };
    } catch (error) {
        console.error('Upload exception:', error);
        return {
            success: false,
            error: 'Failed to upload file',
        };
    }
}

/**
 * Generate a signed URL for downloading a PDF
 * @param filePath - The file path in storage
 * @returns Signed URL result
 */
export async function getSignedURL(filePath: string): Promise<SignedUrlResult> {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

        if (error) {
            console.error('Signed URL error:', error);
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            url: data.signedUrl,
        };
    } catch (error) {
        console.error('Signed URL exception:', error);
        return {
            success: false,
            error: 'Failed to generate download URL',
        };
    }
}

/**
 * Delete a PDF file from storage
 * @param filePath - The file path to delete
 * @returns Success status
 */
export async function deletePDF(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createAdminClient();

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: error.message,
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete exception:', error);
        return {
            success: false,
            error: 'Failed to delete file',
        };
    }
}

/**
 * Get public URL for a file (for display purposes only - won't work with private bucket)
 * @param filePath - The file path
 * @returns Public URL
 */
export function getPublicURL(filePath: string): string {
    const supabase = createAdminClient();
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
}
