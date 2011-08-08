SlashSearch = {
  configure: function() {
    // Configure the OmniBox
    chrome.omnibox.onInputCancelled.addListener(function(input) {
      SlashSearch.updateDefaultSuggestion();
    });

    chrome.omnibox.onInputChanged.addListener(function(input) {
      SlashSearch.updateDefaultSuggestion(input);
    });

    chrome.omnibox.onInputEntered.addListener(function(input) {
      SlashSearch.withCurrentTab(function(tab) {
        chrome.tabs.sendRequest(tab.id, {method: 'performSearch', term: input, origin: this.link.origin});
      });
    });

    chrome.omnibox.onInputStarted.addListener(function(input) {
      SlashSearch.updateDefaultSuggestion(input);
    });

    SlashSearch.updateDefaultSuggestion();
  },
  link: document.createElement('a'),
  listen: function() {
    // Listen for requests from search extensions
    chrome.extension.onRequest.addListener(function(request, requester, sendResponse) {
      switch (request.method) {
        case 'getKeys':
          sendResponse({hotKey: localStorage['slashsearch.hotKey'], metaKeys: localStorage['slashsearch.metaKeys']});
        break;
        default:
          sendResponse({});
        break;
      }
    });
  },
  updateDefaultSuggestion: function(match) {
    this.withCurrentTab(function(tab) {
      var suggestion = 'Search ';
      suggestion += '<url>' + this.link.host + '</url>';
      if (match) {
        suggestion += ' for <match>' + match + '</match>';
      }
      chrome.omnibox.setDefaultSuggestion({
        description: suggestion
      });
      this.link.href = null;
    });
  },
  withCurrentTab: function(method) {
    chrome.windows.getLastFocused(function(window) {
      chrome.tabs.getSelected(window.id, function(tab) {
        SlashSearch.link.href = tab.url;
        method.call(SlashSearch, tab);
      });
    });
  }
};

SlashSearch.listen();
SlashSearch.configure();
