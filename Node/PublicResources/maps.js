let primaryMap = L.map("mapArea").setView([57,9.9], 13);
const scale = 13;
let hostURL = "127.0.0.1:3000";
//test variables
const x_coordinate = 57.01, y_coordinate = 9.91;

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia3Jpczk3M2EiLCJhIjoiY2s3eGFtM2hiMDlnbjNmcHByNXBocWE1ZSJ9.AC0zZ0OWIjPa70_crBl-qQ'
}).addTo(primaryMap);

function print(){
    let operative  = document.getElementById("tempPlanContent");
    operative.innerHTML = "Operative plan data";
    let structure = document.getElementById("tempBuilding");
    structure.innerHTML = "Structure plan data";
}

function placeMarker(x_coordinate, y_coordinate){
    let accident = L.marker([x_coordinate, y_coordinate]).addTo(primaryMap);
    accident.on('mousedown', print);
    primaryMap.setView([x_coordinate, y_coordinate], scale);
}

function displayProperties(feature, layer){
    layer.on('mousedown', (e) => {
        let outerElement = document.getElementById("opPlan");
        outerElement.innerHTML = ''; //Clears the outer element so no multiples appear with more clicks

        for(property in feature.properties) {
            let p = document.createElement("p");
            p.innerHTML = feature.properties[property];
            let attributeCount = Object.keys(feature.properties).length;
            let padding = (outerElement.clientHeight - (attributeCount * 18)) / attributeCount / 2; // that 18 is really scuffed, figure out a change if necessary
            console.log(padding);
            p.style.padding = `${padding}px 0px`;
            p.style.margin = "0"


            outerElement.appendChild(p);
        }
        /*let typefire = feature.properties.typeFire;
        let time = feature.properties.time;
        let automaticAlarm = feature.properties.automaticAlarm;
        outerElement.innerHTML = `${typefire}<br><br> ${time}<br><br> ${automaticAlarm}`; */
    })
}

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



placeMarker(x_coordinate, y_coordinate);