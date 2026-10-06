import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  QrCode,
  Sparkles,
  Zap,
  ZapOff,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  RefreshCw,
  Scale,
  Search,
  ScanLine
} from 'lucide-react';
import { MaterialLot, PickupJob } from '../../types';
import { useApp } from '../../context/AppContext';

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (scannedText: string, matchedLot?: MaterialLot, matchedJob?: PickupJob) => void;
  title?: string;
  mode?: 'lot' | 'job' | 'any';
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
  title = 'Scan Lot QR Tag',
  mode = 'lot'
}) => {
  const { lots, jobs, lang, showToast } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [manualInput, setManualInput] = useState<string>('');
  const [detectedResult, setDetectedResult] = useState<{
    text: string;
    lot?: MaterialLot;
    job?: PickupJob;
  } | null>(null);

  // Sound beep on scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Start device camera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setHasCameraPermission(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCameraPermission(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : err.message || 'Unable to access device camera.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Switch between back/front cameras
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle torch/flash if track supports it
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const capabilities: any = track.getCapabilities?.() || {};
        if (capabilities.torch) {
          const newState = !isTorchOn;
          await (track as any).applyConstraints({
            advanced: [{ torch: newState }]
          });
          setIsTorchOn(newState);
        } else {
          showToast('Torch flashlight is not available on this camera.');
        }
      } catch (err) {
        console.warn('Torch not supported', err);
      }
    }
  };

  // Lifecycle start/stop camera
  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setDetectedResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // QR Scanning loop with Native BarcodeDetector if available
  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;

    const scanFrame = async () => {
      if (!isScanning || isCancelled || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Native BarcodeDetector API check
        if ('BarcodeDetector' in window) {
          try {
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ['qr_code', 'code_128', 'ean_13']
            });
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              handleCodeFound(rawValue);
              return;
            }
          } catch {
            // Fallback continues
          }
        }
      }

      if (!isCancelled && isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
    };

    if (isOpen && isScanning) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      isCancelled = true;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, isScanning, lots, jobs]);

  const handleCodeFound = (code: string) => {
    if (!code) return;
    setIsScanning(false);
    playBeep();

    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    // Match with Lots or Jobs in system
    const trimmed = code.trim();
    const matchedLot = lots.find(
      (l) => l.id.toLowerCase() === trimmed.toLowerCase() || trimmed.toLowerCase().includes(l.id.toLowerCase())
    );
    const matchedJob = jobs.find(
      (j) =>
        j.id.toLowerCase() === trimmed.toLowerCase() ||
        j.bookingId.toLowerCase() === trimmed.toLowerCase() ||
        trimmed.toLowerCase().includes(j.id.toLowerCase()) ||
        trimmed.toLowerCase().includes(j.bookingId.toLowerCase())
    );

    setDetectedResult({
      text: trimmed,
      lot: matchedLot,
      job: matchedJob
    });
  };

  const handleConfirmResult = () => {
    if (!detectedResult) return;
    onScanResult(detectedResult.text, detectedResult.lot, detectedResult.job);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleCodeFound(manualInput.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#202B38] text-white rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#172521]/90 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C9F1DC] text-[#12613F] flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
              <span className="text-[11px] text-slate-400 font-mono block">
                {lang === 'en' ? 'Camera Live Stream' : 'ডিভাইস ক্যামেরা স্ক্যানার'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport & Laser Overlay */}
        <div className="relative bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Target Frame */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-emerald-400/60 rounded-3xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

              {/* Animated Laser Scanning Line */}
              {isScanning && !detectedResult && (
                <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
              )}

              {/* Target Prompt */}
              {isScanning && !detectedResult && (
                <span className="text-[11px] font-mono font-bold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                  {lang === 'en' ? 'Align QR tag in frame' : 'কিউআর কোড ফ্রেমে রাখুন'}
                </span>
              )}
            </div>
          </div>

          {/* Camera Controls Overlay */}
          <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-xs">
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-2xl backdrop-blur-md transition-all cursor-pointer ${
                isTorchOn
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-lg'
                  : 'bg-slate-900/80 text-white hover:bg-slate-800'
              }`}
              title="Toggle Flash / Torch"
            >
              {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleCamera}
              className="px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-md flex items-center gap-1.5 font-bold cursor-pointer"
              title="Flip Camera"
            >
              <SwitchCamera className="w-4 h-4" />
              <span className="text-[11px]">
                {facingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
              </span>
            </button>
          </div>

          {/* Camera Permission / Error Warning Banner */}
          {hasCameraPermission === false && (
            <div className="absolute inset-4 bg-slate-900/95 border border-amber-500/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <div>
                <h4 className="font-bold text-sm text-white">Camera Offline or Inaccessible</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">{cameraError}</p>
              </div>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera Permission</span>
              </button>
            </div>
          )}
        </div>

        {/* Scan Results & Fast Testing Hub */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Detected Result Callout */}
          {detectedResult ? (
            <div className="p-4 bg-emerald-950/80 border-2 border-emerald-400 rounded-2xl space-y-3 animate-fade-in text-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-bold text-sm text-emerald-300">
                    {lang === 'en' ? 'QR Code Identified!' : 'কিউআর কোড শনাক্ত হয়েছে!'}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
                  {detectedResult.lot ? 'LOT TAG' : detectedResult.job ? 'JOB/BOOKING' : 'RAW PAYLOAD'}
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-emerald-500/30 space-y-1.5">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">Scanned ID:</span>
                  <span className="font-bold text-emerald-300 text-sm">{detectedResult.text}</span>
                </div>

                {detectedResult.lot && (
                  <>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Material Stream:</span>
                      <span className="font-bold text-white">{detectedResult.lot.material.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Initial Weight:</span>
                      <span className="font-bold text-white">{detectedResult.lot.initialFieldWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current Custodian:</span>
                      <span className="font-mono text-emerald-400">{detectedResult.lot.currentCustodian}</span>
                    </div>
                  </>
                )}

                {detectedResult.job && (
                  <>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Customer Address:</span>
                      <span className="font-bold text-white truncate max-w-[200px]">
                        {detectedResult.job.customerAddress}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Scheduled Slot:</span>
                      <span className="font-bold text-white">{detectedResult.job.scheduledWindow}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setDetectedResult(null);
                    setIsScanning(true);
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer text-center"
                >
                  {lang === 'en' ? 'Scan Again' : 'পুনরায় স্ক্যান'}
                </button>
                <button
                  onClick={handleConfirmResult}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>{lang === 'en' ? 'Confirm & Process' : 'নিশ্চিত ও হস্তান্তর'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Preset Test Simulator for Field Testing */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {lang === 'en' ? 'Quick Test Barcodes / Active Vehicle Lots' : 'সক্রিয় লট কিউআর কোডসমূহ'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {lots.slice(0, 4).map((lot) => (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => handleCodeFound(lot.id)}
                      className="p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <QrCode className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold text-white text-[11px] group-hover:text-emerald-300">
                          {lot.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {lot.material.replace(/_/g, ' ')} · {lot.initialFieldWeightKg} kg
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual QR Code Input Fallback */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-700/80 space-y-2">
                <label className="text-[11px] text-slate-400 font-semibold block">
                  {lang === 'en' ? 'Or enter QR Barcode tag manually:' : 'অথবা ম্যানুয়ালি কোড লিখুন:'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g. LOT-2026-098-PET or CL-BK-2026-101"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:outline-hidden focus:border-emerald-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shrink-0 transition-colors"
                  >
                    Lookup
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
