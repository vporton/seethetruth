chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.sendMessage(tab.id, "toggle");
  return true;
});


// let browser = /*browser ||*/ chrome;

// browser.sidebarAction.setPanel({panel: 'sidebar.html'});
// browser.browserAction.onClicked.addListener(() => {
//   browser.sidebarAction.open();
// });
// browser.browserAction.onClicked.addListener(() => {
//     browser.sidebarAction.close();
// });
