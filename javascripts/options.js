var keyCodes, ignoreKeyCodes, metaKeyCodes;

$(document).ready(function() {
  var editing, hotKey, newHotKey, metaKeys = [], newMetaKeys = [], keys = $('#keys');
  var input = $('#hotkey'), keyText = $('#key-text'), quiet = keyText.parent();

  var addKey = function(contents) {
    var key = $('<div class="key"></div>');
    key.append(contents);
    keys.append(key);
    var inputValue = '';
    for (var i = 0; i < keys.find('.key').length; i++) {
      inputValue += '   ';
    }
    input.val(inputValue);
    keyText.html(keys.text());
  };

  var addMetaKey = function(newMetaKey) {
    newMetaKeys.push(newMetaKey);
    addKey(metaKeyCodes[newMetaKey]);
  };

  var clearKeys = function() {
    input.val('');
    keys.find('.key').remove();
    newHotKey = null;
    newMetaKeys = [];
  };

  var restoreKeys = function() {
    editing = false;
    clearKeys();
    $.each(metaKeys, function() {
      addMetaKey(this);
    });
    setHotKey(hotKey);
  };

  var setHotKey = function(keyCode) {
    editing = false;
    newHotKey = keyCode;
    var hotKeyString = keyCodes[keyCode] || String.fromCharCode(keyCode);
    addKey(hotKeyString);
  };

  input.focus(function(event) {
    clearKeys();
  }).blur(function(event){
    if (this.value == '') {
      restoreKeys();
    }
  }).keydown(function(event) {
    if (event.keyCode == 27) {
      restoreKeys();
      this.blur();
    } else {
      event.preventDefault();
      editing = true;
      var keyCode = event.which || event.keyCode;
      if (event.altKey && keyCode == 18) {
        addMetaKey('alt');
      } else if (event.ctrlKey && keyCode == 17) {
        addMetaKey('ctrl');
      } else if (event.metaKey && (keyCode == 91 || keyCode == 93 || keyCode == 224)) {
        addMetaKey('meta');
      } else if (event.shiftKey && keyCode == 16) {
        addMetaKey('shift');
      } else if (!ignoreKeyCodes[keyCode]) {
        setHotKey(keyCode);
        this.blur();
      }
    }
  }).keyup(function(event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode != 16 && keyCode != 17 && keyCode != 18 && keyCode != 91 && keyCode != 93 && keyCode != 224) {
      
    } else {
      editing = false;
      clearKeys();
    }
  });

  $('#save').click(function(event) {
    event.preventDefault();
    localStorage['slashsearch.hotKey'] = newHotKey;
    localStorage['slashsearch.metaKeys'] = newMetaKeys.join(';');
    chrome.windows.getAll({populate: true}, function(windows) {
      $.each(windows, function() {
        $.each(this.tabs, function() {
          chrome.tabs.sendRequest(this.id, {method: 'setKeys', "hotKey": newHotKey, "metaKeys": newMetaKeys.join(';')});
        });
      });
      window.close();
    });
  });

  $('#cancel').click(function(event) {
    event.preventDefault();
    window.close();
  });

  if (localStorage['slashsearch.hotKey']) {
    hotKey = localStorage['slashsearch.hotKey'];
    if (localStorage['slashsearch.metaKeys'] != '') {
      metaKeys = localStorage['slashsearch.metaKeys'].split(';');
      $.each(metaKeys, function() {
        if (this == 'alt' || this == 'ctrl' || this == 'meta' || this == 'shift') {
          addMetaKey(this);
        }
      });
    }
    setHotKey(hotKey);
  } else {
    setHotKey(191);
  }
});

keyCodes = {
	13: '&#8617;',
	14: '&#8617;',
	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',
	59: ';',
	96: '0',
	97: '1',
	98: '2',
	99: '3',
	100: '4',
	101: '5',
	102: '6',
	103: '7',
	104: '8',
	105: '9',
	106: '*',
	107: '+',
	108: 'SEPARATOR',
	109: 'SUBTRACT',
	110: 'DECIMAL',
	111: 'DIVIDE',
	112: 'F1',
	113: 'F2',
	114: 'F3',
	115: 'F4',
	116: 'F5',
	117: 'F6',
	118: 'F7',
	119: 'F8',
	120: 'F9',
	121: 'F10',
	122: 'F11',
	123: 'F12',
	124: 'F13',
	125: 'F14',
	126: 'F15',
	127: 'F16',
	128: 'F17',
	129: 'F18',
	130: 'F19',
	131: 'F20',
	132: 'F21',
	133: 'F22',
	134: 'F23',
	135: 'F24',
	186: ';',
	187: '=',
	188: ',',
	189: '-',
	190: '.',
	191: '/',
	192: '`',
	219: '[',
	221: ']'
};

var platformKeyCodes = {
  mac: {
    61: '=',
    220: '\\',
    222: "'"
  },
  nix: {},
  windows: {
    107: '=',
    222: '\\',
    192: "'"
  }
};

ignoreKeyCodes = {
  3: 'CANCEL',
	6: 'HELP',
	8: 'BACK_SPACE',
	9: 'TAB',
	12: 'CLEAR',
	16: 'SHIFT',
	17: 'CONTROL',
	18: 'ALT',
	19: 'PAUSE',
	20: 'CAPS_LOCK',
	27: 'ESCAPE',
	32: 'SPACE',
	33: 'PAGE_UP',
	34: 'PAGE_DOWN',
	35: 'END',
	36: 'HOME',
	37: 'LEFT',
	38: 'UP',
	39: 'RIGHT',
	40: 'DOWN',
	41: 'SELECT',
	42: 'PRINT',
	43: 'EXECUTE',
	44: 'PRINTSCREEN',
	45: 'INSERT',
	46: 'DELETE',
	144: 'NUM_LOCK',
	145: 'SCROLL_LOCK',
	224: 'META'
}

metaKeyCodes = {
  'alt': '&#8997;',
  'ctrl': '&#8963;',
  'meta': '&#8984;',
  'shift': '&#8679;'
};


if (navigator.appVersion.indexOf('Mac') !=-1 ) {
  $.extend(keyCodes, platformKeyCodes.mac);
} else if (navigator.appVersion.indexOf('X11') != -1 || navigator.appVersion.indexOf('Linux')!=-1) {
  $.extend(keyCodes, platformKeyCodes.nix);
} else if (navigator.appVersion.indexOf('Win') != -1) {
  $.extend(keyCodes, platformKeyCodes.windows);
}
