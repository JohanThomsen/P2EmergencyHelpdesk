
const scale = 13;

// Leaflet copy-paste job, creates the map then gets the map from mapbox
let primaryMap = L.map("mapArea").setView([57,9.9], scale);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia3Jpczk3M2EiLCJhIjoiY2s3eGFtM2hiMDlnbjNmcHByNXBocWE1ZSJ9.AC0zZ0OWIjPa70_crBl-qQ'
}).addTo(primaryMap);

/*
function placeMarker(x_coordinate, y_coordinate){
    let accident = L.marker([x_coordinate, y_coordinate]).addTo(primaryMap);
    accident.on('mousedown', print);
    primaryMap.setView([x_coordinate, y_coordinate], scale);
}
*/
function displayProperties(feature, layer){
    layer.on('mousedown', (e) => {
        let outerElement = document.getElementById("opPlan");
        outerElement.innerHTML = ''; //Clears the outer element so no multiples appear with more clicks

        // Creates a paragraf for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            let p = document.createElement("p");
            p.innerHTML = feature.properties[property];

            let attributeCount = Object.keys(feature.properties).length;
            let padding = (outerElement.clientHeight - (attributeCount * 18)) / attributeCount / 2; // that 18 is really scuffed, figure out a change if necessary
            p.style.padding = `${padding}px 0px`;
            p.style.margin = "0"

            outerElement.appendChild(p);
        }
    })
}

// Gets the current fires, loads them onto the map with the display function on click
// Make this reload the fires live, websocket maybe?
fetch("/fires")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let geojsonLayer = new L.geoJSON(data, {
            onEachFeature: displayProperties
        });

        geojsonLayer.addTo(primaryMap);
    });

//**for validating polygon check tests**/

async function GetPlaces() {
    let response = await fetch('http://127.0.0.1:3000/buildings');
    let myJson = await response.json();

    myJson.features.forEach(element => {
        L.geoJSON(element).addTo(primaryMap);
    });

    console.log(myJson);
}

GetPlaces()

function onMapClick(e) {
    //alert("You clicked the map at " + e.latlng);
    var marker = L.marker(e.latlng).addTo(primaryMap)//.bindPopup("e.latlng, toString").openPopup();
    console.log(e.latlng)
    //marker.bindPopup(e.latlng,toString).openPopup();
}

primaryMap.on('click', onMapClick);



//Uses the manual place marker function to place a marker, geojson makes this outdated
//placeMarker(x_coordinate, y_coordinate);
