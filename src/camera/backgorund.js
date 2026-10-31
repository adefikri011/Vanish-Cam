export class BackgroundManager {
  constructor() {
    this.background = null;
  }

  async capture(video) {
    if (!video || video.readyState < 2) {
      throw new Error("Kamera belum siap.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas tidak tersedia.");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.background = canvas;
    return canvas;
  }

  getBackground() {
    return this.background;
  }

  clear() {
    this.background = null;
  }
}