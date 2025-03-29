(() => {
  // Detect JSON in the page content
  let jsonData;
  let beautifiedJson;
  let sourceText = '';

  // First try to find pre-formatted JSON (common in browsers' JSON viewers)
  const preElement = document.body.querySelector('pre');
  if (preElement && preElement.textContent) {
    sourceText = preElement.textContent.trim();
  } else {
    // If no pre element with content, check if the entire body contains JSON
    // This could be the case for direct API responses
    sourceText = document.body.textContent.trim();
  }

  // Don't process if no text found
  if (!sourceText) {
    return;
  }

  // Check if the text looks like JSON (starts/ends with {} or [])
  if (!((sourceText.startsWith('{') && sourceText.endsWith('}')) || 
        (sourceText.startsWith('[') && sourceText.endsWith(']')))) {
    return;
  }

  // Try to parse the JSON
  try {
    jsonData = JSON.parse(sourceText);
    
    // Verify it's a non-null object or an array
    if (typeof jsonData !== 'object' || jsonData === null) {
      return;
    }
    
    // Beautify the JSON
    beautifiedJson = JSON.stringify(jsonData, null, 2);
    
    // Log successful detection
    console.log("JSON Beautifier: Valid JSON detected, size: ", beautifiedJson.length);
  } catch (error) {
    console.debug("JSON Beautifier: Failed to parse JSON", error);
    return;
  }

  // Check if our beautifier has already been applied
  if (document.getElementById('json-beautifier-container')) {
    return;
  }

  // Create elements for the prettified display
  const container = document.createElement('div');
  container.id = 'json-beautifier-container';
  container.style.fontFamily = 'monospace';
  container.style.padding = '20px';
  container.style.backgroundColor = '#f8f9fa';
  container.style.position = 'relative';
  container.style.margin = '0';
  container.style.border = 'none';
  container.style.borderRadius = '0';
  container.style.minHeight = '100vh';
  container.style.boxSizing = 'border-box';

  // Create button container for controls
  const buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'fixed';
  buttonContainer.style.top = '10px';
  buttonContainer.style.right = '10px';
  buttonContainer.style.zIndex = '9999';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';

  // Create download button
  const downloadButton = document.createElement('button');
  downloadButton.id = 'json-beautifier-download';
  downloadButton.textContent = 'Download JSON';
  
  // Apply inline styles for the button
  downloadButton.style.padding = '8px 12px';
  downloadButton.style.backgroundColor = '#007bff';
  downloadButton.style.color = '#fff';
  downloadButton.style.border = 'none';
  downloadButton.style.borderRadius = '4px';
  downloadButton.style.fontWeight = 'bold';
  downloadButton.style.cursor = 'pointer';
  downloadButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  // Create the display for beautified JSON
  const pre = document.createElement('pre');
  pre.id = 'json-beautifier-output';
  pre.style.margin = '0';
  pre.style.padding = '0';
  pre.style.backgroundColor = 'transparent';
  pre.style.overflow = 'auto';
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.wordWrap = 'break-word';
  pre.style.lineHeight = '1.5';

  // Function to syntax highlight the JSON
  function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  // Apply syntax highlighting
  pre.innerHTML = syntaxHighlight(beautifiedJson);

  // Add download functionality to button
  downloadButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Create a download directly in the content script
    try {
      const blob = new Blob([beautifiedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'beautified.json';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log("JSON Beautifier: Download initiated directly");
    } catch (directError) {
      console.error("JSON Beautifier: Failed direct download:", directError);
      
      // Fall back to background script
      try {
        chrome.runtime.sendMessage({
          action: 'downloadJson',
          content: beautifiedJson,
          filename: 'beautified.json'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('JSON Beautifier: Error sending message:', chrome.runtime.lastError.message);
            alert(`JSON Beautifier Error: ${chrome.runtime.lastError.message}`);
          } else if (response && response.status === 'error') {
            console.error('JSON Beautifier: Download failed:', response.message);
            alert(`JSON Beautifier Error: ${response.message}`);
          }
        });
      } catch (msgError) {
        console.error("JSON Beautifier: Failed to send message:", msgError);
        alert(`JSON Beautifier Error: Could not download the JSON. Please check console for details.`);
      }
    }
  });

  // Create toggle button to switch between raw and beautified views
  const toggleButton = document.createElement('button');
  toggleButton.id = 'json-beautifier-toggle';
  toggleButton.textContent = 'View Raw JSON';
  toggleButton.style.padding = '8px 12px';
  toggleButton.style.backgroundColor = '#6c757d';
  toggleButton.style.color = '#fff';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.fontWeight = 'bold';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

  // Store original page content for toggling
  const originalContent = document.body.innerHTML;
  let isBeautified = true;

  // Add functionality to toggle button
  toggleButton.addEventListener('click', () => {
    if (isBeautified) {
      // Switch to original view
      document.body.innerHTML = originalContent;
      
      // We need to re-add our buttons when switching back to original view
      document.body.appendChild(buttonContainer);
      toggleButton.textContent = 'View Beautified JSON';
      isBeautified = false;
    } else {
      // Switch to beautified view
      document.body.innerHTML = '';
      document.body.appendChild(container);
      container.appendChild(pre);
      document.body.appendChild(buttonContainer);
      toggleButton.textContent = 'View Raw JSON';
      isBeautified = true;
    }
  });

  // Add inline styles for syntax highlighting
  const style = document.createElement('style');
  style.textContent = `
    .json-key { color: #007bff; font-weight: bold; }
    .json-string { color: #28a745; }
    .json-number { color: #fd7e14; }
    .json-boolean { color: #dc3545; font-weight: bold; }
    .json-null { color: #6c757d; font-style: italic; }
  `;
  document.head.appendChild(style);

  // Add buttons to the button container
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(toggleButton);

  // Clear existing content and add our beautified display
  document.body.innerHTML = '';
  container.appendChild(pre);
  document.body.appendChild(container);
  document.body.appendChild(buttonContainer);
})(); 