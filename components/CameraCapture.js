"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Upload } from "lucide-react";
import { Button } from "./ui";

/**
 * Live front-camera capture. Calls onChange(blob | null).
 * Falls back to a file picker (opens the camera on phones) when getUserMedia is unavailable.
 */
export default function CameraCapture({ onChange }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not available in this browser. Upload a photo instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        setError(
          e?.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser settings, or upload a photo."
            : "Could not start the camera. Upload a photo instead."
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    // centre-crop to a square and mirror so it matches what the user saw
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, 640, 640);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPreview(URL.createObjectURL(blob));
        onChange(blob);
      },
      "image/jpeg",
      0.85
    );
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const retake = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div>
      <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-panel bg-navy border border-line">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover -scale-x-100 ${preview || error ? "hidden" : ""}`}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Your selfie" className="h-full w-full object-cover" />
        )}
        {!preview && !ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Starting camera…</div>
        )}
        {!preview && error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/80">{error}</div>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {preview ? (
          <Button variant="secondary" onClick={retake} type="button">
            <RotateCcw className="h-4 w-4" /> Retake
          </Button>
        ) : error ? (
          <label className="btn btn-primary cursor-pointer">
            <Upload className="h-4 w-4" /> Upload photo
            <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" className="sr-only" onChange={onFile} />
          </label>
        ) : (
          <Button onClick={capture} disabled={!ready} type="button">
            <Camera className="h-4 w-4" /> Take selfie
          </Button>
        )}
      </div>
    </div>
  );
}
