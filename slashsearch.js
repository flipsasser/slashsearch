(function() {
  var hotKey = 191, metaKeys = [];
  chrome.extension.sendRequest({method: 'getKeys'}, function(response) {
    if (response.hotKey) {
      hotKey = parseInt(response.hotKey);
    }
    if (response.metaKeys && response.metaKeys != '') {
      metaKeys = response.metaKeys.split(';');      
    }
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
    var metaKeysMatch = true;
    for (var i = 0; i < metaKeys.length; i++) {
      metaKeysMatch = metaKeysMatch && event[metaKeys[i] + 'Key'];
    }
    if (blockKeyRepeat) {
      event.preventDefault();      
    } else if (event.keyCode == hotKey && metaKeysMatch && event.target.tagName.toLowerCase()  != 'input' && event.target.tagName.toLowerCase()  != 'textarea' && event.target.tagName.toLowerCase() != 'select') {
      blockKeyRepeat = true;
      if (focusOnSelector('input[type=search]') || focusOnSelector('input[name=q]') || focusOnSelector('input[type=qs]') || focusOnSelector('input[type=text]')) {
        event.preventDefault();
      }
    }
  });
  document.addEventListener('keyup', function(event) {
    blockKeyRepeat = false;
  });
})();
