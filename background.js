browser.sidebarAction.setPanel({panel: 'sidebar.html'});
browser.browserAction.onClicked.addListener(() => {
  browser.sidebarAction.open();
});
browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.close();
});
