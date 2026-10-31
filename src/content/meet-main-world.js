(() => {
  const CHANNEL = "vanishing-cam-bridge-v1";
  const TARGET_FPS = 15;
  const MAX_WIDTH = 640;
  const MAX_HEIGHT = 360;
  const VANISH_DURATION_MS = 900;
  const MAX_BACKGROUND_PERSON_RATIO = 0.01;

  const state = {
    enabled: false,
    mode: "visible"
  };
  const pipelines = new Map();
  let activePipeline = null;
  let pipelineSequence = 0;
  let lastError = null;
  let hookInstalled = false;

  function getPipelineStatus(pipeline = activePipeline) {
    return {
      hookInstalled,
      cameraAcquired: Boolean(pipeline),
      processedTrackCreated: Boolean(pipeline?.outputTrack),
      processedTrackReturned: Boolean(pipeline?.returned),
      segmentationReady: Boolean(pipeline?.segmentationReady),
      backgroundCaptured: Boolean(pipeline?.backgroundCaptured),
      mode: state.mode,
      enabled: state.enabled,
      outgoingVerified: false,
      error: pipeline?.error ?? lastError
    };
  }

  function publishStatus(pipeline = activePipeline) {
    window.postMessage({
      channel: CHANNEL,
      type: "STATUS",
      status: getPipelineStatus(pipeline)
    }, location.origin);
  }

  function respond(requestId, response) {
    window.postMessage({
      channel: CHANNEL,
      type: "RESPONSE",
      requestId,
      response
    }, location.origin);
  }

  function stopPipeline(pipeline) {
    if (!pipeline || pipeline.stopping) return;
    pipeline.stopping = true;

    if (pipeline.animationFrame !== null) {
      cancelAnimationFrame(pipeline.animationFrame);
    }
    if (pipeline.video) {
      pipeline.video.pause();
      pipeline.video.srcObject = null;
    }
    pipeline.outputStream?.getTracks().forEach((track) => track.stop());
    pipeline.sourceStream.getVideoTracks().forEach((track) => track.stop());
    pipelines.delete(pipeline.id);

    if (activePipeline === pipeline) {
      activePipeline = null;
      publishStatus(null);
    }
  }

  function frameSize(video) {
    const scale = Math.min(
      1,
      MAX_WIDTH / video.videoWidth,
      MAX_HEIGHT / video.videoHeight
    );

    return {
      width: Math.max(2, Math.floor(video.videoWidth * scale / 2) * 2),
      height: Math.max(2, Math.floor(video.videoHeight * scale / 2) * 2)
    };
  }

  function updateMask(pipeline, message) {
    if (message.pipelineId !== pipeline.id) return;

    if (
      !Number.isInteger(message.maskWidth) ||
      !Number.isInteger(message.maskHeight) ||
      message.maskWidth < 1 ||
      message.maskHeight < 1 ||
      message.maskWidth > MAX_WIDTH ||
      message.maskHeight > MAX_HEIGHT ||
      !(message.maskBuffer instanceof ArrayBuffer) ||
      message.maskBuffer.byteLength !== message.maskWidth * message.maskHeight
    ) {
      pipeline.framePending = false;
      pipeline.error = "Ukuran mask segmentasi tidak valid.";
      pipeline.retryAfter = performance.now() + 5000;
      publishStatus(pipeline);
      return;
    }

    const mask = new Uint8Array(message.maskBuffer);
    const image = pipeline.maskContext.createImageData(
      message.maskWidth,
      message.maskHeight
    );
    let personPixelCount = 0;

    for (let i = 0; i < mask.length; i++) {
      const isPerson = mask[i] === 0;
      const offset = i * 4;

      if (isPerson) personPixelCount++;
      image.data[offset] = 255;
      image.data[offset + 1] = 255;
      image.data[offset + 2] = 255;
      image.data[offset + 3] = isPerson ? 255 : 0;
    }

    pipeline.maskCanvas.width = message.maskWidth;
    pipeline.maskCanvas.height = message.maskHeight;
    pipeline.maskContext.putImageData(image, 0, 0);
    pipeline.personRatio = personPixelCount / mask.length;
    pipeline.segmentationReady = true;
    pipeline.framePending = false;
    publishStatus(pipeline);
  }

  function drawPipeline(pipeline, now) {
    if (pipeline.outputTrack.readyState === "ended") {
      stopPipeline(pipeline);
      return;
    }

    if (pipeline.stopping) return;

    const timeSinceRender = pipeline.lastRenderTime === null
      ? Infinity
      : now - pipeline.lastRenderTime;

    if (timeSinceRender < 1000 / TARGET_FPS) {
      pipeline.animationFrame = requestAnimationFrame((time) => drawPipeline(pipeline, time));
      return;
    }

    const elapsed = pipeline.lastRenderTime === null
      ? 0
      : Math.min(timeSinceRender, 100);
    pipeline.lastRenderTime = now;

    if (pipeline.video.readyState < 2) {
      pipeline.animationFrame = requestAnimationFrame((time) => drawPipeline(pipeline, time));
      return;
    }
    const target = state.enabled && state.mode === "invisible" &&
      pipeline.backgroundCaptured ? 1 : 0;
    const progressStep = elapsed / VANISH_DURATION_MS;

    if (pipeline.progress < target) {
      pipeline.progress = Math.min(target, pipeline.progress + progressStep);
    } else if (pipeline.progress > target) {
      pipeline.progress = Math.max(target, pipeline.progress - progressStep);
    }

    if (pipeline.progress > 0 && pipeline.backgroundCaptured) {
      pipeline.outputContext.drawImage(
        pipeline.backgroundCanvas,
        0,
        0,
        pipeline.canvas.width,
        pipeline.canvas.height
      );
      pipeline.foregroundContext.clearRect(
        0,
        0,
        pipeline.canvas.width,
        pipeline.canvas.height
      );
      pipeline.foregroundContext.drawImage(
        pipeline.video,
        0,
        0,
        pipeline.canvas.width,
        pipeline.canvas.height
      );
      if (pipeline.maskCanvas.width > 0 && pipeline.maskCanvas.height > 0) {
        pipeline.foregroundContext.globalCompositeOperation = "destination-in";
        pipeline.foregroundContext.globalAlpha = 1 - pipeline.progress;
        pipeline.foregroundContext.filter = "blur(3px)";
        pipeline.foregroundContext.drawImage(
          pipeline.maskCanvas,
          0,
          0,
          pipeline.canvas.width,
          pipeline.canvas.height
        );
        pipeline.foregroundContext.filter = "none";
        pipeline.foregroundContext.globalAlpha = 1;
        pipeline.foregroundContext.globalCompositeOperation = "source-over";
      } else {
        pipeline.foregroundContext.clearRect(
          0,
          0,
          pipeline.canvas.width,
          pipeline.canvas.height
        );
      }
      pipeline.outputContext.drawImage(
        pipeline.foregroundCanvas,
        0,
        0,
        pipeline.canvas.width,
        pipeline.canvas.height
      );
    } else {
      pipeline.outputContext.drawImage(
        pipeline.video,
        0,
        0,
        pipeline.canvas.width,
        pipeline.canvas.height
      );
    }

    if (!pipeline.framePending && now - pipeline.lastSegmentationTime >= 1000 / TARGET_FPS) {
      if (now < pipeline.retryAfter) {
        pipeline.animationFrame = requestAnimationFrame((time) => drawPipeline(pipeline, time));
        return;
      }

      pipeline.framePending = true;
      pipeline.lastSegmentationTime = now;
      createImageBitmap(pipeline.video)
        .then((frame) => {
          if (pipeline.stopping) {
            frame.close();
            pipeline.framePending = false;
            return;
          }

          window.postMessage({
            channel: CHANNEL,
            type: "FRAME",
            pipelineId: pipeline.id,
            frame
          }, location.origin, [frame]);
        })
        .catch((error) => {
          pipeline.framePending = false;
          pipeline.error = `Frame kamera gagal dibaca: ${error.message}`;
          publishStatus(pipeline);
        });
    }

    pipeline.animationFrame = requestAnimationFrame((time) => drawPipeline(pipeline, time));
  }

  async function createPipeline(sourceStream) {
    const sourceTrack = sourceStream.getVideoTracks()[0];
    if (!sourceTrack) return null;

    if (activePipeline) stopPipeline(activePipeline);

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = sourceStream;
    await video.play();

    if (!video.videoWidth || !video.videoHeight) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Kamera tidak mengirim dimensi video."));
        }, 5000);
        video.addEventListener("loadedmetadata", () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    }

    const size = frameSize(video);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const outputContext = canvas.getContext("2d", { alpha: false });

    if (!outputContext || typeof canvas.captureStream !== "function") {
      throw new Error("Browser tidak mendukung canvas.captureStream().");
    }

    const foregroundCanvas = document.createElement("canvas");
    foregroundCanvas.width = size.width;
    foregroundCanvas.height = size.height;

    const pipeline = {
      id: `pipeline-${++pipelineSequence}`,
      sourceStream,
      video,
      canvas,
      outputContext,
      outputStream: canvas.captureStream(TARGET_FPS),
      foregroundCanvas,
      foregroundContext: foregroundCanvas.getContext("2d"),
      backgroundCanvas: document.createElement("canvas"),
      backgroundCaptured: false,
      segmentationReady: false,
      maskCanvas: document.createElement("canvas"),
      personRatio: null,
      framePending: false,
      lastSegmentationTime: 0,
      retryAfter: 0,
      lastRenderTime: null,
      progress: 0,
      animationFrame: null,
      outputTrack: null,
      returned: false,
      stopping: false,
      error: null
    };

    pipeline.maskContext = pipeline.maskCanvas.getContext("2d");
    pipeline.backgroundCanvas.width = size.width;
    pipeline.backgroundCanvas.height = size.height;
    pipeline.backgroundContext = pipeline.backgroundCanvas.getContext("2d");
    pipeline.outputTrack = pipeline.outputStream.getVideoTracks()[0];
    pipeline.outputTrack.contentHint = "motion";
    pipeline.outputTrack.addEventListener("ended", () => stopPipeline(pipeline), { once: true });
    sourceTrack.addEventListener("ended", () => stopPipeline(pipeline), { once: true });

    pipelines.set(pipeline.id, pipeline);
    activePipeline = pipeline;
    lastError = null;
    pipeline.animationFrame = requestAnimationFrame((time) => drawPipeline(pipeline, time));
    publishStatus(pipeline);

    return pipeline;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.channel !== CHANNEL) return;
    const message = event.data;

    if (message.type === "MASK") {
      const pipeline = pipelines.get(message.pipelineId);
      if (pipeline) updateMask(pipeline, message);
      return;
    }

    if (message.type === "MASK_ERROR") {
      const pipeline = pipelines.get(message.pipelineId);
      if (pipeline) {
        pipeline.framePending = false;
        pipeline.error = message.error;
        pipeline.retryAfter = performance.now() + 5000;
        publishStatus(pipeline);
      }
      return;
    }

    if (message.type !== "COMMAND") return;
    const { requestId, command, payload } = message;

    if (command === "PING") {
      respond(requestId, {
        success: true,
        pipeline: getPipelineStatus()
      });
      return;
    }

    if (command === "SET_STATE") {
      if (
        !payload ||
        typeof payload.enabled !== "boolean" ||
        !["visible", "invisible"].includes(payload.mode)
      ) {
        respond(requestId, { success: false, error: "State efek tidak valid." });
        return;
      }

      if (command === "TOGGLE_STATE") {
        const nextMode = state.mode === "invisible" ? "visible" : "invisible";

        if (nextMode === "invisible" && !activePipeline?.backgroundCaptured) {
          respond(requestId, {
            success: false,
            error: "Rekam background kosong terlebih dahulu melalui popup."
          });
          return;
        }

        state.enabled = true;
        state.mode = nextMode;
        publishStatus();
        respond(requestId, {
          success: true,
          state: { ...state },
          pipeline: getPipelineStatus()
        });
        return;
      }

      if (payload.mode === "invisible" && !activePipeline?.backgroundCaptured) {
        respond(requestId, {
          success: false,
          error: "Ambil background kosong saat kamera Meet aktif sebelum memilih Vanish."
        });
        return;
      }

      state.enabled = payload.enabled;
      state.mode = payload.mode;
      publishStatus();
      respond(requestId, { success: true, pipeline: getPipelineStatus() });
      return;
    }

    if (command === "CAPTURE_BACKGROUND") {
      const pipeline = activePipeline;

      if (!pipeline || pipeline.video.readyState < 2) {
        respond(requestId, {
          success: false,
          error: "Aktifkan kamera Meet terlebih dahulu."
        });
        return;
      }
      if (!pipeline.segmentationReady || pipeline.personRatio === null) {
        respond(requestId, {
          success: false,
          error: "Segmentasi belum siap. Tunggu beberapa detik lalu coba lagi."
        });
        return;
      }
      if (pipeline.personRatio > MAX_BACKGROUND_PERSON_RATIO) {
        respond(requestId, {
          success: false,
          error: "Tubuh masih terdeteksi. Keluar dari frame, tunggu ruangan kosong, lalu Capture Background."
        });
        return;
      }

      pipeline.backgroundContext.drawImage(
        pipeline.video,
        0,
        0,
        pipeline.backgroundCanvas.width,
        pipeline.backgroundCanvas.height
      );
      pipeline.backgroundCaptured = true;
      publishStatus(pipeline);
      respond(requestId, {
        success: true,
        message: "Background kosong berhasil direkam.",
        pipeline: pipeline.id
      });
    }
  });

  const mediaDevices = navigator.mediaDevices;
  const nativeGetUserMedia = mediaDevices?.getUserMedia?.bind(mediaDevices);

  if (!nativeGetUserMedia) {
    lastError = "navigator.mediaDevices.getUserMedia tidak tersedia.";
    publishStatus(null);
    return;
  }

  const getUserMediaWithProcessedVideo = async function getUserMediaWithProcessedVideo(constraints) {
    let sourceStream;

    try {
      sourceStream = await nativeGetUserMedia(constraints);
    } catch (error) {
      lastError = `Kamera Meet gagal dibuka: ${error.message}`;
      publishStatus(null);
      throw error;
    }

    if (!constraints?.video) return sourceStream;

    try {
      const pipeline = await createPipeline(sourceStream);
      if (!pipeline) return sourceStream;

      const processedStream = new MediaStream([
        ...sourceStream.getAudioTracks(),
        pipeline.outputTrack
      ]);

      pipeline.returned = true;
      publishStatus(pipeline);
      return processedStream;
    } catch (error) {
      sourceStream.getTracks().forEach((track) => track.stop());
      lastError = `Gagal membuat video hasil proses: ${error.message}`;
      publishStatus(null);
      throw error;
    }
  };

  try {
    Object.defineProperty(mediaDevices, "getUserMedia", {
      configurable: true,
      writable: true,
      value: getUserMediaWithProcessedVideo
    });
    hookInstalled = mediaDevices.getUserMedia === getUserMediaWithProcessedVideo;
  } catch (error) {
    lastError = `Hook kamera gagal dipasang: ${error.message}`;
  }

  if (!hookInstalled && !lastError) {
    lastError = "Browser menolak pemasangan hook kamera.";
  }

  publishStatus(null);
})();
