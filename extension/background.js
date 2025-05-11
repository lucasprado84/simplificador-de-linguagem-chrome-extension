// Store context menu items
let currentContextMenus = [];

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  // Load initial glossary
  fetch(chrome.runtime.getURL('glossary.json'))
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({ glossary: data });
    })
    .catch(console.error);
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'showContextMenu') {
    removeExistingContextMenus();
    createContextMenus(message.word, message.alternatives, message.elementId, sender.tab.id);
  }
});

// Create context menus for alternatives
function createContextMenus(word, alternatives, elementId, tabId) {
  // Create parent menu
  const parentId = chrome.contextMenus.create({
    id: 'simplificador',
    title: 'Simplificar linguagem',
    contexts: ['all']
  });

  // Add alternatives as sub-menus
  alternatives.forEach((alternative, index) => {
    const menuId = chrome.contextMenus.create({
      id: `alternative-${index}`,
      parentId: parentId,
      title: alternative,
      contexts: ['all']
    });
    currentContextMenus.push(menuId);
  });

  // Store context for click handler
  chrome.storage.local.set({
    currentContext: {
      word: word,
      elementId: elementId,
      tabId: tabId
    }
  });
}

// Remove existing context menus
function removeExistingContextMenus() {
  currentContextMenus.forEach(menuId => {
    chrome.contextMenus.remove(menuId);
  });
  currentContextMenus = [];
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('alternative-')) {
    chrome.storage.local.get('currentContext', data => {
      if (data.currentContext) {
        chrome.tabs.sendMessage(data.currentContext.tabId, {
          type: 'replaceWord',
          elementId: data.currentContext.elementId,
          replacement: info.menuItem.title
        });
      }
    });
  }
});

// Handle installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    // Create options page context menu
    chrome.contextMenus.create({
      id: 'options',
      title: 'Opções do Simplificador',
      contexts: ['action']
    });
  }
});

// Open options page when clicking extension menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'options') {
    chrome.runtime.openOptionsPage();
  }
});
