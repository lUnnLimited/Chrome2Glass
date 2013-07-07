// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Base URL of Chrome2Glass
var c2gUrl = "https://chrome2glass.appspot.com";

// URL to direct POST requests
var url = c2gUrl + "/main";

// OAuth interface
var oauth = ChromeExOAuth.initBackgroundPage( {
  'request_url': c2gUrl + '/_ah/OAuthGetRequestToken',
  'authorize_url': c2gUrl + '/_ah/OAuthAuthorizeToken',
  'access_url': c2gUrl + '/_ah/OAuthGetAccessToken',
  'consumer_key': 'anonymous',
  'consumer_secret': 'anonymous',
  'scope': 'https://www.googleapis.com/auth/userinfo.email',
  'app_name': chrome.i18n.getMessage( 'app_short_name' )
} );

// Updates the extension's icon based on the whether there is a valid oauth token
function setIcon () {
  if ( oauth.hasToken() ) {
    chrome.browserAction.setIcon( { 'path': 'img/icon-19-on.png' } );
  } else {
    chrome.browserAction.setIcon( { 'path': 'img/icon-19-off.png' } );
  }
};

// Unused; callback for sendSignedRequest.
// TODO: Determine if the request failed because of authentication
function sendItemHandler ( text, xhr ) {
//  console.log( arguments );
}

// Send an OAuth signed request to the server that will relay it to the user's Glass via the Mirror API
function sendItem ( item ) {
   oauth.sendSignedRequest(
     url,
     sendItemHandler,
     {
       'method': 'POST',
       'parameters': {
         'operation': 'insertItem',
         'message': item.message,
         'imageUrl': item.imageUrl
       }
     }
   );
}

// Callback function for the extensions icon; establishes an OAuth token and opens the status page
function openStatusPage () {
  oauth.authorize( function () {
    setIcon();
    chrome.tabs.create( { 'url' : c2gUrl } );
  } );
}

// Clears the user's OAuth token and updates the extensions icon to reflect
function signOut () {
  oauth.clearTokens();
  setIcon();
};

// Initialize the extension icon
setIcon();

// Register the callback function for clicking on the extension's icon
chrome.browserAction.onClicked.addListener( openStatusPage );

// Callback function for the contextual menu for media ( images, video or audio )
function mediaHandler ( info, tab ) {
  sendItem( { 'imageUrl': info.srcUrl } );
}

// Callback function for the contextual menu for text selection
function selectionHandler ( info, tab ) {
  sendItem( { 'message': info.selectionText } );
}

// Callback function for the contextual menu for links
function linkHandler ( info, tab ) {
  sendItem( { 'message': info.linkUrl } );
}

// Register the callback functions above as context menus
if ( chrome.contextMenus ) {
    chrome.contextMenus.create( { 'title': chrome.i18n.getMessage( 'context_menu_for_media' ),
        'documentUrlPatterns': [ 'http://*/*', 'https://*/*' ],
        'onclick': mediaHandler,
        'contexts': [ 'image', 'video', 'audio' ]
    } );
    chrome.contextMenus.create( { 'title': chrome.i18n.getMessage( 'context_menu_for_selection' ),
        'documentUrlPatterns': [ 'http://*/*', 'https://*/*' ],
        'onclick': selectionHandler,
        'contexts': [ 'selection' ]
    } );
    chrome.contextMenus.create( { 'title': chrome.i18n.getMessage( 'context_menu_for_link' ),
        'documentUrlPatterns': [ 'http://*/*', 'https://*/*' ],
        'onclick': linkHandler,
        'contexts': [ 'link' ]
    } );
}
