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

function askCreate(url) {
    const html = `<html>
        <script>
        function copyToClipboard(str) {
            const el = document.createElement('textarea');
            el.value = str;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        </script>
        <p>Open <a href='https://everipedia.com'>Everipedia</a>, click "Create New Wiki" and enter
        <code>${safe_tags(pageName(url))}</code>
        (<a href="#" onclick="copyToClipboard('${safe_attrs(pageName(url))}'); return false;">Copy</a>)
        as the page name.`;

    let iframe = document.createElement('iframe'); 
    iframe.style.background = "pink";
    iframe.style.height = "50%";
    iframe.style.width = "50%";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = "9000000000000000001";
    iframe.frameBorder = "none";
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);

    document.body.appendChild(iframe);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.kind == "toggle") {
        toggle(request.url);
    } else if(request.kind == "askCreate") {
        askCreate(request.url);
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
