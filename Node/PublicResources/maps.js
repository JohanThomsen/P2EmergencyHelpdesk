
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
        let outerElement = document.getElementById("strucPlan");
        outerElement.innerHTML = '<h3>Structure plan</h3>'; //Clears the outer element so no multiples appear with more clicks
        console.log(feature.geometry.coordinates);
        // Creates a paragraf for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            let p = document.createElement("p");
            p.innerHTML = feature.properties[property];

            let attributeCount = Object.keys(feature.properties).length + 1;
            let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
            p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
            p.style.padding = "1px";

            outerElement.appendChild(p);

        }
    });
}

// Gets the current fires, loads them onto the map with the display function on click
// Make this reload the fires live, websocket maybe?
fetch("/fires")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let geojsonLayer = new L.geoJSON(data, {
            onEachFeature: markerFeatures
        });

        geojsonLayer.addTo(primaryMap);
    });

function fetchPlan(feature, layer){
    layer.on("mousedown", (e) => {
        let tempCoordX = feature.geometry.coordinates[0];
        let tempCoordY = feature.geometry.coordinates[1];
        let stringedCoord = String(tempCoordY) + "_" + String(tempCoordX);
        stringedCoord = stringedCoord.replace(/[.]/g,";");//replaces ALL . with ;
        console.log(stringedCoord);

        //404 error ATM
        fetch(`/operativePlans=${stringedCoord}`)
            .then((response) => {
                try {
                    JSON.parse(response);
                    return response.json();
                } catch (error) {
                    let message = {opPlan: {data:"No Operative Plan Available"}};
                    return message;
                }
                
            })
            .then((data) => {
                displayPlan(data);
            });
        });
}

// Also isnt funtional, as it still needs to be designed for the current format
function displayPlan(data){
    let outerElement = document.getElementById("opPlan");
    outerElement.innerHTML = '<h3>Operative plan</h3>'; //Clears the outer element so no multiples appear with more clicks
    console.log(data.data);
    for(property in data){
        let p = document.createElement("p");
        p.innerHTML = data[property];
        let attributeCount = Object.keys(data.opPlan).length;
        let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
        p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
        p.style.padding = "1px";

        outerElement.appendChild(p);
    }       
}

function markerView(feature, layer){
    layer.on("mousedown", (e) => {
        let coordX = feature.geometry.coordinates[0];
        let coordY = feature.geometry.coordinates[1];
        primaryMap.setView([coordY,coordX], scale+3);
    });
}

function markerFeatures(feature, layer){
    displayProperties(feature, layer);
    markerView(feature, layer);
    fetchPlan(feature, layer);
    
}
//placeMarker(x_coordinate, y_coordinate);
