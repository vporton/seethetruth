function doLoadSidebar() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    const tab = tabs[0];
    if(!window.browser) {
      // Message to content script
      chrome.tabs.sendMessage(tab.id, {kind: "toggle", url: tab.url});
    } else {
      // Message to sidebar document
      browser.runtime.sendMessage({url: tab.url});
    }
  });
}

if(window.browser) {
  browser.sidebarAction.setPanel({panel: 'sidebar.html'});

  chrome.tabs.onActivated.addListener(doLoadSidebar);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if(changeInfo.status === 'loading' && changeInfo.url !== undefined) doLoadSidebar();
  });

  browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.toggle();
    return true;
  });
} else {
  chrome.browserAction.onClicked.addListener(function(tab){
    doLoadSidebar();
    return true;
  });
}
