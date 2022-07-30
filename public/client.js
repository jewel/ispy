document.addEventListener("DOMContentLoaded", function() {
  var source = new EventSource('/subscribe');
  var images = {};
  var container = document.getElementById("images");
  source.addEventListener("update", function(event) {
    var updates = JSON.parse(event.data);
    var columnCount = Math.ceil(Math.sqrt(updates.length.toString()));
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
        // Add a picture if there is one
        if( window.kids && kids[kidName] ) {
          var kid = kids[kidName];
          var portrait = document.createElement('img');
          portrait.classList.add("portrait");
          portrait.src = kid.picture;
          portrait.style.borderColor = kid.color;
          figure.appendChild(portrait);
          image.style.borderColor = kid.color;
        }
        // otherwise show name
        else {
          var caption = document.createElement('figcaption')
          caption.textContent = name;
          figure.appendChild(caption);
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
    });
    for( var [key, value] of Object.entries(images) ) {
      if( value.dataset.present == "true" )
        continue;
      delete images[key];
      value.parentNode.remove();
    }
  });

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
