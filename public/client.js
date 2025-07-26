document.addEventListener("DOMContentLoaded", function() {
  var source = new EventSource('/subscribe');
  var images = {};
  var container = document.getElementById("images");
  var params = new URLSearchParams(window.location.search);
  var isAdmin = params.get('admin') === '1';

  // Admin UI elements
  var adminUI = null;
  var selectedScreen = null;

  if (isAdmin) {
    createAdminUI();
    document.body.classList.add('admin-mode');
  }

  function createAdminUI() {
    adminUI = document.createElement('div');
    adminUI.classList.add('admin-ui');

    // Global controls
    var globalControls = document.createElement('div');
    globalControls.id = 'global-controls';
    globalControls.innerHTML = `
      <h3>Global Controls</h3>
      <div class="message-input-group">
        <input type="text" id="global-message" placeholder="Broadcast message">
      </div>
      <div class="quick-actions">
        <button onclick="sendQuickMessage('Time to eat!')" class="quick-btn eat-btn">🍽️</button>
        <button onclick="sendQuickMessage('Time to save and quit!')" class="quick-btn save-btn">💾</button>
        <button onclick="suspendAll()" class="quick-btn suspend-btn">⏸️</button>
      </div>
    `;
    adminUI.appendChild(globalControls);

    // Individual screen controls
    var individualControls = document.createElement('div');
    individualControls.id = 'individual-controls';
    individualControls.style.display = 'none';
    individualControls.innerHTML = `
      <h3 id="individual-title">Individual Controls</h3>
      <div class="message-input-group">
        <input type="text" id="individual-message" placeholder="Message">
      </div>
      <div class="quick-actions">
        <button onclick="sendQuickIndividualMessage('Time to eat!')" class="quick-btn eat-btn">🍽️</button>
        <button onclick="sendQuickIndividualMessage('Time to save and quit!')" class="quick-btn save-btn">💾</button>
        <button onclick="suspendIndividual()" class="quick-btn suspend-btn">⏸️</button>
      </div>
      <button onclick="showGlobalControls()" class="back-btn">← Back to Global</button>
    `;
    adminUI.appendChild(individualControls);

    document.body.insertBefore(adminUI, document.body.firstChild);

    // Add keyboard event listeners
    document.getElementById('global-message').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendGlobalMessage();
      }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Escape key goes back to global controls
      if (e.key === 'Escape') {
        showGlobalControls();
      }

      // Ctrl+Enter sends global message
      if (e.ctrlKey && e.key === 'Enter') {
        sendGlobalMessage();
      }
    });
  }

  // Global functions for admin controls
  window.sendGlobalMessage = function() {
    var message = document.getElementById('global-message').value.trim();
    if (!message) return;

    fetch('/admin/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'all', message: message })
    });

    document.getElementById('global-message').value = '';
  };

  window.sendQuickMessage = function(message) {
    fetch('/admin/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'all', message: message })
    });
  };

  window.suspendAll = function() {
    fetch('/admin/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'all' })
    });
  };

  window.sendIndividualMessage = function() {
    if (!selectedScreen) return;

    var message = document.getElementById('individual-message').value.trim();
    if (!message) return;

    fetch('/admin/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: selectedScreen, message: message })
    });

    document.getElementById('individual-message').value = '';
  };

  window.sendQuickIndividualMessage = function(message) {
    if (!selectedScreen) return;

    fetch('/admin/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: selectedScreen, message: message })
    });
  };

    window.suspendIndividual = function() {
    if (!selectedScreen) return;

    fetch('/admin/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: selectedScreen })
    });
  };

  window.showGlobalControls = function() {
    // Clear selection
    if (selectedScreen && images[selectedScreen]) {
      images[selectedScreen].parentNode.style.border = '';
    }
    selectedScreen = null;

    // Show global controls, hide individual controls
    document.getElementById('global-controls').style.display = 'block';
    document.getElementById('individual-controls').style.display = 'none';
  };

  window.showIndividualControls = function(screenName) {
    // Update title with the selected computer name
    document.getElementById('individual-title').textContent = screenName;

    // Hide global controls, show individual controls
    document.getElementById('global-controls').style.display = 'none';
    document.getElementById('individual-controls').style.display = 'block';

    // Focus the message input and setup listener
    setTimeout(function() {
      document.getElementById('individual-message').focus();
      setupIndividualMessageListener();
    }, 100);
  };



  // Add keyboard event listeners for individual message input
  function setupIndividualMessageListener() {
    var individualMessageInput = document.getElementById('individual-message');
    if (individualMessageInput) {
      individualMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendIndividualMessage();
        }
      });
    }
  }

  source.addEventListener("update", function(event) {
    var updates = JSON.parse(event.data);
    var columnCount = Math.ceil(Math.sqrt(updates.length));
    var rowCount = 1;
    if( columnCount > 0 )
      rowCount = Math.ceil(updates.length / columnCount);
    container.style.gridTemplateColumns = "repeat(" + columnCount + ", 1fr)";
    for( var [key, value] of Object.entries(images) ) {
      value.dataset.present = false;
    }
    updates.forEach( function(info) {
      var name = info[0];
      var time = info[1];
      var image = images[name];
      if( !image ) {
        image = document.createElement('img');
        image.classList.add("screen");
        images[name] = image;
        var figure = document.createElement('figure');
        figure.appendChild(image);
        var parts = name.split("@");
        var kidName = parts[0];
        var computerName = parts[1];

        if( window.kids && kids[kidName] ) {
          var kid = kids[kidName];
          var portrait = document.createElement('img');
          portrait.classList.add("portrait");
          portrait.src = kid.picture;
          portrait.style.borderColor = kid.color;
          figure.appendChild(portrait);
          image.style.borderColor = kid.color;
        }
        else {
          let text = kidName;
          if(kidName === "kids")
            text = computerName;
          var caption = document.createElement('figcaption')
          caption.textContent = text;
          caption.classList.add("floating");
          var width = Math.max(5, (text.length / 6) * 10); // Minimum 5vw
          caption.style.width = width + "vw";
          caption.style.right = "calc(50% - " + (width / 2) + "vw)";
          figure.appendChild(caption);
        }

                // Add click handler for admin mode
        if (isAdmin) {
          figure.addEventListener('click', function() {
            // Clear previous selection
            if (selectedScreen && images[selectedScreen]) {
              images[selectedScreen].parentNode.style.border = '';
            }

            // Set new selection
            selectedScreen = name;
            figure.style.border = '3px solid #4CAF50';

            // Show individual controls
            showIndividualControls(name);
          });
        }

        container.appendChild(figure);

        // Sort all by name
        var newOrder = [];
        var keys = Object.keys(images);
        keys.sort();
        keys.forEach( function(key) {
          container.appendChild( images[key].parentNode );
        });
      }
      image.src = "/view/" + name + "?" + time;
      image.dataset.present = true;
      image.style.height = "calc(" + (100 / rowCount).toString() + "vh - 5px * " + (rowCount - 1).toString() + ")"
    });
    for( var [key, value] of Object.entries(images) ) {
      if( value.dataset.present == "true" )
        continue;
      delete images[key];
      value.parentNode.remove();
    }
  });

  if( !params.get('clock') )
    return;

  var two = function(i) {
    return i.toString().padStart( 2, '0' );
  };

  var clock = document.createElement('div');
  document.body.appendChild(clock);
  clock.classList.add("clock");
  var time = document.createElement('div');
  clock.appendChild(time);
  time.classList.add("time");
  var date = document.createElement('div');
  clock.appendChild(date);
  date.classList.add("date");
  setInterval( function() {
    var now = new Date;
    time.textContent = two(now.getHours()) + ":" + two(now.getMinutes());
    date.textContent = now.toLocaleString(navigator.language, { weekday: 'short' } ) + " " + now.getDate()
  }, 1000 );
});
