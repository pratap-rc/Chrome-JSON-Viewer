# JSON Beautifier Chrome Extension

This extension automatically detects and beautifies JSON content displayed in your browser tabs. It replaces the raw JSON view with a formatted, readable version with syntax highlighting and provides a button to download the beautified JSON.

## Features

*   **Automatic JSON Detection:** Detects JSON content within `<pre>` tags or when the page body primarily contains JSON text.
*   **Beautification:** Formats the detected JSON with standard indentation (2 spaces) and syntax highlighting.
*   **Clean Display:** Replaces the original page content with a clean, styled view of the beautified JSON.
*   **Toggle View:** Switch between the beautified view and the original raw JSON view.
*   **Download:** Add a button to download the beautified JSON content as a `.json` file.

## Installation / Loading

Since this extension is not yet published on the Chrome Web Store, you need to load it manually in Developer Mode:

1.  **Download or Clone:** Make sure you have the extension files in a local directory.
2.  **Open Chrome Extensions:** Open Google Chrome, type `chrome://extensions` in the address bar, and press Enter.
3.  **Enable Developer Mode:** In the top-right corner of the Extensions page, toggle the "Developer mode" switch ON.
4.  **Load Unpacked:** Click the "Load unpacked" button that appears.
5.  **Select Directory:** Navigate to the directory where you saved the extension files (the directory containing `manifest.json`) and click "Select".

6.  The "JSON Beautifier" extension should now appear in your list of extensions and be active.

## How to Use

1.  Navigate to a web page that displays raw JSON data (e.g., an API endpoint response).
2.  If the extension successfully detects valid JSON, the page content will be automatically replaced with the syntax-highlighted beautified version.
3.  Use the "View Raw JSON" button to toggle back to the original unformatted view.
4.  Click the "Download JSON" button to download the beautified content as a `beautified.json` file.

## Files

*   `manifest.json`: Defines the extension's configuration, permissions, and scripts.
*   `content_scripts/content.js`: The script injected into web pages to detect, beautify, and display JSON.
*   `content_scripts/style.css`: Styles applied to the beautified JSON output and buttons.
*   `background.js`: The service worker that handles the download functionality.
*   `icons/`: Contains placeholder icons for the extension (icon16.png, icon48.png, icon128.png). **Remember to replace these with actual icon images.** 