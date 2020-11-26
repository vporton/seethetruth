chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.kind == "toggle"){
        toggle(request.url);
    }
})

var iframe = document.createElement('iframe'); 
iframe.style.background = "lightgray";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.frameBorder = "none"; 
iframe.src = chrome.runtime.getURL("sidebar.html") // doesn't work in Firefox

document.body.appendChild(iframe);

function toggle(url){
    iframe.myParentUrl = url;
    if(iframe.style.width == "0px"){
        iframe.style.width="400px";
    }
    else{
        iframe.style.width="0px";
    }
}
