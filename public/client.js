var colors = [
	'white',
	'#ffb5a7',
	'#ffd6a5',
	'#fdffb6',
	'#caffbf',
	'#9bf6ff',
	'#a0c4ff',
	'#bdb2ff',
	'#ffc6ff'
];

document.addEventListener("DOMContentLoaded", function() {
  var source = new EventSource('/subscribe');
  var images = {};
  var container = document.getElementById("images");
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
	var match = name.match(/^.*(\d+)@/);
	var display = name;
	var color = 'white';
	if( match ) {
	      	display = match[1];
		color = colors[parseInt(match[1], 10)];
	}
	var number = document.createElement('div');
	number.classList.add('number');
	number.style.color = color;
	number.style.borderColor = color;
	number.textContent = display;
	image.style.borderColor = color;
	figure.appendChild(number);
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

  var params = new URLSearchParams(window.location.search);
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
