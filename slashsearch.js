(function() {
  var hotKey = 191, metaKeys = [];
  var setKeys = function(object) {
    if (object.hotKey) {
      hotKey = parseInt(object.hotKey);
    }
    if (object.metaKeys && object.metaKeys != '') {
      metaKeys = object.metaKeys.split(';');      
    } else {
      metaKeys = [];
    }
  }

  chrome.extension.sendRequest({method: 'getKeys'}, setKeys);
  chrome.extension.onRequest.addListener(function(request, requester, sendResponse) {
    switch (request.method) {
      case 'setKeys':
        setKeys(request);
      break;
    }
    sendResponse({});
  });

  var focusOnSelector = function(selector) {
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
      var inputs = document.querySelectorAll(selector);
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
  };

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
        if (!focusOnSelector('input[type=search], input[name=q], input[type=qs], input[type=text]')) {
          var cover = document.getElementById('slashSearch');
          var input = document.getElementById('slashSearchInput');
          if (!cover) {
            cover = document.createElement('div');
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
                  var params = {method: 'performSearch', term: 'site:' + window.location.origin + ' ' + input.value};
                  // chrome.extension.sendRequest(params, function(response) {});
                  window.location = 'http://www.google.com/search?sourceid=slashsearch&ie=UTF-8&q=' + encodeURIComponent(params.term);
                }
              }
            });
            document.body.appendChild(cover);
          }
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
})();
