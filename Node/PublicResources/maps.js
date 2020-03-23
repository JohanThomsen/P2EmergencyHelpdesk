let primaryMap = L.map("mapArea").setView([57, 9.9], 13);
const scale = 13;

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
    //primaryMap = L.map("mapArea").setView([x_coordinate, y_coordinate], scale);
}

placeMarker(x_coordinate, y_coordinate);