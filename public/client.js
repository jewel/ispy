document.addEventListener("DOMContentLoaded", function() {
  var source = new EventSource('/subscribe');
  var images = {};
  var container = document.getElementById("images");
  source.addEventListener("update", function(event) {
    var updates = JSON.parse(event.data);
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
          var caption = document.createElement('figcaption')
          caption.textContent = name;
          figure.appendChild(caption);
        }
        container.appendChild(figure);
      }
      image.src = "/view/" + name + "?" + time;
      image.dataset.present = true;
    });
    for( var [key, value] of Object.entries(images) ) {
      if( value.dataset.present )
        continue;
      delete images[key];
      value.parentNode.remove();
    }
  });
});
