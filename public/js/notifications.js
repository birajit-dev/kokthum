// notification-handler.js

// Set up listener for messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    console.log('Received message from service worker:', event.data);
    
    if (event.data.type === 'NOTIFICATION_CLICKED') {
      console.log('Notification was clicked, opening URL:', event.data.url);
      window.location.href = event.data.url;
    }
  });
}

// Function to check for pending notification clicks
function checkForPendingNotificationClicks() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if (registration.active) {
        registration.active.postMessage({
          type: 'CHECK_PENDING_CLICKS'
        });
      }
    }).catch(err => {
      console.error('Error checking for pending clicks:', err);
    });
  }
}

// Call this function when the page loads
window.addEventListener('load', checkForPendingNotificationClicks);
