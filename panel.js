var myWindowId;
const contentBox = document.querySelector("#content");
const editList = document.querySelector("#editList");

function safe_tags(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function safe_attrs(str) {
  return safe_tags(str).replace(/"/g,'&quot;').replace(/'<'/g,'&apos;');
}

function _processText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/\[\[LINK\|([^|]*)\|([^|]*)\|([^|]*)\]\]/g, "<a target='_blank' href='https://everipedia.org/wiki/$1/$2'>$3</a>")
    .replace(/\[\[CITE\|([^|]*)\|([^|]*)\]\]/g, "<a target='_blank' href='$2'>[$1]</a>");
}

function _toHtmlItem(j) {
  if(j.type === 'sentence') {
    return _processText(j.text);
  } else if(j.type === 'text') {
    return j.content.map(c => _toHtmlItem(c)).join('');
  } else if(j.type === 'tag' || j.type === 'list_item' || j.type === 'dl' || j.type === 'samp' || j.tag_type !== undefined
    || j.rows !== undefined || j.cells !== undefined)
  {
    const attrs = j.attrs !== undefined
      ? " " + Object.entries(j.attrs)
        .map(x => `${x[0].replace(/^className$/, 'class')}=${x[0] === 'href' ? x[1].replace(/^\//, "https://everipedia.org/") : x[0] == 'style' ? Object.entries(x[0]).map(y => `${y[0]}='${safe_attrs(y[1])}'`) : safe_attrs(`'${x[1]}'`)}`)
        .join(' ')
      : "";
    const tag_type = j.tag_type !== undefined ? j.tag_type : j.type;
    if(tag_type === 'table') {
      return _toHtmlItem(j.items[0].thead) + _toHtmlItem(j.items[0].tbody) + _toHtmlItem(j.items[0].tfoot);
    }
    return (j.content || j.items || j.rows || j.cells)
      ? `<${tag_type}${attrs}>${(j.content ? j.content : j.items ? j.items : j.rows ? j.rows : j.cells).map(c =>   _toHtmlItem(c)).join('')}</${tag_type}>`
      : j.sentences
      ? `<${tag_type}${attrs}>${j.sentences.map(c => _processText(c.text)).join('')}</${tag_type}>`
      : `<${tag_type}${attrs}/>`;
  } else {
    return "";
  }
}

function toHtml(j) {
  let result = "";
  for(a of j) {
    for(b of a.paragraphs) {
      result += `<${safe_tags(b.tag_type)}>`;
      if(b.tag_type === 'table') {
        result += _toHtmlItem(b);
      } else {
        for(item of b.items) {
          result += _toHtmlItem(item);
        }
      }
      result += `</${safe_tags(b.tag_type)}>`;
    }
  }
  return result;
}

function _newPagePopup(url) {
  browser.tabs.query({windowId: myWindowId, active: true})
    .then((tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {kind: "askCreate", url});
    });
}

function _addUrl(url) {
  editList.innerHTML +=
    `<li><a target="_blank" href="#">${safe_tags(url)}</a></li>`;

  if(contentBox.innerHTML === '') return;
}

function _buildUrlsList(url) {
  let list = [];
  if(url !== undefined) {
    list.push(url);
    let url2 = url.replace(/\?.*/, '');
    if(url2 !== url) list.push(url2);
    for(;;) {
      const url3 = url2.replace(/([^\/]+|[^\/]*\/)$/, '');
      try {
        new URL(url3);
      }
      catch(_) {
        break;
      }
      if(url3 !== url2) {
        list.push(url3);
      } else {
        break;
      }
      url2 = url3;
    }
  }
  return list;
}

// TODO: Duplicate code.
function pageName(url) {
  return encodeURIComponent(url).replace(/\//g, '%2F');
}

async function updateContentByUrl(url) {
  editList.innerHTML = '';
  contentBox.innerHTML = '';
  const urls = _buildUrlsList(url);

  const doFetch = function(i) {
    const encoded = pageName(urls[i]);

    return fetch("https://api.everipedia.org/v2/wiki/slug/lang_en/" + encoded)
      .then(async html => {
        if(html.status == 200) {
          contentBox.innerHTML = toHtml((await html.json()).page_body);
          return true;
        } else {
          return false;
        }
      })
      .catch(e => {
        if(i !== 0) {
          return doFetch(urls[i-1]);
        }
        return false;
      });
  }

  const fetchResult = await doFetch(0);
  if(fetchResult) {
    const everipediaUrl = "https://everipedia.org/wiki/lang_en/" + encoded;
    editList.innerHTML += `<li><a target="_blank" href="${safe_attrs(everipediaUrl)}">${safe_tags(url)}</a></li>`;
  } else {
    for(suburl of urls) _addUrl(suburl);
    // preventDefault is broken if done earlier // FIXME: Bug if clicked before preventDefault() is added.
    for(let i = 0; i < urls.length; ++i) {
      editList.childNodes[i].firstChild.onclick = event => { event.preventDefault(); _newPagePopup(urls[i]); };
    }

    contentBox.innerHTML = "There is no information about this page.";
  }
}

/*
Update the sidebar's content.
1) Get the active tab in this sidebar's window.
2) Get its stored content.
3) Put it in the content box.
*/
async function updateContent() {
  if(window.browser) {
    browser.tabs.query({windowId: myWindowId, active: true})
      // .then((tabs) => {
      //   return browser.storage.local.get(tabs[0].url);
      // })
      .then(async (tabs) => {
        const url = tabs[0].url;
        if(!/^(about|file):/.test(url)) {
          await updateContentByUrl(url);
        } else {
          editList.innerHTML = '';
          contentBox.innerHTML = '';
        }
      });
  } else {
    await updateContentByUrl(window.myParentUrl);
  }
}

if(!window.browser) {
  const url = decodeURIComponent(window.location.href.match(/\burl=([^&;]*)/)[1]);
  document.addEventListener('load', async () => {
    await updateContentByUrl(url);
  });
}

if(window.browser) {
  browser.windows.getCurrent({populate: true}).then(async (windowInfo) => {
    myWindowId = windowInfo.id;
    await updateContent();
  });
}

async function handleMessage(request, sender, sendResponse) {
  await updateContentByUrl(request.url);
}

browser.runtime.onMessage.addListener(handleMessage);