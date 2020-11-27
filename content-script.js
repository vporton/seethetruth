// TODO: Duplicate code
function safe_tags(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function safe_attrs(str) {
  return safe_tags(str).replace(/"/g,'&quot;').replace(/'<'/g,'&apos;');
}

// TODO: Duplicate code.
function pageName(url) {
    return encodeURIComponent(url).replace(/\//g, '%2F');
}

let askCreateIframe = null;

// FIXME: duplicate code
function askCreate(url) {
    askCreateIframe = document.createElement('iframe'); 
    askCreateIframe.style.background = "pink";
    askCreateIframe.style.height = "50%";
    askCreateIframe.style.width = "100%";
    askCreateIframe.style.position = "fixed";
    askCreateIframe.style.top = "0px";
    askCreateIframe.style.right = "0px";
    askCreateIframe.style.zIndex = "9000000000000000001";
    askCreateIframe.frameBorder = "none";
    askCreateIframe.src = chrome.runtime.getURL('create-page.html?url=' + encodeURIComponent(url));

    document.body.appendChild(askCreateIframe);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.kind == "toggle") {
        toggle(request.url);
    } else if(request.kind == "askCreate") {
        askCreate(request.url);
    } else if(request.kind == "closePanel") {
        iframe.style.width="0px";
    } else if(request.kind == "closeAskCreate") {
        askCreateIframe.parentNode.removeChild(askCreateIframe)
    }
})

let iframe = null;
if(!window.browser) {
    iframe = document.createElement('iframe'); 
    iframe.style.background = "lightgray";
    iframe.style.height = "100%";
    iframe.style.width = "0px";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = "9000000000000000000";
    iframe.frameBorder = "none"; 

    window.addEventListener('load', () => {
        document.body.appendChild(iframe);
    });
}

function toggle(url) {
    if(iframe.style.width == "0px"){
        iframe.style.width="400px";
        iframe.src = chrome.runtime.getURL("sidebar.html?url=") + encodeURIComponent(url)
    }
    else{
        iframe.style.width="0px";
    }
}
