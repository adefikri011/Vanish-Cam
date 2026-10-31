(() => {
  const CHANNEL = "vanishing-cam-bridge-v1";
  const pendingRequests = new Map();
  let requestSequence = 0;
  let latestStatus = null;
  let processorFrame = null;
  let processorFrameReady = false;
  let processorError = null;
  let processorReadyTimeout = null;
  let waitingFrame = null;

  function createProcessorFrame() {
    processorFrame = document.createElement("iframe");
    processorFrame.title = "Vanishing Cam segmentation worker";
    processorFrame.tabIndex = -1;
    processorFrame.setAttribute("aria-hidden", "true");
    processorFrame.style.cssText =
      "position:fixed;width:1px;height:1px;left:-10px;top:-10px;" +
      "opacity:0;pointer-events:none;border:0";
    processorFrame.src =
      `${chrome.runtime.getURL("src/processor/meet-worker.html")}#` +
      encodeURIComponent(location.origin);
    processorFrame.addEventListener("load", () => {
      processorFrame.contentWindow.postMessage({
        channel: CHANNEL,
        type: "INITIALIZE"
      }, new URL(processorFrame.src).origin);

      processorReadyTimeout = setTimeout(() => {
        if (!processorFrameReady) {
          processorError = "MediaPipe tidak merespons di frame ekstensi.";
          reportProcessorFailure(processorError);
        }
      }, 12000);
    }, { once: true });
    processorFrame.addEventListener("error", () => {
      processorError = "Frame MediaPipe ekstensi gagal dimuat.";
      reportProcessorFailure(processorError);
    }, { once: true });

    if (document.documentElement) {
      document.documentElement.appendChild(processorFrame);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.documentElement?.appendChild(processorFrame);
      }, { once: true });
    }
  }

  function sendFrameToProcessor(message) {
    if (processorError) {
      message.frame.close();
      window.postMessage({
        channel: CHANNEL,
        type: "MASK_ERROR",
        pipelineId: message.pipelineId,
        error: processorError
      }, location.origin);
      return;
    }

    if (!processorFrameReady || !processorFrame?.contentWindow) {
      waitingFrame?.frame?.close();
      waitingFrame = message;
      return;
    }

    const extensionOrigin = new URL(processorFrame.src).origin;
    processorFrame.contentWindow.postMessage({
      channel: CHANNEL,
      type: "FRAME",
      pipelineId: message.pipelineId,
      frame: message.frame
    }, extensionOrigin, [message.frame]);
  }

  function requestMain(type, payload = {}) {
    const requestId = `vc-${Date.now()}-${++requestSequence}`;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        resolve({
          success: false,
          error: "Kamera Meet belum merespons. Muat ulang tab Meet lalu coba lagi."
        });
      }, 8000);

      pendingRequests.set(requestId, (response) => {
        clearTimeout(timeout);
        pendingRequests.delete(requestId);
        resolve(response);
      });

      window.postMessage({
        channel: CHANNEL,
        type: "COMMAND",
        command: type,
        requestId,
        payload
      }, location.origin);
    });
  }

  function reportProcessorFailure(error) {
    if (!waitingFrame) return;
    const failedFrame = waitingFrame;
    waitingFrame = null;
    failedFrame.frame.close();

    window.postMessage({
      channel: CHANNEL,
      type: "MASK_ERROR",
      pipelineId: failedFrame.pipelineId,
      error
    }, location.origin);
  }

  window.addEventListener("message", (event) => {
    if (
      event.data?.channel !== CHANNEL ||
      (event.source !== window && event.source !== processorFrame?.contentWindow)
    ) {
      return;
    }

    const message = event.data;

    if (message.type === "FRAME") {
      if (
        typeof message.pipelineId !== "string" ||
        !message.pipelineId.startsWith("pipeline-") ||
        !(message.frame instanceof ImageBitmap) ||
        message.frame.width > 640 ||
        message.frame.height > 360
      ) {
        message.frame?.close?.();
        return;
      }

      sendFrameToProcessor(message);
      return;
    }

    if (event.source === processorFrame?.contentWindow &&
        message.type === "WORKER_READY") {
      clearTimeout(processorReadyTimeout);
      processorFrameReady = true;
      if (waitingFrame) {
        const frame = waitingFrame;
        waitingFrame = null;
        sendFrameToProcessor(frame);
      }
      return;
    }

    if (event.source === processorFrame?.contentWindow &&
        message.type === "WORKER_ERROR") {
      processorError = message.error;
      reportProcessorFailure(processorError);
      return;
    }

    if (event.source === processorFrame?.contentWindow &&
        ["MASK", "MASK_ERROR"].includes(message.type)) {
      window.postMessage(message, location.origin, message.maskBuffer
        ? [message.maskBuffer]
        : []);
      return;
    }

    if (message.type === "STATUS") {
      latestStatus = message.status;
      return;
    }

    if (message.type === "RESPONSE" && message.requestId) {
      const resolve = pendingRequests.get(message.requestId);
      resolve?.(message.response);
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message.type !== "string") {
      return;
    }

    if (message.type === "VANISHING_CAM_PING") {
      requestMain("PING").then((response) => {
        sendResponse({
          ...response,
          page: "google-meet",
          pipeline: response.pipeline ?? latestStatus
        });
      });
      return true;
    }

    if (message.type === "VANISHING_CAM_SET_STATE") {
      const nextState = message.state;

      if (
        !nextState ||
        typeof nextState.enabled !== "boolean" ||
        !["visible", "invisible"].includes(nextState.mode)
      ) {
        sendResponse({ success: false, error: "State Vanishing Cam tidak valid." });
        return;
      }

      requestMain("SET_STATE", nextState).then(sendResponse);
      return true;
    }

    if (message.type === "VANISHING_CAM_TOGGLE") {
      requestMain("TOGGLE_STATE").then(sendResponse);
      return true;
    }

    if (message.type === "VANISHING_CAM_CAPTURE_BACKGROUND") {
      requestMain("CAPTURE_BACKGROUND").then(sendResponse);
      return true;
    }
  });

  createProcessorFrame();
})();
