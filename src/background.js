chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'galeria', title: chrome.i18n.getMessage('menuMyMaps'), contexts: ['action'] });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'galeria') chrome.tabs.create({ url: chrome.runtime.getURL('editor.html') });
});
