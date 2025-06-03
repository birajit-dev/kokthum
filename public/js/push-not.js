// push-notifications.js - A standalone notification system
(function() {
  // Configuration
  const config = {
    publicVapidKey: 'BAJumD12OcZQQbu-8PYbHXFrf7mjy5kw4oSQubYN93dojRLz3EHhNcy_yLk64ipj74rjbNELdQcDXUpKIQi6MZw',
    subscribeEndpoint: '/subscribe',
    promptDelay: 1000
  };

  // DOM Elements
  let pushPrompt = null;
  let toast = null;

  // State tracking
  let isSubscribing = false;
  let hasAttemptedSubscription = false;

  // Create and inject CSS
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Enhanced Notification Popup */
      #pushPrompt {
        position: fixed;
        top: -300px;
        left: 50%;
        transform: translateX(-50%);
        background: #fff;
        color: #333;
        padding: 24px 26px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        width: 90%;
        max-width: 380px;
        text-align: center;
        border: 1px solid rgba(0, 0, 0, 0.05);
      }

      #pushPrompt.show {
        top: 40px;
        opacity: 1;
      }
      
      .notification-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #4776E6, #8E54E9);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 16px;
      }

      #pushPrompt .title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      #pushPrompt .message {
        font-size: 15px;
        margin-bottom: 22px;
        line-height: 1.5;
        color: #666;
      }

      #pushPrompt .actions {
        display: flex;
        justify-content: center;
        gap: 12px;
      }

      #pushPrompt .actions button {
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        flex: 1;
      }

      .btn-allow {
        background: linear-gradient(135deg, #4776E6, #8E54E9);
        color: white;
        box-shadow: 0 4px 12px rgba(71, 118, 230, 0.2);
      }

      .btn-allow:hover {
        box-shadow: 0 6px 15px rgba(71, 118, 230, 0.3);
        transform: translateY(-2px);
      }

      .btn-decline {
        background-color: #f5f7fa;
        color: #666;
        border: 1px solid #e4e8ef !important;
      }

      .btn-decline:hover {
        background-color: #edf0f5;
      }

      /* Toast */
      #pushToast {
        visibility: hidden;
        min-width: 250px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 8px;
        padding: 14px;
        position: fixed;
        top: 20px;
        left: 0;
        right: 0;
        margin: auto;
        z-index: 10000;
        font-size: 15px;
        opacity: 0;
        transition: opacity 0.4s ease, top 0.4s ease;
      }

      #pushToast.show {
        visibility: visible;
        opacity: 1;
        top: 70px;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Create and inject HTML
  function injectHTML() {
    // Create push prompt
    pushPrompt = document.createElement('div');
    pushPrompt.id = 'pushPrompt';
    pushPrompt.innerHTML = `
      <div class="notification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
        </svg>
      </div>
      <div class="title">Stay Updated!</div>
      <div class="message">Enable notifications to receive the latest news, updates and alerts directly on your device.</div>
       <div class="message" style="font-size:13px;color:#888">
        For Android: Click Enable below and allow when prompted.<br>
                  For iOS: Tap the share button, Add to Home Screen, open the app from Home Screen, then enable notifications in Settings

      </div>
<div class="actions">
        <button class="btn-allow" id="allowPushBtn">Enable</button>
        <button class="btn-decline" id="declinePushBtn">Maybe Later</button>
      </div>
    `;
    document.body.appendChild(pushPrompt);

    // Create toast
    toast = document.createElement('div');
    toast.id = 'pushToast';
    document.body.appendChild(toast);
  }

  // Show toast message with optional duration
  function showToast(message, duration = 3000) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = "show";
    setTimeout(() => {
      toast.className = toast.className.replace("show", "");
    }, duration);
  }

  // Convert base64 string to Uint8Array
  function urlBase64ToUint8Array(base64String) {
    try {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = atob(base64);
      return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
  }

  // Check if push notifications are supported
  function isPushSupported() {
    return 'serviceWorker' in navigator && 
           'PushManager' in window &&
           'Notification' in window;
  }

  // Check if the browser is iOS
  function isIOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  }

  // Subscribe user to push notifications
  async function subscribeUser() {
    if (isSubscribing) {
      console.log('Subscription already in progress');
      return;
    }

    if (!isPushSupported()) {
      showToast('Push notifications are not supported on this device');
      return;
    }

    if (isIOS()) {
      showToast('For iOS: Please add to home screen and enable notifications in Settings', 5000);
      return;
    }

    try {
      isSubscribing = true;
      hidePrompt();

      // Request notification permission first
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      await navigator.serviceWorker.ready;

      // Check for existing subscription
      const existingSubscription = await reg.pushManager.getSubscription();
      if (existingSubscription) {
        showToast('You are already subscribed!');
        return;
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicVapidKey)
      });

      // Send subscription to server
      const response = await fetch(config.subscribeEndpoint, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send subscription to server');
      }

      const responseData = await response.json();
      if (responseData.success) {
        showToast('Successfully subscribed to notifications!');
        hasAttemptedSubscription = true;
      } else {
        throw new Error(responseData.error || 'Subscription failed');
      }

    } catch (error) {
      console.error('Subscription error:', error);
      
      let message = 'Failed to subscribe to notifications';
      if (error.message.includes('permission')) {
        message = 'Please allow notifications in your browser settings';
      } else if (error.message.includes('subscription')) {
        message = 'Error saving notification settings';
      }
      
      showToast(message);
    } finally {
      isSubscribing = false;
    }
  }

  // Show notification prompt
  function showPrompt() {
    if (!pushPrompt) return;
    
    if (!isPushSupported()) {
      console.log('Push not supported');
      return;
    }
    
    if (hasAttemptedSubscription) {
      console.log('Already attempted subscription');
      return;
    }

    if (Notification.permission === 'denied') {
      console.log('Notifications denied');
      return;
    }

    pushPrompt.classList.add('show');
  }

  // Hide notification prompt
  function hidePrompt() {
    if (!pushPrompt) return;
    pushPrompt.classList.remove('show');
  }

  // Initialize the notification system
  function init(options = {}) {
    // Merge options with defaults
    Object.assign(config, options);

    // Inject styles and HTML
    injectStyles();
    injectHTML();

    if (!pushPrompt || !toast) {
      console.error('Failed to initialize notification elements');
      return;
    }

    // Set up event listeners
    document.getElementById('allowPushBtn')?.addEventListener('click', subscribeUser);
    document.getElementById('declinePushBtn')?.addEventListener('click', () => {
      hidePrompt();
      hasAttemptedSubscription = true;
    });

    // Show prompt after delay if permission not decided
    if (Notification.permission === 'default') {
      setTimeout(showPrompt, config.promptDelay);
    }

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().catch(console.error);
      });
    }
  }

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

  // Check for pending clicks on page load
  window.addEventListener('load', checkForPendingNotificationClicks);

  // Export the init function
  window.initPushNotifications = init;
})();
