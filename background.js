// Send to MeTube — background script
// Wraps the MeTube "add" bookmarklet in a right-click context menu, with a
// submenu for choosing download quality. The instance URL is configured on
// the options page and read from storage.

// Quality options offered in the submenu. `quality` is sent to MeTube's /add
// endpoint verbatim; `format` is sent only when set (audio needs it so MeTube
// extracts audio instead of muxing video).
const QUALITIES = [
  { id: "best",  title: "Best",        quality: "best" },
  { id: "1080",  title: "1080p",       quality: "1080" },
  { id: "720",   title: "720p",        quality: "720" },
  { id: "480",   title: "480p",        quality: "480" },
  { id: "audio", title: "Audio only",  quality: "audio", format: "mp3" }
];

const CONTEXTS = ["page", "link", "video", "audio"];
const CHILD_PREFIX = "metube-send:";

// Build the menu on install/reload, and open options if not yet configured.
browser.runtime.onInstalled.addListener(async () => {
  browser.contextMenus.create({
    id: "metube-send",
    title: "Send to MeTube",
    contexts: CONTEXTS
  });

  for (const q of QUALITIES) {
    browser.contextMenus.create({
      id: CHILD_PREFIX + q.id,
      parentId: "metube-send",
      title: q.title,
      contexts: CONTEXTS
    });
  }

  const { instanceUrl } = await browser.storage.local.get("instanceUrl");
  if (!instanceUrl) browser.runtime.openOptionsPage();
});

// Turn a configured base URL into the MeTube add endpoint.
function addEndpoint(instanceUrl) {
  return instanceUrl.replace(/\/+$/, "") + "/add";
}

// Pick the most specific URL available for whatever was clicked:
//   - right-click a link        -> that link's target
//   - right-click a video/audio -> the media's source
//   - right-click empty page    -> the page's own URL (matches the bookmarklet)
function urlForClick(info) {
  return info.linkUrl || info.srcUrl || info.pageUrl;
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (typeof info.menuItemId !== "string" || !info.menuItemId.startsWith(CHILD_PREFIX)) {
    return;
  }

  const choice = QUALITIES.find(q => CHILD_PREFIX + q.id === info.menuItemId);
  if (!choice) return;

  const { instanceUrl } = await browser.storage.local.get("instanceUrl");
  if (!instanceUrl) {
    notify("Send to MeTube", "No instance configured — opening options…");
    browser.runtime.openOptionsPage();
    return;
  }

  const url = urlForClick(info);
  if (!url) {
    notify("Send to MeTube failed", "Couldn't determine a URL for that click.");
    return;
  }

  const payload = { url, quality: choice.quality };
  if (choice.format) payload.format = choice.format;

  try {
    const resp = await fetch(addEndpoint(instanceUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      notify(`Sent to MeTube (${choice.title})`, url);
    } else {
      notify("Send to MeTube failed", `Server returned ${resp.status}.`);
    }
  } catch (err) {
    notify("Send to MeTube failed", String(err));
  }
});

function notify(title, message) {
  browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("icon.svg"),
    title,
    message
  });
}
