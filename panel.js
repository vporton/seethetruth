var myWindowId;
const contentBox = document.querySelector("#content");

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

/*
Update the sidebar's content.
1) Get the active tab in this sidebar's window.
2) Get its stored content.
3) Put it in the content box.
*/
function updateContent() {
  // chrome.tabs.query({windowId: myWindowId, active: true})
  //   // .then((tabs) => {
  //   //   return browser.storage.local.get(tabs[0].url);
  //   // })
  //   .then((tabs) => {
      const url = window.myParentUrl;
      fetch("https://api.everipedia.org/v2/wiki/slug/lang_en/" + encodeURIComponent(url))
        .then(async html => {
          if(html.status == 200) {
            contentBox.innerHTML = toHtml((await html.json()).page_body);
          } else {
            contentBox.innerHTML = "There is no information about this page.";
          }
        })
        .catch((e) => {
          console.log(e)
          contentBox.innerHTML = "There is no information about this page.";
        });
    // });
}

updateContent();

/*
Update content when a new tab becomes active.
*/
// chrome.tabs.onActivated.addListener(updateContent);

/*
Update content when a new page is loaded into a tab.
*/
// chrome.tabs.onUpdated.addListener(updateContent);

/*
When the sidebar loads, get the ID of its window,
and update its content.
*/
// chrome.windows.getCurrent({populate: true}).then((windowInfo) => {
//   myWindowId = windowInfo.id;
//   updateContent();
// });
