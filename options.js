// Options page — configure the MeTube instance URL.

const input = document.getElementById("instance");
const status = document.getElementById("status");

// Load any saved value.
browser.storage.local.get("instanceUrl").then(({ instanceUrl }) => {
  if (instanceUrl) input.value = instanceUrl;
});

function setStatus(text, cls) {
  status.textContent = text;
  status.className = cls || "";
}

document.getElementById("save").addEventListener("click", async () => {
  const raw = input.value.trim();
  if (!raw) {
    setStatus("Enter a URL.", "err");
    return;
  }

  let parsed;
  try {
    parsed = new URL(raw);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("must be http(s)");
  } catch {
    setStatus("Not a valid http(s) URL.", "err");
    return;
  }

  // Ask for permission to reach this host (from the Save user gesture).
  const origin = `${parsed.protocol}//${parsed.host}/*`;
  let granted;
  try {
    granted = await browser.permissions.request({ origins: [origin] });
  } catch (err) {
    setStatus(String(err), "err");
    return;
  }
  if (!granted) {
    setStatus("Permission denied — can't reach that host.", "err");
    return;
  }

  const instanceUrl = raw.replace(/\/+$/, "");
  await browser.storage.local.set({ instanceUrl });
  setStatus("Saved ✓", "ok");
});
