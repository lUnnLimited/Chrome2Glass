// A convenience reference to the extension background page
var bg = chrome.extension.getBackgroundPage();

// Clear OUath credentials and close the window
function signOut () {
  bg.signOut();
  window.close();
}

// Perform initialization on the status page since inline scripts are prohibited in extensions
document.addEventListener( 'DOMContentLoaded', function () {
  // Assign the sign out button's text and click handler
  var signOutButton = document.getElementById( 'sign_out' );
  signOutButton.value = chrome.i18n.getMessage( 'sign_out_message' );
  signOutButton.addEventListener( 'click', signOut );

  // Set the src of the status iFrame to an OAuth sign URL determined by the background page
  var statusFrame = document.getElementById( 'status' );
  statusFrame.setAttribute( "src", bg.c2gUrl );
} );
