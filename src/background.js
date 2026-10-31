chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-vanish") return;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (!tab?.id || !tab.url?.startsWith("https://meet.google.com/")) {
      console.info("[Vanishing Cam] Shortcut diabaikan: tab aktif bukan Google Meet.");
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "VANISHING_CAM_TOGGLE"
    });

    if (!response?.success) {
      console.warn(
        "[Vanishing Cam] Shortcut gagal:",
        response?.error ?? "Google Meet tidak merespons."
      );
      return;
    }

    await chrome.storage.local.set({
      enabled: response.state.enabled,
      mode: response.state.mode
    });
  } catch (error) {
    console.warn(
      "[Vanishing Cam] Shortcut tidak dapat terhubung ke Meet:",
      error
    );
  }
});
