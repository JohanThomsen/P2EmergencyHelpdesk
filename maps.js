let primaryMap = L.map("mapArea").setView([57, 9.9], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia3Jpczk3M2EiLCJhIjoiY2s3eGFtM2hiMDlnbjNmcHByNXBocWE1ZSJ9.AC0zZ0OWIjPa70_crBl-qQ'
}).addTo(primaryMap);

let marker = L.marker([57, 9.9]).addTo(primaryMap);

function print(){
    let operative  = document.getElementById("tempPlanContent");
    operative.innerHTML = "Operative plan data";
    let structure = document.getElementById("tempBuilding");
    structure.innerHTML = "Structure plan data";
}


marker.on('mousedown', print);