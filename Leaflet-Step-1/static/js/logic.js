// Establishing and querying JSON data from USGS
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


d3.json(queryUrl).then(function (data){
  createFeatures(data.features);

});

// Creating function to use earthquake data to put into markers
function createFeatures(earthquakeData){
  function onEachFeature(features, layer){
    
    // Adding a tool tip with earthquake epicenter location, magnitude, depth, and date of event.
    layer.bindPopup(`<h3>Epicenter: ${features.properties.place}</h3><hr><p>Magnitude: ${features.properties.mag}</p><hr><p>Depth: ${features.geometry.coordinates[2]} km</p><hr><p>Event date: ${new Date(features.properties.time)}`)

  }

  // Stylizing the circle markers, change opacity, and radius of circle markers
  function getStyle (features){
    return  {
      stroke: false,
      fillOpacity: 0.45,
      fillColor: getColor(features.geometry.coordinates[2]),
      radius: get_radius(features.properties.mag)
    }

  }
  // Establishing color of circle colors depending upon the depth of the earthquake from the JSON file
  function getColor (depth) {
    if (depth > 90) {
      return "red";
    }
    else if (depth > 70){
      return "tomato";
    }
    else if (depth > 50) {
      return "orange";      
    }
    else if (depth > 30) {
      return "yellow";
    }
    else if (depth > 10){
      return "yellowgreen";
    }
    else {
      return "green";
    }

  }
    // Calculating the radius of the circle marker based on the magnitude of the earthquake from JSON file
    function get_radius(magnitude){
      if (magnitude == 0){
        return 1
      }
      return magnitude * 6.5
    }

  var earthquakes = L.geoJSON(earthquakeData,{
    pointToLayer: function(features, coord){
      return L.circleMarker(coord)
    },
    style: getStyle,
    onEachFeature: onEachFeature
  })
  createMap(earthquakes);

}

// Creating the first layer of the map or base map
function createMap(earthquakes) {
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var baseMaps = {
    "Surface Map" : street,
    "Topographic Map" : topo

  };

  var overlayMaps = {
    Earthquakes : earthquakes
  }

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]

  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
 
// Creating a legend to show depth of earthquake.  Creating an array with the limits of the legend to signify depth levels and adding color to visualize
// different depth levels
var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = ["<10", "10-30", "30-50", "50-70", "70-90", ">90"]
  var colors = ["green", "yellowgreen", "yellow", "orange", "tomato", "red"]
  var labels = [];

  // Add the minimum and maximum.
  var legendInfo = "<h2>Earthquake Depth (km)</h2>" +
    "<div class=\"labels\">" +
      
    "</div>";

  div.innerHTML = legendInfo;

  limits.forEach(function(limit, index) {
    labels.push("<li style=\"background-color: " + colors[index] + "\">"+limit+"</li>");
  });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Adding the legend to the map
legend.addTo(myMap);
}


  