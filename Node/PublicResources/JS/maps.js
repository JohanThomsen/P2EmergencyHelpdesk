//  Made by group SW2B2-20 from Aalborg unversity 
//  
//  Interactive GIS leaflet map for the operator page.
//  Written as part of a 2nd semester project on AAU


const scale = 13;
const fireIcon = L.icon({
      iconUrl: 'fireMarker.png',
      iconSize: [25, 50],
      iconAnchor: [12.5, 50]
    });

//map initialiser function
let primaryMap = mapInit(scale);

let geoJSONLayer;
/* Gets the locations of the fires from the server and places icons on the map */
function fetchFireMarkers(){
    fetch("/fires")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        geoJSONLayer = new L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: fireIcon});
            },
            onEachFeature: markerFeatures
        });
        geoJSONLayer.addTo(primaryMap);
    });
};

// Defines all the marker features
function markerFeatures(feature, layer){
    displayProperties(feature, layer);
    markerView(feature, layer);
    fetchPlan(feature, layer, feature.properties.id);
    
}
// Gets the building properties from the marker and displays them in the box
function displayProperties(feature, layer){

    layer.on('mousedown', (e) => {
        document.getElementById("commanderWarning").innerHTML = "";
        document.getElementById("fireinfo").innerHTML ="";
        // Creates a paragraph for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            if (property === 'typeFire'){
                displayFire(feature.properties[property])
            } else if (property === "time"){
                displayTime(feature.properties[property])
            } else if (property === "automaticAlarm"){
                ifAutomaticAlarm(feature.properties[property])
            } else if (property === "assignedCommanders") {
                displayAssignedCommander(feature.properties[property])
            }
        }
    });
}

/* Writes out the fire info onto the website */
function displayFire(fire){
    let p = document.createElement("p");
    p.innerHTML = "Type of fire: " + fire;
    document.getElementById("fireinfo").appendChild(p);
}

/* Writes out the time on the website */
function displayTime(time){
    let p = document.createElement("p");
    p.innerHTML = "Time: " + time;
    document.getElementById("fireinfo").appendChild(p);
}

/* Writes out whether or not the fire swas sent by an automated alarm or not */
function ifAutomaticAlarm(AlarmTrue){
    let p = document.createElement("p");
    p.innerHTML = AlarmTrue ?"Automatic alarm: Yes" : "";
    document.getElementById("fireinfo").appendChild(p);
}

async function displayAssignedCommander(commanderArray){
    let response = await fetch("/commanderList");
    let data = await response.json();
    let commanderList = data.commanders;
    document.getElementById("assignedCommanders").innerHTML = "";
    for (let index = 0; index < commanderArray.length; index++) {
        document.getElementById('assignedCommanders').innerHTML += 
        `${commanderList[commanderArray[index]].commanderName}  ${commanderArray[index]}<br>`  
    }
}

// Zooms in on the marker when it is clicked on
function markerView(feature, layer){
    layer.on("mousedown", (e) => {
        let coordX = feature.geometry.coordinates[0];
        let coordY = feature.geometry.coordinates[1];
        primaryMap.flyTo([coordY,coordX], scale+3);
    });
}

//Gets the operative plan data, and calls displayPlan with the appropriate response
function fetchPlan(feature, layer, fireID){
    layer.on("mousedown", (e) => {
        let tempCoordX = feature.geometry.coordinates[0];
        let tempCoordY = feature.geometry.coordinates[1];
        let currentViewedCoords = [tempCoordX, tempCoordY];
        let stringedCoord = String(tempCoordY) + "_" + String(tempCoordX);
        stringedCoord = stringedCoord.replace(/[.]/g,";");//replaces ALL . with ;

        //Checks whether data was present, otherwise returns false, could maybe be done with error handling, but seems unnecessary
        fetch(`/operativePlans=${stringedCoord}`)
            .then((response) => {
                if (response.status == 404) {
                    return false;
                } else return response.json();              
            })
            .then((data) => {
                updateInterface(data, currentViewedCoords, primaryMap, fireID)
            });
    });
}
// Gets the current fires, loads them onto the map with the display function on click
fetchFireMarkers();

// let geoJSONLayer;
/* Gets the locations of the fires from the server and places icons on the map */
function fetchFireMarkers(){
    fetch("/fires")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        geoJSONLayer = new L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: fireIcon});
            },
            onEachFeature: markerFeatures
        });
        geoJSONLayer.addTo(primaryMap);
    })
    .then(() => {
        let markers = document.getElementsByClassName("leaflet-marker-pane")[0].children;
        markerArray = Array.from(markers);
        markerArray.forEach((element, index)=>{
            element.setAttribute("id", "fire"+index);
        });
    })
   
};


//Not need for the program but useful for developing. Delete before exam
primaryMap.on('click', function(e){
    let coord = e.latlng.toString().split(',');
    let lat = coord[0].split('(');
    let lng = coord[1].split(')');
    console.log("You clicked the map at latitude: [" + lng[0] + ", " + lat[1] + "]");
});

/* Updates the interface by displaying the operative plan,
 * initializing the dropdown menu for commanders and if possible,
 * displays a polygon for current building */
function updateInterface(data, currentViewedCoords, primaryMap, fireID){
    displayPlan(data);
    initDropDown(currentViewedCoords, fireID);
    poly.removeFrom(primaryMap);
    if (data.BuildingMetaData.fileIndex != -1){
        displayPolygon(data);
    }
}

//init dropdown with commanders 
async function initDropDown(currentViewedCoords, fireID){
    let response = await fetch("/commanderList");
    let data = await response.json();
    let commanderList = data.commanders;
    const keys = Object.keys(commanderList);
    dropDownElement = document.getElementById('myDropdown');
    htmlString = '';
    keys.forEach((element) => {
        htmlString += `<a href="#" id="${commanderList[element].commanderName}" onclick="assignCommander(${element},
                                               [${currentViewedCoords}], 
                                                ${fireID}, 
                                                '${commanderList[element].commanderName}',
                                                 ${element})">
                                                ${commanderList[element].commanderName}</a>`;
    })
    dropDownElement.innerHTML = htmlString;
    document.getElementById('dropdownDiv').style.display = "block";
}


let poly
poly = L.polygon([[0,0][0,0]]); 
//0,0 polygon to intialise polylayer to avoid clearing of "undefined" first time fetchPlan is run
/* Creates the polygon the inputted data exists in 
 * then displays it on the map.
 */
function displayPolygon(data){
    let polyCoords = data.BuildingMetaData.polygon;
    polyCoords.forEach(element => {
        element.reverse();
    });
    
    poly = L.polygon(polyCoords);
    poly.addTo(primaryMap);
}

//drop down menu control 
/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function dropDown() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  
// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.commanderdropbtn')) {
        let dropdowns = document.getElementsByClassName("commanderdropdown-content");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}



/*Websocket code*/
/* Opening a websocket that allows for live updating of the map, when a new fire comes in */
let updateSocket = new WebSocket('ws://127.0.0.1:3000/update');

updateSocket.onopen = function (event) {
   
}

updateSocket.onmessage = function (event) {
    let updateData = JSON.parse(event.data);
    console.log(updateData.message);
    geoJSONLayer.removeFrom(primaryMap);
    fetchFireMarkers();
}

updateSocket.onclose = function(event) {
    if (document.getElementById("connectionWarning")) document.getElementById("connectionWarning").remove();
    let p = document.createElement("p");
    p.innerHTML = "CONNECTION TO SERVER LOST";
    p.id = "connectionWarning";
    p.style.textAlign = "center";
    opPlan.insertBefore(p, opPlan.childNodes[2]);
  };