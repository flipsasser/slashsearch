(function() {
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
  document.addEventListener('keyup', function(event) {
    if (event.keyCode == 191 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.target.tagName.toLowerCase()  != 'input' && event.target.tagName.toLowerCase()  != 'textarea' && event.target.tagName.toLowerCase() != 'select') {
      focusOnSelector('input[type=search]') || focusOnSelector('input[type=text]');
    }
  });
})();
