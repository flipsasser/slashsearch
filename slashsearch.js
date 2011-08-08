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
  focusOnSelector: function(selector) {
    var focused = false;
    // We split instead of using querySelectorAll's support for comma-separated items
    // because we favor certain conditions over others. For example, if a type=search
    // appears AFTER name=q in the DOM, it will be ignored unless we search FIRST for
    // type=search and then, if we've found nothing, name=q, and so forth and so on
    // down the line.
    var selectors = selector.split(',');
    for (var i = 0; i < selectors.length; i++) {
      if (focused) {
        break;
      }
      var inputs = document.querySelectorAll(selectors[i]);
      if (inputs.length > 0) {
        for (var x = 0; x < inputs.length; x++) {
          var input = inputs[x];
          // Visible elements...
          if (input.offsetHeight != 0 && input.offsetWidth != 0) {
            input.focus();
            input.select();
            focused = true;
            break;
          }
        }
      }
    }
    return focused;
  },
  listen: function() {
    var blockKeyRepeat;
    document.addEventListener('keydown', function(event) {
      if (blockKeyRepeat) {
        event.preventDefault();      
      } else {
        var metaKeysMatch = true;
        for (var i = 0; i < metaKeys.length; i++) {
          metaKeysMatch = metaKeysMatch && event[metaKeys[i] + 'Key'];
        }
        if (event.keyCode == hotKey && metaKeysMatch && event.target.tagName.toLowerCase()  != 'input' && event.target.tagName.toLowerCase()  != 'textarea' && event.target.tagName.toLowerCase() != 'select') {
          event.preventDefault();
          blockKeyRepeat = true;
          if (!SlashSearch.focusOnSelector('input[type=search], input[name=q], input[type=qs], input[type=text]')) {
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
    });
    document.addEventListener('keyup', function(event) {
      blockKeyRepeat = false;
    });
  },
  performSearch: function(search) {
    var searchTerm = encodeURIComponent('site:' + search.origin + ' ' + search.term);
    window.location = 'http://www.google.com/search?sourceid=slashsearch&ie=UTF-8&q=' + searchTerm;
  },
  setKeys: function(object) {
    if (object.hotKey) {
      this.hotKey = parseInt(object.hotKey);
    }
    if (object.metaKeys && object.metaKeys != '') {
      this.metaKeys = object.metaKeys.split(';');      
    } else {
      this.metaKeys = [];
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

SlashSearch.listen();
SlashSearch.configure();
