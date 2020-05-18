const scale = 13;
let theMarker = {};


//map initialiser function
let primaryMap = mapInit(scale);

primaryMap.whenReady(() => {
    console.log("map done loading");
    primaryMap.invalidateSize();
    primaryMap.fitWorld();
    primaryMap.invalidateSize();
    primaryMap.setView([57.05, 9.92], scale);
});


coordXField = document.getElementById('ecoordinate');
coordYField = document.getElementById('ncoordinate');
// Execute a function when the user releases a key on the keyboard
coordXField.addEventListener("keyup", function(event) {
    markerUpdate([Number(coordYField.value), Number(coordXField.value)], false);
});
coordYField.addEventListener("keyup", function(event) {
    markerUpdate([Number(coordYField.value), Number(coordXField.value)], false);
});

primaryMap.on('click', function(e){
    let latlng = e.latlng
    let selectedCoord = [latlng.lat, latlng.lng];
    markerUpdate(selectedCoord, true);
});

async function markerUpdate(coords, fromClick){

    if (await validateInsideBuilding(coords) === true){
        
        if (fromClick === true){
            inputToField(coords[1].toFixed(7), coords[0].toFixed(7));
        }
        document.getElementById('coordError').setAttribute('style', 'opacity: 0;');
        document.getElementById('submitButton').disabled = false;
        if (theMarker != undefined) {
            await primaryMap.removeLayer(theMarker);
            theMarker = L.marker([coords[0], coords[1]]).addTo(primaryMap); 
        }
        else{
            theMarker = L.marker([coords[0], coords[1]]).addTo(primaryMap); 
        }
        primaryMap.flyTo([coords[0], coords[1]], scale+4);
    }
    else{
        if (theMarker != undefined) {
            await primaryMap.removeLayer(theMarker);
        }

        if (fromClick === true){
            inputToField(null, null);
        }
        document.getElementById('coordError').setAttribute('style', 'opacity: 1;');
        document.getElementById('submitButton').disabled = true;
    }
}

let poly
poly = L.polygon([[0,0][0,0]]); 
//0,0 polygon to intialise polylayer to avoid clearing of "undefined" first time fetchPlan is run
/* Creates the polygon the inputted data exists in 
 * then displays it on the map.
 */
function displayPolygon(polygon){
    let polyCoords = polygon;
    polyCoords.forEach(element => {
        element.reverse();
    });
    
    poly = L.polygon(polyCoords);
    poly.addTo(primaryMap);
}

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
        if (json.result === true){
            poly.removeFrom(primaryMap);
            displayPolygon(json.polygon);
            validationSuccess = true; 
        }
        else{
            poly.removeFrom(primaryMap);
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