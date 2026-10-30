const elements = {
  toggleButton: document.getElementById("toggleButton"),
  toggleLabel: document.getElementById("toggleLabel"),
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

async function getState() {
  return chrome.storage.local.get(DEFAULT_STATE);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

function playTransition(mode) {
  const stage = elements.illusionStage;

  stage.classList.remove("is-transitioning");
  void stage.offsetWidth;
  stage.classList.add("is-transitioning");

  clearTimeout(animationTimer);

  animationTimer = setTimeout(() => {
    stage.classList.remove("is-transitioning");
  }, 450);

  stage.classList.toggle("is-invisible", mode === "invisible");
}

function updateModeControls(mode) {
  const invisible = mode === "invisible";

  elements.hideButton.classList.toggle("selected", invisible);
  elements.showButton.classList.toggle("selected", !invisible);

  elements.modeName.textContent = invisible ? "Invisible" : "Visible";
  elements.modeSymbol.textContent = invisible ? "⊘" : "◉";

  elements.stageCenterLabel.textContent =
    invisible ? "SUBJECT ABSENT" : "SUBJECT PRESENT";
}

function updateStatus(state) {
  const { enabled, mode } = state;

  elements.toggleButton.classList.toggle("is-enabled", enabled);
  elements.toggleLabel.textContent = enabled
    ? "Disable controls"
    : "Initialize system";

  elements.engineLabel.textContent = enabled ? "ARMED" : "STANDBY";

  elements.systemStatus.dataset.state = enabled
    ? "selected"
    : "idle";

  if (enabled) {
    elements.statusText.textContent =
      mode === "invisible"
        ? "Invisible mode selected"
        : "Visible mode selected";

    elements.statusDescription.textContent =
      "Video engine is not connected yet.";

    elements.statusCode.textContent = "SYS / 01";
    elements.statusBadge.textContent = "READY";
  } else {
    elements.statusText.textContent = "Interface initialized";
    elements.statusDescription.textContent =
      "Video engine is not connected.";

    elements.statusCode.textContent = "SYS / 00";
    elements.statusBadge.textContent = "IDLE";
  }
}

async function render() {
  const state = await getState();

  updateModeControls(state.mode);
  playTransition(state.mode);
  updateStatus(state);
}

async function setMode(mode) {
  const state = await getState();

  await chrome.storage.local.set({
    enabled: true,
    mode
  });

  await render();

  showToast(
    mode === "invisible"
      ? "Invisible mode selected."
      : "Visible mode selected."
  );
}

elements.toggleButton.addEventListener("click", async () => {
  const state = await getState();
  const enabled = !state.enabled;

  await chrome.storage.local.set({ enabled });
  await render();

  showToast(
    enabled
      ? "Controls initialized. Video engine is not connected."
      : "Controls set to standby."
  );
});

elements.hideButton.addEventListener("click", () => {
  setMode("invisible");
});

elements.showButton.addEventListener("click", () => {
  setMode("visible");
});

render().catch((error) => {
  console.error("[Vanishing Cam] Failed to initialize popup:", error);

  elements.statusText.textContent = "Initialization error";
  elements.statusDescription.textContent =
    "Reload the extension and try again.";

  elements.systemStatus.dataset.state = "error";
  elements.statusBadge.textContent = "ERROR";
});