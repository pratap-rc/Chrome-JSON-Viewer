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

  // Detect system color scheme preference (dark or light mode)
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set colors based on system preference
  const colors = {
    background: prefersDarkMode ? '#1e1e1e' : '#f8f9fa',
    text: prefersDarkMode ? '#e0e0e0' : '#333333',
    keyColor: prefersDarkMode ? '#9cdcfe' : '#007bff',
    stringColor: prefersDarkMode ? '#ce9178' : '#28a745',
    numberColor: prefersDarkMode ? '#b5cea8' : '#fd7e14',
    booleanColor: prefersDarkMode ? '#569cd6' : '#dc3545',
    nullColor: prefersDarkMode ? '#8f8f8f' : '#6c757d',
    buttonBg: prefersDarkMode ? '#0e639c' : '#007bff',
    buttonHoverBg: prefersDarkMode ? '#1177bb' : '#0056b3',
    toggleButtonBg: prefersDarkMode ? '#4d4d4d' : '#6c757d',
    toggleButtonHoverBg: prefersDarkMode ? '#646464' : '#5a6268',
    arrowColor: prefersDarkMode ? '#9cdcfe' : '#007bff'
  };

  // Create elements for the prettified display
  const container = document.createElement('div');
  container.id = 'json-beautifier-container';
  container.style.fontFamily = 'monospace';
  container.style.padding = '20px';
  container.style.backgroundColor = colors.background;
  container.style.color = colors.text;
  container.style.position = 'relative';
  container.style.margin = '0';
  container.style.border = 'none';
  container.style.borderRadius = '0';
  container.style.minHeight = '100vh';
  container.style.boxSizing = 'border-box';

  // Create button container for controls
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'json-beautifier-buttons';
  buttonContainer.style.position = 'fixed';
  buttonContainer.style.top = '10px';
  buttonContainer.style.right = '10px';
  buttonContainer.style.zIndex = '9999';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'row';
  buttonContainer.style.gap = '10px';
  buttonContainer.style.flexWrap = 'nowrap';
  buttonContainer.style.alignItems = 'center';

  // Create download button
  const downloadButton = document.createElement('button');
  downloadButton.id = 'json-beautifier-download';
  downloadButton.textContent = 'Download JSON';
  
  // Apply inline styles for the button
  downloadButton.style.padding = '8px 12px';
  downloadButton.style.backgroundColor = colors.buttonBg;
  downloadButton.style.color = '#fff';
  downloadButton.style.border = 'none';
  downloadButton.style.borderRadius = '4px';
  downloadButton.style.fontWeight = 'bold';
  downloadButton.style.cursor = 'pointer';
  downloadButton.style.boxShadow = prefersDarkMode ? '0 2px 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.2)';
  downloadButton.style.transition = 'background-color 0.2s ease, transform 0.1s ease';
  downloadButton.style.whiteSpace = 'nowrap';

  // Add hover effect
  downloadButton.addEventListener('mouseover', () => {
    downloadButton.style.backgroundColor = colors.buttonHoverBg;
    downloadButton.style.transform = 'translateY(-1px)';
  });

  downloadButton.addEventListener('mouseout', () => {
    downloadButton.style.backgroundColor = colors.buttonBg;
    downloadButton.style.transform = 'translateY(0)';
  });

  // Function to create a collapsible JSON tree
  function createCollapsibleJSON(obj, isRoot = true) {
    const container = document.createElement('div');
    container.className = 'json-beautifier-item';
    
    if (obj === null) {
      container.innerHTML = `<span class="json-null" style="color: ${colors.nullColor}; font-style: italic;">null</span>`;
      return container;
    }
    
    if (typeof obj !== 'object') {
      let value = obj;
      let className = 'json-string';
      let style = `color: ${colors.stringColor};`;
      
      if (typeof obj === 'number') {
        className = 'json-number';
        style = `color: ${colors.numberColor};`;
      } else if (typeof obj === 'boolean') {
        className = 'json-boolean';
        style = `color: ${colors.booleanColor}; font-weight: bold;`;
        value = obj ? 'true' : 'false';
      } else {
        // It's a string, escape it
        value = `"${obj.toString().replace(/"/g, '\\"').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"`;
      }
      
      container.innerHTML = `<span class="${className}" style="${style}">${value}</span>`;
      return container;
    }
    
    const isArray = Array.isArray(obj);
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';
    const itemsCount = Object.keys(obj).length;
    
    // Create the collapsible header
    const header = document.createElement('div');
    header.className = 'json-beautifier-collapsible';
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';
    header.style.borderRadius = '3px';
    
    // Create the arrow toggle
    const toggle = document.createElement('span');
    toggle.className = 'json-beautifier-toggle';
    toggle.innerHTML = '&#9660;'; // Down arrow
    toggle.style.display = 'inline-block';
    toggle.style.width = '15px';
    toggle.style.textAlign = 'center';
    toggle.style.color = colors.arrowColor;
    toggle.style.transform = 'rotate(0deg)';
    toggle.style.transition = 'transform 0.15s ease';
    
    // Create header content with type and count
    const headerContent = document.createElement('span');
    const countText = itemsCount > 0 ? ` <span class="json-beautifier-count" style="color: ${prefersDarkMode ? '#8f8f8f' : '#6c757d'}; font-size: 0.85em;">(${itemsCount} item${itemsCount !== 1 ? 's' : ''})</span>` : '';
    headerContent.innerHTML = `${bracketOpen}${countText}`;
    
    header.appendChild(toggle);
    header.appendChild(headerContent);
    container.appendChild(header);
    
    // Create content container for child elements
    const content = document.createElement('div');
    content.className = 'json-beautifier-content';
    content.style.marginLeft = '20px';
    content.style.display = 'block'; // Start expanded
    
    let index = 0;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const isSimpleValue = value === null || typeof value !== 'object';
        
        const propertyContainer = document.createElement('div');
        propertyContainer.className = 'json-beautifier-property';
        propertyContainer.style.margin = '2px 0';
        
        // For simple values, use inline display (same line)
        if (isSimpleValue) {
          propertyContainer.style.display = 'flex';
          propertyContainer.style.flexWrap = 'nowrap';
          propertyContainer.style.alignItems = 'flex-start';
        }
        
        if (isArray) {
          // For arrays, show the index
          const indexSpan = document.createElement('span');
          indexSpan.className = 'json-index';
          indexSpan.style.color = prefersDarkMode ? '#8f8f8f' : '#6c757d';
          indexSpan.style.fontSize = '0.85em';
          indexSpan.textContent = `${index}: `;
          propertyContainer.appendChild(indexSpan);
        } else {
          // For objects, show the key
          const keySpan = document.createElement('span');
          keySpan.className = 'json-key';
          keySpan.style.color = colors.keyColor;
          keySpan.style.fontWeight = 'bold';
          keySpan.textContent = `"${key}": `;
          propertyContainer.appendChild(keySpan);
        }
        
        // Recursively create child content
        const valueElement = createCollapsibleJSON(value, false);
        propertyContainer.appendChild(valueElement);
        
        // Add comma if not the last item
        if (index < itemsCount - 1) {
          const commaSpan = document.createElement('span');
          commaSpan.textContent = ',';
          propertyContainer.appendChild(commaSpan);
        }
        
        content.appendChild(propertyContainer);
        index++;
      }
    }
    
    // Add closing bracket
    const closingElement = document.createElement('span');
    closingElement.textContent = bracketClose;
    container.appendChild(content);
    container.appendChild(closingElement);
    
    // Add toggle functionality
    header.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      
      if (content.style.display === 'none') {
        // Expand
        content.style.display = 'block';
        toggle.style.transform = 'rotate(0deg)';
        toggle.innerHTML = '&#9660;'; // Down arrow
      } else {
        // Collapse
        content.style.display = 'none';
        toggle.style.transform = 'rotate(-90deg)';
        toggle.innerHTML = '&#9660;'; // Down arrow (will appear as right arrow when rotated)
      }
    });
    
    // Add hover effect to collapsible header
    header.addEventListener('mouseover', () => {
      header.style.backgroundColor = prefersDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    });
    
    header.addEventListener('mouseout', () => {
      header.style.backgroundColor = 'transparent';
    });
    
    return container;
  }

  // Create output container
  const outputElement = document.createElement('div');
  outputElement.id = 'json-beautifier-output';
  outputElement.style.margin = '0';
  outputElement.style.padding = '0';
  outputElement.style.backgroundColor = 'transparent';
  outputElement.style.overflow = 'auto';
  outputElement.style.wordWrap = 'break-word';
  outputElement.style.lineHeight = '1.5';
  outputElement.style.color = colors.text;

  // Create the collapsible JSON tree
  const jsonTree = createCollapsibleJSON(jsonData);
  outputElement.appendChild(jsonTree);

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
  toggleButton.style.backgroundColor = colors.toggleButtonBg;
  toggleButton.style.color = '#fff';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.fontWeight = 'bold';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.boxShadow = prefersDarkMode ? '0 2px 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.2)';
  toggleButton.style.transition = 'background-color 0.2s ease, transform 0.1s ease';
  toggleButton.style.whiteSpace = 'nowrap';

  // Add hover effect for toggle button
  toggleButton.addEventListener('mouseover', () => {
    toggleButton.style.backgroundColor = colors.toggleButtonHoverBg;
    toggleButton.style.transform = 'translateY(-1px)';
  });

  toggleButton.addEventListener('mouseout', () => {
    toggleButton.style.backgroundColor = colors.toggleButtonBg;
    toggleButton.style.transform = 'translateY(0)';
  });

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
      container.appendChild(outputElement);
      document.body.appendChild(buttonContainer);
      toggleButton.textContent = 'View Raw JSON';
      isBeautified = true;
    }
  });

  // Add theme change listener to adapt colors when system theme changes
  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', () => {
      // Refresh the page to apply new theme
      window.location.reload();
    });
  }

  // Add buttons to the button container
  buttonContainer.appendChild(downloadButton);
  buttonContainer.appendChild(toggleButton);

  // Clear existing content and add our beautified display
  document.body.innerHTML = '';
  container.appendChild(outputElement);
  document.body.appendChild(container);
  document.body.appendChild(buttonContainer);
})(); 