import { SegmentationProcessor } from "./segmentation.js";

const CHANNEL = "vanishing-cam-bridge-v1";
const parentOrigin = decodeURIComponent(location.hash.slice(1));
const processor = new SegmentationProcessor();
let initialization = null;

function postToParent(message, transfer = []) {
  parent.postMessage({
    channel: CHANNEL,
    ...message
  }, parentOrigin, transfer);
}

async function initialize() {
  if (!initialization) {
    initialization = processor.initialize();
  }

  await initialization;
}

async function processFrame(message) {
  let result = null;

  try {
    await initialize();
    result = processor.processFrame(message.frame);

    if (!result.categoryMask) {
      throw new Error("MediaPipe tidak menghasilkan category mask.");
    }

    const mask = new Uint8Array(result.categoryMask.getAsUint8Array());
    postToParent({
      type: "MASK",
      pipelineId: message.pipelineId,
      maskWidth: result.categoryMask.width,
      maskHeight: result.categoryMask.height,
      maskBuffer: mask.buffer
    }, [mask.buffer]);
  } catch (error) {
    postToParent({
      type: "MASK_ERROR",
      pipelineId: message.pipelineId,
      error: error.message || "Pemrosesan segmentasi gagal."
    });
  } finally {
    result?.close?.();
    message.frame.close();
  }
}

window.addEventListener("message", (event) => {
  if (event.source !== parent || event.data?.channel !== CHANNEL) return;

  if (event.data.type === "INITIALIZE") {
    postToParent({ type: "WORKER_READY" });
    return;
  }

  if (event.data.type === "FRAME") {
    processFrame(event.data);
  }
});
