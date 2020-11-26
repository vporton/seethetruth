chrome.browserAction.onClicked.addListener(function(tab){
  // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tab.id, {kind: "toggle", url: tab.url}); // FIXME: tabs -> runtime
  // });
  return true;
});

if(window.browser) {
  browser.sidebarAction.setPanel({panel: 'sidebar.html'});
  browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.toggle();
  });
}
