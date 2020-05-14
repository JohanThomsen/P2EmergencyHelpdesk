const scale = 13;

// Leaflet copy-paste job, creates the map then gets the map from mapbox
let primaryMap = L.map("mapArea").setView([57.05016, 9.9189], scale);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoia3Jpczk3M2EiLCJhIjoiY2s3eGFtM2hiMDlnbjNmcHByNXBocWE1ZSJ9.AC0zZ0OWIjPa70_crBl-qQ'
}).addTo(primaryMap);

//let selectedCoords;

primaryMap.on('click', function(e){
    let latlng = e.latlng
    let coord = e.latlng.toString().split(',');
    let lat = coord[0].split('(');
    let lng = coord[1].split(')');
    let selectedCoord = [latlng.lat, latlng.lng];
    validateInsideBuilding(selectedCoord);
    console.log("You clicked the map at latitude: [" + lng[0] + ", " + lat[1] + "]");
});

function validateInsideBuilding(coords){
    let test = fetch('/validateInside', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({coords: coords}) // body data type must match "Content-Type" header
      })
    .then((response) => response.json())
    .then((json) => {
        console.log(json);
        if (json.result === true){
            return true; 
        }
        return false; 
    })

    if (test){
        console.log("true");
        return true;
    }
    console.log("false");
    return false; 
}