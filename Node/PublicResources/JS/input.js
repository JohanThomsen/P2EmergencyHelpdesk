const scale = 13;
let theMarker = {};

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

primaryMap.on('click', async function(e){
    let latlng = e.latlng
    let selectedCoord = [latlng.lat, latlng.lng];
    if (theMarker != undefined) {
        primaryMap.removeLayer(theMarker);
    };
    if (await validateInsideBuilding(selectedCoord) === true){
        let coordX = latlng.lat.toString().replace(',', '.');
        let coordY = latlng.lng.toString().replace(',', '.');
        inputToField(coordY, coordX);
        document.getElementById("coordError").setAttribute('style', 'opacity: 0;');
        theMarker = L.marker([latlng.lat,latlng.lng]).addTo(primaryMap); 
    }
    else{
        inputToField(null, null);
        document.getElementById("coordError").setAttribute('style', 'opacity: 1;');
    }
});

async function validateInsideBuilding(coords){
    let validationSuccess; 
    let test = await fetch('/validateInside', {
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
            validationSuccess = true; 
        }
        else{
            validationSuccess = false; 
        }        
    })

    if (validationSuccess){
        return true;
    }
    return false; 
}

function inputToField(coordX, coordY){
    coordYField = document.getElementById('ncoordinate');
    coordXField = document.getElementById('ecoordinate');

    coordYField.value = coordY;
    coordXField.value = coordX;

}