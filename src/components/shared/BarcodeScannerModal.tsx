'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import { X, ScanLine, AlertCircle } from 'lucide-react'

export function BarcodeScannerModal({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls: IScannerControls | null = null
    let detected = false

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, _err, scannerControls) => {
        controls = scannerControls
        if (result && !detected) {
          detected = true
          scannerControls.stop()
          onDetected(result.getText())
        }
      })
      .catch(() => {
        setError('Could not access the camera. Check camera permissions and try again.')
      })

    return () => {
      detected = true
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scan barcode"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      <div className="flex items-center justify-between p-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <ScanLine size={20} /> Scan Barcode
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="flex h-touch-min w-touch-min items-center justify-center rounded-xl text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-snap)] hover:bg-white/10 active:scale-[0.97]"
        >
          <X size={22} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="aspect-[3/2] w-full max-w-sm rounded-2xl border-4 border-white/70" />
        </div>
        {error && (
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-xl bg-danger-600 px-4 py-3 text-white">
            <AlertCircle size={18} className="shrink-0" /> {error}
          </div>
        )}
      </div>

      <p className="p-4 text-center text-sm font-semibold text-white/60">Point the camera at a product&rsquo;s barcode.</p>
    </div>
  )
}
