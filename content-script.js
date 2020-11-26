chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.kind == "toggle") {
        toggle(request.url);
    } else if(request.kind == "askCreate") {
        alert(request.url);
    }
})

if(!window.browser) {
    let iframe = document.createElement('iframe'); 
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

function toggle(url){
    if(iframe.style.width == "0px"){
        iframe.style.width="400px";
        iframe.src = chrome.runtime.getURL("sidebar.html?url=") + encodeURIComponent(url)
    }
    else{
        iframe.style.width="0px";
    }
}
