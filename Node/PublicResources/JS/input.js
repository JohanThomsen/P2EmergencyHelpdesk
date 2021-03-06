//  Made by group SW2B2-20 from Aalborg unversity 
//  
//  Handles the map used to input the operative plans. 
//  Written as part of a 2nd semester project on AAU

const scale = 13;
let theMarker = {};


//map initialiser function
let primaryMap = mapInit(scale);

primaryMap.whenReady(() => {
    //attempt to fix grey box error caused by the leaflet api code.
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

//fromClick is true if the coordinates are from clicking the map
async function markerUpdate(coords, fromClick){

    if (await validateInsideBuilding(coords) === true){
        
        if (fromClick === true){
            inputToField(coords[1].toFixed(7), coords[0].toFixed(7));
        }
        //displays error message and disables submit button if coordinates are invalid
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

    let validation = await fetch('/validateInside', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({coords: coords})
      })
    .then((response) => response.json())
    .then((json) => {
        //either shows or removes polygon depending on fetch result. 
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

    //returns validation 
    if (validationSuccess){
        return true;
    }
    return false; 
}

function inputToField(coordX, coordY){
    //inputs coordinates from clicking map into text fields
    coordYField = document.getElementById('ncoordinate');
    coordXField = document.getElementById('ecoordinate');

    coordYField.value = coordY;
    coordXField.value = coordX;

}