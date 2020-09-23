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
        container.appendChild(image);
      }
      image.src = "/view/" + name + "?" + Date.now();
    });
  });
});
