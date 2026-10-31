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
  stepConnect: document.getElementById("stepConnect"),
  stepBackground: document.getElementById("stepBackground"),
  stepEffect: document.getElementById("stepEffect"),
  stepperConnect: document.getElementById("stepperConnect"),
  stepperBackground: document.getElementById("stepperBackground"),
  stepperEffect: document.getElementById("stepperEffect"),
  backButton: document.getElementById("backButton"),
  nextButton: document.getElementById("nextButton"),
  stepCaption: document.getElementById("stepCaption"),

  toast: document.getElementById("toast")
};

const DEFAULT_STATE = {
  enabled: false,
  mode: "visible"
};

let toastTimer;
let renderRequest = 0;
let wizardStep = null;

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

  elements.hideButton?.setAttribute("aria-pressed", String(invisible));
  elements.showButton?.setAttribute("aria-pressed", String(!invisible));
}

function renderWizardStep() {
  const cards = [
    elements.stepConnect,
    elements.stepBackground,
    elements.stepEffect
  ];
  const indicators = [
    elements.stepperConnect,
    elements.stepperBackground,
    elements.stepperEffect
  ];

  cards.forEach((card, index) => {
    card.hidden = index !== wizardStep;
    card.dataset.wizardActive = String(index === wizardStep);
  });

  indicators.forEach((indicator, index) => {
    if (index === wizardStep) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }

    indicator.dataset.stepState = index < wizardStep
      ? "complete"
      : index === wizardStep
        ? "current"
        : "upcoming";
  });

  elements.backButton.disabled = wizardStep === 0;
  elements.nextButton.hidden = wizardStep === cards.length - 1;
  elements.nextButton.disabled = false;
  elements.stepCaption.textContent = `Langkah ${wizardStep + 1} dari ${cards.length}`;
  elements.nextButton.innerHTML = wizardStep === 1
    ? 'Lanjut ke efek <span aria-hidden="true">→</span>'
    : 'Lanjut <span aria-hidden="true">→</span>';
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
  const meetDetected = Boolean(meetStatus?.success);
  const cameraReady = Boolean(pipeline?.processedTrackReturned);
  const segmentationReady = Boolean(pipeline?.segmentationReady);
  const backgroundReady = Boolean(pipeline?.backgroundCaptured);
  const effectReady = enabled && cameraReady && segmentationReady && backgroundReady;
  const progressStep = backgroundReady
    ? 2
    : enabled && cameraReady && segmentationReady
      ? 1
      : 0;

  if (wizardStep === null) {
    wizardStep = progressStep;
  }

  if (elements.toggleLabel) {
    elements.toggleLabel.textContent = enabled
      ? "Matikan kontrol"
      : "Aktifkan kontrol";
  }

  if (elements.systemStatus) {
    elements.systemStatus.dataset.state = meetStatus?.success
      ? pipeline?.error
        ? "error"
        : effectReady
          ? "selected"
          : "idle"
      : "error";
  }

  if (elements.statusLight) {
    elements.statusLight.classList.toggle("is-active", effectReady);
  }

  if (!meetDetected) {
    elements.statusText.textContent = "Google Meet belum terhubung";
    elements.statusDescription.textContent =
      meetStatus?.error ?? "Buka tab Google Meet lalu refresh halaman.";
  } else if (pipeline?.error) {
    elements.statusText.textContent = "Perlu pemeriksaan";
    elements.statusDescription.textContent = pipeline.error;
  } else if (!cameraReady) {
    elements.statusText.textContent = "Nyalakan kamera Meet";
    elements.statusDescription.textContent =
      "Setelah kamera aktif, tunggu track dan segmentasi siap.";
  } else if (!segmentationReady) {
    elements.statusText.textContent = "Menyiapkan segmentasi";
    elements.statusDescription.textContent =
      "Model sedang memproses video kamera.";
  } else if (!backgroundReady) {
    elements.statusText.textContent = "Siap merekam background";
    elements.statusDescription.textContent =
      "Keluar dari frame, lalu rekam ruangan kosong.";
  } else if (effectReady) {
    elements.statusText.textContent = mode === "invisible"
      ? "Mode Vanish aktif"
      : "Siap digunakan";
    elements.statusDescription.textContent = mode === "invisible"
      ? "Tekan Reveal atau Ctrl + Shift + Y untuk kembali."
      : "Gunakan tombol Vanish atau shortcut Ctrl + Shift + Y.";
  } else {
    elements.statusText.textContent = "Aktifkan kontrol untuk melanjutkan";
    elements.statusDescription.textContent =
      "Video diproses lokal; peserta lain perlu memverifikasi keluaran.";
  }

  if (elements.statusBadge) {
    elements.statusBadge.textContent = !meetDetected
      ? "MEET OFFLINE"
      : pipeline?.error
        ? "ERROR"
        : backgroundReady
          ? "READY"
          : cameraReady
            ? "CAMERA"
            : "MEET OPEN";
  }

  if (elements.statusCode) {
    elements.statusCode.textContent = !meetDetected
      ? "MEET / --"
      : pipeline?.processedTrackReturned
        ? "TRACK / OUT"
        : "MEET / OK";
  }

  if (elements.captureButton) {
    elements.captureButton.disabled = !(
      cameraReady && segmentationReady && enabled
    );
  }

  if (elements.captureLabel) {
    elements.captureLabel.textContent = backgroundReady
      ? "Rekam ulang background"
      : "Rekam background kosong";
  }

  elements.hideButton.disabled = !effectReady;
  elements.showButton.disabled = !effectReady;

  elements.stepConnect.dataset.stepState = enabled && cameraReady
    ? "complete"
    : meetDetected
      ? "current"
      : "upcoming";
  elements.stepBackground.dataset.stepState = backgroundReady
    ? "complete"
    : cameraReady && segmentationReady && enabled
      ? "current"
      : "upcoming";
  elements.stepEffect.dataset.stepState = backgroundReady
    ? "current"
    : "upcoming";

  renderWizardStep();
}

/* ----------------------------------------
   RENDER
---------------------------------------- */

async function render() {
  const requestId = ++renderRequest;

  const state = await getState();

  updateModeControls(state.mode);

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
      ? "Mode Vanish aktif."
      : "Mode Reveal aktif."
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
        ? "Kontrol Vanishing Cam aktif."
        : "Kontrol Vanishing Cam dimatikan."
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

    await render();
    showToast("Background berhasil ditangkap.");
  }
);

elements.backButton?.addEventListener("click", () => {
  if (wizardStep > 0) {
    wizardStep--;
    renderWizardStep();
  }
});

elements.nextButton?.addEventListener("click", () => {
  if (wizardStep < 2) {
    wizardStep++;
    renderWizardStep();
  }
});

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

setInterval(() => {
  render().catch((error) => {
    console.error(
      "[Vanishing Cam] Status refresh failed:",
      error
    );
  });
}, 2000);