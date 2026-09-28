import {
  AI_PHOTO_JPEG_QUALITY,
  AI_PHOTO_MAX_DIMENSION,
  AI_PHOTO_MAX_OUTPUT_BYTES,
} from '@/constants/ai'

/**
 * Compresses and downscales an image file to a JPEG data URL payload for AI.
 */
export async function compressImageForAi(
  file: File,
): Promise<{ base64: string; mimeType: 'image/jpeg' }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    AI_PHOTO_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  )
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error('unavailable')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let quality = AI_PHOTO_JPEG_QUALITY
  let dataUrl = canvas.toDataURL('image/jpeg', quality)

  while (estimateDataUrlBytes(dataUrl) > AI_PHOTO_MAX_OUTPUT_BYTES && quality > 0.4) {
    quality -= 0.08
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }

  if (estimateDataUrlBytes(dataUrl) > AI_PHOTO_MAX_OUTPUT_BYTES) {
    throw new Error('imageTooLarge')
  }

  const base64 = dataUrl.split(',')[1]

  if (!base64) {
    throw new Error('unavailable')
  }

  return { base64, mimeType: 'image/jpeg' }
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}
