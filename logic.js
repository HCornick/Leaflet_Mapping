// Define variables for each map theme option
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 15,
  id: "mapbox.satellite",
  accessToken: API_KEY
});
var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 15,
  id: "mapbox.light",
  accessToken: API_KEY
});
var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 15,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

// Define a baseMaps object to hold each of the map themes
var baseMaps = {
  "Satellite": satellite,
  "Grayscale": grayscale,
  "Outdoors": outdoors,
};

// Create a map object
var myMap = L.map("map", {
 center: [37.09, -95.71],
  zoom: 4,
  layers:[satellite, grayscale, outdoors]
});

// Create variables for data files: tectonic plates geojson file, and earthquake geojson link
var platesFile = "plates.geojson"
var quake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Read the tectonic plates file using d3, and create a geoJson layer to add to the map
d3.json(platesFile, function(data) {
  plates = L.geoJson(data, {
    style: function(feature) {
      return {
        color: "orange",
        weight: 2
      };
    }
  }).addTo(myMap);
});

// Read data from the earthquake geoJson url using d3, and add markers with
// features based on the data values
d3.json(quake_url, function(data) {
  setFeatures(data.features);
   })
   function setColor(mag) {
    return mag >= 5  ? '#ec0000' :
           mag >= 4  ? '#e27d00' :
           mag >= 3  ? '#e29d00' :
           mag >= 2  ? '#fdc73b' :
           mag >= 1  ? '#ccca47' :
           mag >= 0  ? '#98f061' :
                      '#98fe61';
  }

  function setMarkers( feature, latlng ){
    // Change the values of these options to change the symbol's appearance
    let options = {
      radius: feature.properties.mag*3,
      fillColor: setColor(feature.properties.mag),
      color: "black",
      weight: 1,
      opacity: 8,
      fillOpacity: 1.5
    }
    return L.circleMarker( latlng, options );
  }

function setFeatures(earthquakeData) {
  function setLabels(feature, layer) {
    // Set text to be in each box that appears when you click on a data point
    layer.bindPopup("<h1>" + feature.properties.place +
    "</h1><hr>Magnitude: " + feature.properties.mag +
    "<br><br>" + Date(feature.properties.time));;
   }

  var quakes = L.geoJSON(earthquakeData, {pointToLayer: setMarkers,
    onEachFeature: setLabels
 }).addTo(myMap)

createMap(quakes);
}

function createMap(quakes) {
  // Create overlay object
  var overlayMaps = {
    "Fault Lines": plates,
    Earthquakes: quakes
  };

  // Create a layer control holding the baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

// Create legend for earquake magnitude colors, and set position
var magLegend  = L.control({
  position: "bottomright"
});

magLegend.onAdd = function() {
  var div = L.DomUtil.create("div", "legend"),
        magnitude = [0, 1, 2, 3, 4,5];
        for (var i = 0; i < magnitude.length; i++) {
          div.innerHTML +=
              '<i style="background:' + setColor(magnitude[i] + 1) + '"></i> ' +
              magnitude[i] + (magnitude[i + 1] ? ' - ' + magnitude[i + 1] + '<br>' : '+');
      }
  return div;
};

// Add the info legend to the map
magLegend.addTo(myMap);
