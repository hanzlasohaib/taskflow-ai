/**
 * MV3 service worker — reserved for session messaging / refresh hooks.
 * Popup talks to the API directly with the bearer token from chrome.storage.session.
 */
chrome.runtime.onInstalled.addListener(() => {
  // Intentionally empty for v1.
});
