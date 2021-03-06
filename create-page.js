// TODO: Duplicate code.
function pageName(url) {
    return encodeURIComponent(url).replace(/\//g, '%2F');
  }
  
const url = decodeURIComponent(window.location.href.match(/\burl=([^&;]*)/)[1]);

window.addEventListener('load', () => {
    document.getElementById('code').innerText = pageName(url);
    document.getElementById('copy').onclick = copy;
    if(!window.browser) { // FIXME: Should work also on Firefox.
        document.getElementById('close').onclick = () => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {kind: "closeAskCreate", url});
            });
            return false;
        };
        document.getElementById('close').style.display = 'block';
    }
});

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

function copy() {
    copyToClipboard(pageName(url));
    return false;
}
