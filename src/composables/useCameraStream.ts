import { onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'
import {
  AI_CAMERA_CAPTURE_MIME,
  AI_CAMERA_CAPTURE_QUALITY,
  AI_CAMERA_DEFAULT_FACING,
  AI_CAMERA_IDEAL_WIDTH,
} from '@/constants/ai'

/**
 * Live camera state: `ready` shows the viewfinder; `denied` and `unavailable` fall back to the file picker.
 */
export type CameraStatus = 'idle' | 'starting' | 'ready' | 'denied' | 'unavailable'

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean }
type TorchConstraint = MediaTrackConstraintSet & { torch?: boolean }

/**
 * Opens the device camera inside the page (getUserMedia), with camera switch,
 * optional torch and single-frame capture to a JPEG file.
 */
export function useCameraStream(video: Ref<HTMLVideoElement | null>) {
  const status = ref<CameraStatus>('idle')
  const facing = ref<'environment' | 'user'>(AI_CAMERA_DEFAULT_FACING)
  const torchSupported = ref(false)
  const torchOn = ref(false)
  const stream = shallowRef<MediaStream | null>(null)

  async function start(): Promise<void> {
    stop()

    if (!navigator.mediaDevices?.getUserMedia) {
      status.value = 'unavailable'
      return
    }

    status.value = 'starting'

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing.value }, width: { ideal: AI_CAMERA_IDEAL_WIDTH } },
      })
      stream.value = media

      if (video.value) {
        video.value.srcObject = media
        await video.value.play().catch(() => undefined)
      }

      const track = media.getVideoTracks()[0]
      const capabilities = (track?.getCapabilities?.() ?? {}) as TorchCapabilities
      torchSupported.value = Boolean(capabilities.torch)
      torchOn.value = false
      status.value = 'ready'
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      status.value = name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable'
    }
  }

  function stop(): void {
    stream.value?.getTracks().forEach((track) => track.stop())
    stream.value = null

    if (video.value) {
      video.value.srcObject = null
    }
  }

  async function switchFacing(): Promise<void> {
    facing.value = facing.value === 'environment' ? 'user' : 'environment'
    await start()
  }

  async function toggleTorch(): Promise<void> {
    const track = stream.value?.getVideoTracks()[0]

    if (!track || !torchSupported.value) {
      return
    }

    const next = !torchOn.value
    await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraint] }).catch(() => undefined)
    torchOn.value = next
  }

  async function capture(fileName: string): Promise<File | null> {
    const element = video.value

    if (!element || status.value !== 'ready' || !element.videoWidth) {
      return null
    }

    const canvas = document.createElement('canvas')
    canvas.width = element.videoWidth
    canvas.height = element.videoHeight
    canvas.getContext('2d')?.drawImage(element, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, AI_CAMERA_CAPTURE_MIME, AI_CAMERA_CAPTURE_QUALITY),
    )

    return blob ? new File([blob], fileName, { type: AI_CAMERA_CAPTURE_MIME }) : null
  }

  onBeforeUnmount(stop)

  return { status, facing, torchSupported, torchOn, start, stop, switchFacing, toggleTorch, capture }
}
