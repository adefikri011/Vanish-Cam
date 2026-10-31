export class CameraManager {
  constructor() {
    this.stream = null;
    this.video = document.createElement("video");

    this.video.autoplay = true;
    this.video.muted = true;
    this.video.playsInline = true;
  }

  async start() {
    if (this.stream) {
      return this.video;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 360 },
        frameRate: { ideal: 15, max: 20 }
      }
    });

    this.video.srcObject = this.stream;

    await new Promise((resolve, reject) => {
      this.video.onloadedmetadata = resolve;
      this.video.onerror = () => {
        reject(new Error("Gagal memuat video kamera."));
      };
    });

    await this.video.play();

    return this.video;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.video.srcObject = null;
  }
}