document.addEventListener("DOMContentLoaded", function() {
  var source = new EventSource('/subscribe');
  var images = {};
  var container = document.getElementById("images");
  source.addEventListener("update", function(event) {
    var names = JSON.parse(event.data);
    names.forEach( function(name) {
      var image = images[name];
      if( !image ) {
        image = document.createElement('img');
        images[name] = image;
        var figure = document.createElement('figure');
        figure.appendChild(image);
        var caption = document.createElement('figcaption')
        caption.textContent = name;
        figure.appendChild(caption);
        container.appendChild(figure);
      }
      image.src = "/view/" + name + "?" + Date.now();
    });
    for( var [key, value] of Object.entries(images) ) {
      if( names.indexOf( key ) >= 0 )
        continue;
      delete images[key];
      value.parentNode.remove();
    }
  });
});
