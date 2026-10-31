export class SegmentationProcessor {
  constructor() {
    this.initialized = false;
    this.segmenter = null;
    this.runningMode = "VIDEO";
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const { ImageSegmenter, FilesetResolver } = await import(
        "../../assets/vendor/mediapipe/vision_bundle.mjs"
      );

      const vision = await FilesetResolver.forVisionTasks(
        new URL("../../assets/vendor/mediapipe/wasm/", import.meta.url).href
      );

      this.segmenter = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: new URL(
            "../../assets/models/selfie_segmenter_landscape.tflite",
            import.meta.url
          ).href,
          delegate: "CPU"
        },
        runningMode: this.runningMode,
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });

      this.initialized = true;
      console.info("[Vanishing Cam] MediaPipe berhasil diinisialisasi.");
    } catch (error) {
      this.segmenter = null;
      this.initialized = false;

      console.error("[Vanishing Cam] Gagal menginisialisasi MediaPipe:", error);
      throw new Error(
        `Gagal memuat mesin segmentasi: ${error.message}`
      );
    }
  }

  processFrame(video) {
    if (!this.initialized || !this.segmenter) {
      throw new Error("Mesin segmentasi belum diinisialisasi.");
    }

    if (!video || video.readyState < 2) {
      throw new Error("Video kamera belum siap.");
    }

    return this.segmenter.segmentForVideo(video, performance.now());
  }

  async dispose() {
    if (this.segmenter?.close) {
      this.segmenter.close();
    }

    this.segmenter = null;
    this.initialized = false;
  }
}