"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import { ZoomIn, ZoomOut, Check, X, RotateCcw } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageCropperProps {
  imageSrc: string;
  aspect: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}


export default function ImageCropper({
  imageSrc,
  aspect,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onCropChange = useCallback((_: unknown, croppedAreaPx: Area) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch (err) {
      console.error("Crop failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col">
      {/* Cropper area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropChange}
          showGrid
          cropShape="rect"
          style={{
            containerStyle: { background: "#000" },
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-neutral-900 px-6 py-4">
        {/* Zoom slider */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <ZoomOut className="h-4 w-4 text-neutral-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-48 accent-white"
          />
          <ZoomIn className="h-4 w-4 text-neutral-400" />
          <button
            type="button"
            onClick={handleReset}
            className="ml-4 p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-600 text-neutral-300 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-50 transition-colors"
          >
            <Check className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Terapkan"}
          </button>
        </div>

        <p className="text-center text-[10px] text-neutral-500 mt-3">
          Geser dan zoom untuk mengatur area gambar. Aspect ratio: {
            aspect === 16 / 9 ? "16:9 (Hero)" : aspect === 3 / 4 ? "3:4 (Product)" : "4:3 (Banner)"
          }
        </p>
      </div>
    </div>,
    document.body
  );
}

/**
 * Crop an image using canvas and return as Blob
 */
function getCroppedImage(imageSrc: string, crop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject(new Error("Canvas context failed"));

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    };
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageSrc;
  });
}
