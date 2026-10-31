import { SegmentationProcessor } from "./segmentation.js";

const camera = document.getElementById("camera");
const maskCanvas = document.getElementById("mask");
const outputCanvas = document.getElementById("output");

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const captureButton = document.getElementById("captureButton");
const vanishButton = document.getElementById("vanishButton");
const revealButton = document.getElementById("revealButton");
const status = document.getElementById("status");

const maskContext = maskCanvas.getContext("2d");
const outputContext = outputCanvas.getContext("2d");

const foregroundCanvas = document.createElement("canvas");
const foregroundContext = foregroundCanvas.getContext("2d");

const backgroundCanvas = document.createElement("canvas");
const backgroundContext = backgroundCanvas.getContext("2d");

const processor = new SegmentationProcessor();

let stream = null;
let animationFrame = null;
let busy = false;
let backgroundCaptured = false;
let mode = "visible";
let latestPersonRatio = null;
let vanishProgress = 0;
let previousFrameTime = null;

const MAX_BACKGROUND_PERSON_RATIO = 0.01;
const VANISH_DURATION_MS = 900; 

function setStatus(message) {
  status.textContent = `Status: ${message}`;
}

function updateButtons() {
  const running = Boolean(stream);

  captureButton.disabled = !running;
  vanishButton.disabled = !running || !backgroundCaptured;
  revealButton.disabled = !running;
}

async function startTest() {
  startButton.disabled = true;

  try {
    setStatus("Meminta izin kamera...");

    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 360 },
        frameRate: { ideal: 15, max: 20 }
      }
    });

    camera.srcObject = stream;
    await camera.play();

    setStatus("Memuat model segmentasi...");
    await processor.initialize();

    const width = camera.videoWidth;
    const height = camera.videoHeight;

    for (const canvas of [
      outputCanvas,
      foregroundCanvas,
      backgroundCanvas
    ]) {
      canvas.width = width;
      canvas.height = height;
    }

    vanishProgress = 0;
    previousFrameTime = null;

    setStatus(
      "Kamera aktif. Kosongkan ruangan dari tubuhmu, lalu Capture Background."
    );

    updateButtons();
    renderFrame();
  } catch (error) {
    console.error("[Vanishing Cam]", error);
    setStatus(`Gagal: ${error.message}`);
    stopTest();
  } finally {
    startButton.disabled = false;
  }
}

function captureBackground() {
  if (!stream || camera.readyState < 2) {
    setStatus("Kamera belum siap.");
    return;
  }

  if (latestPersonRatio === null) {
    setStatus("Tunggu deteksi tubuh selesai sebelum mengambil background.");
    return;
  }

  if (latestPersonRatio > MAX_BACKGROUND_PERSON_RATIO) {
    setStatus(
      `Masih ada tubuh terdeteksi (${Math.round(latestPersonRatio * 100)}%). ` +
      "Keluar dari frame, tunggu sebentar, lalu Capture Background lagi."
    );
    return;
  }

  backgroundContext.drawImage(
    camera,
    0,
    0,
    backgroundCanvas.width,
    backgroundCanvas.height
  );

  backgroundCaptured = true;
  mode = "visible";

  updateButtons();
  setStatus("Background berhasil direkam. Kamu bisa menekan Vanish.");
}

function renderFrame() {
  if (!stream || busy) return;

  busy = true;

  try {
    const result = processor.processFrame(camera);
    const categoryMask = result.categoryMask;

    if (!categoryMask) {
      result.close?.();
      throw new Error("Model tidak menghasilkan category mask.");
    }

    const mask = categoryMask.getAsUint8Array();
    const maskWidth = categoryMask.width;
    const maskHeight = categoryMask.height;

    if (
      maskCanvas.width !== maskWidth ||
      maskCanvas.height !== maskHeight
    ) {
      maskCanvas.width = maskWidth;
      maskCanvas.height = maskHeight;
    }

    const maskImage = maskContext.createImageData(
      maskWidth,
      maskHeight
    );
    let personPixelCount = 0;

    for (let i = 0; i < mask.length; i++) {
      const offset = i * 4;
      const isPerson = mask[i] === 0;

      if (isPerson) personPixelCount++;

      maskImage.data[offset] = 255;
      maskImage.data[offset + 1] = 255;
      maskImage.data[offset + 2] = 255;
      maskImage.data[offset + 3] = isPerson ? 255 : 0;
    }

    latestPersonRatio = personPixelCount / mask.length;
    maskContext.putImageData(maskImage, 0, 0);

    const now = performance.now();
    const elapsed = previousFrameTime === null
      ? 0
      : now - previousFrameTime;
    previousFrameTime = now;

    const targetProgress = mode === "invisible" ? 1 : 0;
    const progressStep = elapsed / VANISH_DURATION_MS;
    const previousProgress = vanishProgress;

    if (vanishProgress < targetProgress) {
      vanishProgress = Math.min(
        targetProgress,
        vanishProgress + progressStep
      );
    } else if (vanishProgress > targetProgress) {
      vanishProgress = Math.max(
        targetProgress,
        vanishProgress - progressStep
      );
    }

    if (!backgroundCaptured) {
      outputContext.drawImage(
        camera,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
      );
    } else {
      const maskAlpha = maskContext.getImageData(
        0,
        0,
        maskWidth,
        maskHeight
      );

      for (let i = 0; i < maskAlpha.data.length; i += 4) {
        const alpha = maskAlpha.data[i + 3];
        const visibleAlpha = alpha > 0
          ? Math.max(0, 255 * (1 - vanishProgress))
          : 0;

        maskAlpha.data[i] = 255;
        maskAlpha.data[i + 1] = 255;
        maskAlpha.data[i + 2] = 255;
        maskAlpha.data[i + 3] = visibleAlpha;
      }

      maskContext.putImageData(maskAlpha, 0, 0);

      foregroundContext.globalCompositeOperation = "source-over";
      foregroundContext.clearRect(
        0,
        0,
        foregroundCanvas.width,
        foregroundCanvas.height
      );

      foregroundContext.drawImage(
        camera,
        0,
        0,
        foregroundCanvas.width,
        foregroundCanvas.height
      );

      foregroundContext.globalCompositeOperation = "destination-in";
      foregroundContext.filter = `blur(${2 + vanishProgress * 8}px)`;
      foregroundContext.drawImage(
        maskCanvas,
        0,
        0,
        foregroundCanvas.width,
        foregroundCanvas.height
      );
      foregroundContext.filter = "none";
      foregroundContext.globalCompositeOperation = "source-over";

      outputContext.globalCompositeOperation = "source-over";
      outputContext.drawImage(
        backgroundCanvas,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
      );

      outputContext.drawImage(
        foregroundCanvas,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
      );
    }

    if (previousProgress < 1 && vanishProgress === 1) {
      setStatus("Vanish selesai. Tekan Reveal untuk muncul kembali.");
    } else if (previousProgress > 0 && vanishProgress === 0) {
      setStatus("Reveal selesai. Kamu terlihat kembali.");
    }

    result.close?.();
  } catch (error) {
    console.error("[Vanishing Cam] Pemrosesan gagal:", error);
    setStatus(`Pemrosesan gagal: ${error.message}`);
    stopTest();
    return;
  } finally {
    busy = false;
  }

  animationFrame = requestAnimationFrame(renderFrame);
}

function stopTest() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  camera.srcObject = null;
  backgroundCaptured = false;
  mode = "visible";
  latestPersonRatio = null;
  vanishProgress = 0;
  previousFrameTime = null;

  processor.dispose().catch(console.error);

  updateButtons();
}

startButton.addEventListener("click", startTest);
stopButton.addEventListener("click", stopTest);

captureButton.addEventListener("click", captureBackground);

vanishButton.addEventListener("click", () => {
  if (!backgroundCaptured) {
    setStatus("Rekam background terlebih dahulu.");
    return;
  }

  mode = "invisible";
  setStatus("Menghilang... tunggu animasi selesai.");
});

revealButton.addEventListener("click", () => {
  mode = "visible";
  setStatus("Muncul kembali...");
});

window.addEventListener("beforeunload", stopTest);

updateButtons();