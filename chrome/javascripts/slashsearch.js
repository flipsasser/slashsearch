var SlashSearch = {
  hotKey: 191,
  metaKeys: [],
  configure: function() {
    chrome.extension.sendRequest({method: 'getKeys'}, this.setKeys);
    chrome.extension.onRequest.addListener(function(request, requester, sendResponse) {
      if (SlashSearch[request.method]) {
        SlashSearch[request.method].call(this, request);
      }
      sendResponse({});
    });
  },
  documents: [],
  focusOnSelector: function(doc, selector) {
    // We split instead of using querySelectorAll's support for comma-separated items
    // because we favor certain conditions over others. For example, if a type=search
    // appears AFTER name=q in the DOM, it will be ignored unless we search FIRST for
    // type=search and then, if we've found nothing, name=q, and so forth and so on
    // down the line.
    var selectors = selector.split(',');
    for (var i = 0; i < selectors.length; i++) {
      var inputs = doc.querySelectorAll(selectors[i]), bodyWidth = document.body.offsetWidth;
      inputLoop: for (var x = 0; x < inputs.length; x++) {
        var input = inputs[x];
        // Visible elements...
        if (input.offsetHeight != 0 && input.offsetWidth != 0 && input.style.display != 'none' && input.style.visibility != 'hidden') {
          var parent = input;
          var left = top = 0;
          while (parent.offsetParent) {
            left += parent.offsetLeft;
            top += parent.offsetTop;
            if (left < -(input.offsetWidth) || left > bodyWidth + parent.offsetWidth || top < -(input.offsetHeight)) {
              continue inputLoop;
            }
            parent = parent.offsetParent;
          }
          input.focus();
          input.select();
          return true;
        }
      }
    }
    return false;
  },
  listen: function(targetDocument) {
    this.documents.push(targetDocument);
    var blockKeyRepeat;
    targetDocument.addEventListener('keydown', function(event) {
      if (blockKeyRepeat) {
        event.preventDefault();      
      } else {
        var metaKeysMatch = true;
        var metaKeys = ['alt', 'ctrl', 'meta', 'shift'];
        for (var i = 0; i < metaKeys.length; i++) {
          if (SlashSearch.metaKeys.indexOf(metaKeys[i]) > -1) {
            metaKeysMatch = metaKeysMatch && event[metaKeys[i] + 'Key'];
          } else {
            metaKeysMatch = metaKeysMatch && !event[metaKeys[i] + 'Key'];
          }
        }
        var invalidTags = ['embed', 'input', 'object', 'textarea'];
        if (metaKeysMatch && event.keyCode == SlashSearch.hotKey && invalidTags.indexOf(event.target.tagName.toLowerCase()) == -1) {
          event.preventDefault();
          blockKeyRepeat = true;
          for (var d = 0; d < SlashSearch.documents.length; d++) {
            var doc = SlashSearch.documents[d];
            if (SlashSearch.focusOnSelector(doc, 'input[type=search], input:not([type]), input[name=q], input[type=qs], input[type=text]')) {
              return;
            } else {
              var cover = document.getElementById('slashSearch');
              if (!cover) {
                cover = SlashSearch.setupCover();
              }
              var input = document.getElementById('slashSearchInput');
              input.value = '';
              cover.style.display = '';
              input.focus();
            }
          }
        }
      }
    });
    targetDocument.addEventListener('keyup', function(event) {
      blockKeyRepeat = false;
    });
  },
  performSearch: function(search) {
    var searchTerm = encodeURIComponent('site:' + search.origin + ' ' + search.term);
    window.location = 'http://www.google.com/search?sourceid=slashsearch&ie=UTF-8&q=' + searchTerm;
  },
  setKeys: function(object) {
    if (object.hotKey) {
      SlashSearch.hotKey = parseInt(object.hotKey);
    }
    if (object.metaKeys && object.metaKeys != '') {
      SlashSearch.metaKeys = object.metaKeys.split(';');      
    } else {
      SlashSearch.metaKeys = [];
    }
  },
  setupCover: function() {
    var cover = document.createElement('div');
    cover.id = 'slashSearch';
    var searchContainer = document.createElement('div');
    searchContainer.id = 'slashSearchContainer';
    cover.appendChild(searchContainer);
    input = document.createElement('input');
    input.id = 'slashSearchInput';
    input.type = 'text';
    input.name = 'slashSearch';
    searchContainer.appendChild(input);
    input.addEventListener('blur', function(event) {
      cover.style.display = 'none';
    });
    input.addEventListener('keyup', function(event) {
      if (event.keyCode == 27) {
        input.blur();
      } else if (event.keyCode == 13 || event.keyCode == 14) {
        input.blur();
        if (input.value.replace(/\s+/, '') != '') {
          SlashSearch.performSearch({origin: window.location.origin, term: input.value});
        }
      }
    });
    document.body.appendChild(cover);
    return cover;
  }
};

SlashSearch.listen(document);
SlashSearch.configure();

document.addEventListener('DOMContentLoaded', function() {
  var frames = document.querySelectorAll('frameset > frame')
  for (var i = 0; i < frames.length; i++) {
    var frame = frames[i];
    frame.addEventListener('load', function(event) {
      SlashSearch.listen(this.contentDocument);
    });
  }
});
