chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadJson') {
    console.log("Background: Received download request", message);
    if (!message.content || !message.filename) {
        console.error("Background: Missing content or filename for download.");
        sendResponse({ status: "error", message: "Missing content or filename." });
        return true; // Indicate async response
    }

    try {
      const blob = new Blob([message.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: message.filename,
        saveAs: true // Prompt user for save location
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error(`Background: Download failed: ${chrome.runtime.lastError.message}`);
          // Revoke URL in case of error during download initiation
          URL.revokeObjectURL(url);
          sendResponse({ status: "error", message: chrome.runtime.lastError.message });
        } else {
          console.log(`Background: Download started with ID: ${downloadId}`);
          // Note: We cannot reliably revoke the object URL here immediately
          // because the download might still be in progress.
          // Chrome typically handles revocation automatically after download completes or fails.
          // However, keeping it for a short period is generally safe.
          // Consider using chrome.downloads.onChanged to revoke later if needed, but it adds complexity.
          sendResponse({ status: "success", downloadId: downloadId });
        }
      });
    } catch (e) {
        console.error("Background: Error creating blob or initiating download:", e);
        sendResponse({ status: "error", message: "Failed to create blob or initiate download." });
    }

    return true; // Indicate that sendResponse will be called asynchronously
  }
});

// Optional: Add listener for extension installation/update for setup tasks
chrome.runtime.onInstalled.addListener(() => {
  console.log('JSON Beautifier extension installed.');
}); 