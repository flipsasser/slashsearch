(function() {
  var hotKey = 191, metaKeys = [];
  var setKeys = function(object) {
    if (object.hotKey) {
      hotKey = parseInt(object.hotKey);
    }
    if (object.metaKeys && object.metaKeys != '') {
      metaKeys = object.metaKeys.split(';');      
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
    var inputs = document.querySelectorAll(selector);
    if (inputs.length > 0) {
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i], parent = input, hidden = false;
        while (parent && parent.style) {
          if (parent.hidden || parent.style.display == 'none') {
            hidden = true;
            break;
          }
          parent = parent.parentNode;
        }
        if (!hidden) {
          input.focus();
          focused = true;
          break;
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
        blockKeyRepeat = true;
        if (focusOnSelector('input[type=search]') || focusOnSelector('input[name=q]') || focusOnSelector('input[type=qs]') || focusOnSelector('input[type=text]')) {
          event.preventDefault();
        }
      }
    }
  });
  document.addEventListener('keyup', function(event) {
    blockKeyRepeat = false;
  });
})();
