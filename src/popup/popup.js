const elements = {
  toggleButton: document.getElementById("toggleButton"),
  toggleLabel: document.getElementById("toggleLabel"),
  captureButton: document.getElementById("captureButton"),
  captureLabel: document.getElementById("captureLabel"),
  hideButton: document.getElementById("hideButton"),
  showButton: document.getElementById("showButton"),

  statusText: document.getElementById("statusText"),
  statusDescription: document.getElementById("statusDescription"),
  statusCode: document.getElementById("statusCode"),
  statusBadge: document.getElementById("statusBadge"),
  statusLight: document.getElementById("statusLight"),
  systemStatus: document.querySelector(".system-status"),

  engineLabel: document.getElementById("engineLabel"),
  illusionStage: document.getElementById("illusionStage"),
  stageCenterLabel: document.getElementById("stageCenterLabel"),
  modeName: document.getElementById("modeName"),
  modeSymbol: document.getElementById("modeSymbol"),

  toast: document.getElementById("toast")
};

const DEFAULT_STATE = {
  enabled: false,
  mode: "visible"
};

let toastTimer;
let animationTimer;
let renderRequest = 0;

/* ----------------------------------------
   STATE MANAGEMENT
---------------------------------------- */

async function getState() {
  return chrome.storage.local.get(DEFAULT_STATE);
}

async function saveState(state) {
  await chrome.storage.local.set({
    enabled: Boolean(state.enabled),
    mode: state.mode === "invisible" ? "invisible" : "visible"
  });
}

/* ----------------------------------------
   TOAST NOTIFICATIONS
---------------------------------------- */

function showToast(message) {
  if (!elements.toast) return;

  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

/* ----------------------------------------
   VISUAL TRANSITIONS
---------------------------------------- */

function playTransition(mode) {
  const stage = elements.illusionStage;

  if (!stage) return;

  stage.classList.remove("is-transitioning");

  // Memulai ulang animasi CSS.
  void stage.offsetWidth;

  stage.classList.add("is-transitioning");

  clearTimeout(animationTimer);

  animationTimer = setTimeout(() => {
    stage.classList.remove("is-transitioning");
  }, 450);

  stage.classList.toggle(
    "is-invisible",
    mode === "invisible"
  );
}

/* ----------------------------------------
   MODE CONTROLS
---------------------------------------- */

function updateModeControls(mode) {
  const invisible = mode === "invisible";

  elements.hideButton?.classList.toggle(
    "selected",
    invisible
  );

  elements.showButton?.classList.toggle(
    "selected",
    !invisible
  );

  if (elements.modeName) {
    elements.modeName.textContent = invisible
      ? "Invisible"
      : "Visible";
  }

  if (elements.modeSymbol) {
    elements.modeSymbol.textContent = invisible
      ? "⊘"
      : "◉";
  }

  if (elements.stageCenterLabel) {
    elements.stageCenterLabel.textContent = invisible
      ? "SUBJECT ABSENT"
      : "SUBJECT PRESENT";
  }
}

/* ----------------------------------------
   GOOGLE MEET COMMUNICATION
---------------------------------------- */

async function getActiveMeetTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const tab = tabs[0];

  if (
    !tab?.id ||
    !tab.url?.startsWith("https://meet.google.com/")
  ) {
    return null;
  }

  return tab;
}

async function pingGoogleMeet() {
  const tab = await getActiveMeetTab();

  if (!tab) {
    return {
      success: false,
      error: "Buka tab Google Meet untuk menghubungkan sistem."
    };
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "VANISHING_CAM_PING"
    });

    return response ?? {
      success: false,
      error: "Google Meet tidak memberikan respons."
    };
  } catch (error) {
    console.warn(
      "[Vanishing Cam] Ping Google Meet gagal:",
      error
    );

    return {
      success: false,
      error: "Muat ulang tab Google Meet, lalu coba lagi."
    };
  }
}

async function syncGoogleMeetState(state) {
  const tab = await getActiveMeetTab();

  if (!tab) {
    return {
      success: false,
      error: "Buka Google Meet terlebih dahulu."
    };
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "VANISHING_CAM_SET_STATE",
      state: {
        enabled: Boolean(state.enabled),
        mode: state.mode
      }
    });

    return response ?? {
      success: false,
      error: "Google Meet tidak memberikan respons."
    };
  } catch (error) {
    console.warn(
      "[Vanishing Cam] Sinkronisasi Google Meet gagal:",
      error
    );

    return {
      success: false,
      error: "Content script belum siap. Muat ulang Google Meet."
    };
  }
}

async function captureMeetBackground() {
  const tab = await getActiveMeetTab();

  if (!tab) {
    return {
      success: false,
      error: "Buka Google Meet terlebih dahulu."
    };
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "VANISHING_CAM_CAPTURE_BACKGROUND"
    });

    return response ?? {
      success: false,
      error: "Tidak bisa menangkap background dari Google Meet."
    };
  } catch (error) {
    console.warn(
      "[Vanishing Cam] Capture background gagal:",
      error
    );

    return {
      success: false,
      error: "Video lokal belum tersedia di Google Meet."
    };
  }
}

/* ----------------------------------------
   STATUS DISPLAY
---------------------------------------- */

function updateStatus(state, meetStatus = null) {
  const { enabled, mode } = state;
  const pipeline = meetStatus?.pipeline;

  elements.toggleButton?.classList.toggle(
    "is-enabled",
    enabled
  );

  if (elements.toggleLabel) {
    elements.toggleLabel.textContent = enabled
      ? "Disable controls"
      : "Initialize system";
  }

  if (elements.engineLabel) {
    elements.engineLabel.textContent = enabled
      ? "ARMED"
      : "STANDBY";
  }

  if (elements.systemStatus) {
    elements.systemStatus.dataset.state = enabled
      ? "selected"
      : "idle";
  }

  if (elements.statusLight) {
    elements.statusLight.classList.toggle(
      "is-active",
      enabled
    );
  }

  if (enabled) {
    if (elements.statusText) {
      elements.statusText.textContent =
        mode === "invisible"
          ? "Invisible mode selected"
          : "Visible mode selected";
    }

    if (elements.statusDescription) {
      elements.statusDescription.textContent =
        "Visual mode selected. Video processing is not connected.";
    }

    if (elements.statusCode) {
      elements.statusCode.textContent = "SYS / 01";
    }

    if (elements.statusBadge) {
      elements.statusBadge.textContent = "STANDBY";
    }
  } else {
    if (elements.statusText) {
      elements.statusText.textContent = "System on standby";
    }

    if (elements.statusDescription) {
      elements.statusDescription.textContent =
        "Initialize controls to begin the experiment.";
    }

    if (elements.statusCode) {
      elements.statusCode.textContent = "SYS / 00";
    }

    if (elements.statusBadge) {
      elements.statusBadge.textContent = "IDLE";
    }
  }

  // Status koneksi Meet ditampilkan terpisah dari status mesin video.
  if (meetStatus) {
    if (elements.statusDescription) {
      if (!meetStatus.success) {
        elements.statusDescription.textContent = meetStatus.error;
      } else if (pipeline?.error) {
        elements.statusDescription.textContent = pipeline.error;
      } else if (!pipeline?.cameraAcquired) {
        elements.statusDescription.textContent =
          "Meet terdeteksi. Aktifkan kamera untuk menyiapkan video terproses.";
      } else if (!pipeline.processedTrackReturned) {
        elements.statusDescription.textContent =
          "Kamera ditemukan; track hasil proses belum dikembalikan ke Meet.";
      } else if (!pipeline.segmentationReady) {
        elements.statusDescription.textContent =
          "Track hasil proses aktif; menunggu segmentasi MediaPipe.";
      } else if (!pipeline.backgroundCaptured) {
        elements.statusDescription.textContent =
          "Track terproses siap. Rekam background saat frame kosong.";
      } else {
        elements.statusDescription.textContent =
          "Track terproses dikembalikan ke Meet. Minta peserta lain memverifikasi efek.";
      }
    }

    if (elements.statusCode) {
      elements.statusCode.textContent = !meetStatus.success
        ? "MEET / --"
        : pipeline?.processedTrackReturned
          ? "TRACK / OUT"
          : pipeline?.cameraAcquired
            ? "CAMERA / OK"
            : "MEET / OK";
    }

    if (elements.statusBadge) {
      elements.statusBadge.textContent = !meetStatus.success
        ? "OFFLINE"
        : pipeline?.error
          ? "ERROR"
          : pipeline?.processedTrackReturned
            ? "TRACK"
            : pipeline?.cameraAcquired
              ? "CAMERA"
              : "HOOK";
    }
  }
}

/* ----------------------------------------
   RENDER
---------------------------------------- */

async function render() {
  const requestId = ++renderRequest;

  const state = await getState();

  updateModeControls(state.mode);
  playTransition(state.mode);

  // Tampilkan status lokal terlebih dahulu.
  updateStatus(state);

  const meetStatus = await pingGoogleMeet();

  // Hindari respons lama menimpa tampilan terbaru.
  if (requestId !== renderRequest) return;

  updateStatus(state, meetStatus);
}

/* ----------------------------------------
   MODE ACTIONS
---------------------------------------- */

async function setMode(mode) {
  if (!["visible", "invisible"].includes(mode)) {
    showToast("Mode tidak valid.");
    return;
  }

  const nextState = {
    enabled: true,
    mode
  };

  const result = await syncGoogleMeetState(nextState);

  if (!result.success) {
    showToast(result.error);
    return;
  }

  await saveState(nextState);
  await render();

  showToast(
    mode === "invisible"
      ? "Invisible mode selected."
      : "Visible mode selected."
  );
}

/* ----------------------------------------
   EVENT LISTENERS
---------------------------------------- */

elements.toggleButton?.addEventListener(
  "click",
  async () => {
    const state = await getState();

    const nextState = {
      ...state,
      enabled: !state.enabled
    };

    const result = await syncGoogleMeetState(nextState);

    if (!result.success) {
      showToast(result.error);
      return;
    }

    await saveState(nextState);
    await render();

    showToast(
      nextState.enabled
        ? "Controls initialized."
        : "Controls set to standby."
    );
  }
);

elements.hideButton?.addEventListener(
  "click",
  () => setMode("invisible")
);

elements.showButton?.addEventListener(
  "click",
  () => setMode("visible")
);

elements.captureButton?.addEventListener(
  "click",
  async () => {
    const result = await captureMeetBackground();

    if (!result.success) {
      showToast(result.error);
      return;
    }

    showToast("Background berhasil ditangkap.");
  }
);

/* ----------------------------------------
   STORAGE SYNCHRONIZATION
---------------------------------------- */

chrome.storage.onChanged.addListener(
  (changes, areaName) => {
    if (
      areaName === "local" &&
      (changes.enabled || changes.mode)
    ) {
      render().catch((error) => {
        console.error(
          "[Vanishing Cam] Storage update failed:",
          error
        );
      });
    }
  }
);

/* ----------------------------------------
   INITIALIZATION
---------------------------------------- */

render().catch((error) => {
  console.error(
    "[Vanishing Cam] Failed to initialize popup:",
    error
  );

  if (elements.statusText) {
    elements.statusText.textContent = "Initialization error";
  }

  if (elements.statusDescription) {
    elements.statusDescription.textContent =
      "Reload the extension and try again.";
  }

  if (elements.systemStatus) {
    elements.systemStatus.dataset.state = "error";
  }

  if (elements.statusBadge) {
    elements.statusBadge.textContent = "ERROR";
  }
});