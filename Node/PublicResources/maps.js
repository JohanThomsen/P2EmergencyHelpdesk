// Intro blurb, Code for Operative Plan GIS site, using leaflet
// Written as part of a 2nd semester project on AAU
const scale = 13;
const fireIcon = L.icon({
      iconUrl: 'fireMarker.png',
      iconSize: [25, 50],
      iconAnchor: [12.5, 50]
    });
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

// Defines all the marker features
function markerFeatures(feature, layer){
    displayProperties(feature, layer);
    markerView(feature, layer);
    fetchPlan(feature, layer);
}
// Gets the building properties from the marker and displays them in the box
function displayProperties(feature, layer){
    layer.on('mousedown', (e) => {
        document.getElementById("fireinfo").innerHTML ="";
        //console.log(feature.geometry.coordinates);
        // Creates a paragraf for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            if (property == 'typeFire'){
                displayFire(feature.properties[property])
            } else if (property == "time"){
                displayTime(feature.properties[property])
            } else if (property == "automaticAlarm"){
                ifAutomaticAlarm(feature.properties[property])
            }
        }
    });
}

function displayFire(fire){
    let p = document.createElement("p");
    p.innerHTML = "Type of fire: " + fire;
    document.getElementById("fireinfo").appendChild(p);
}

function displayTime(time){
    let p = document.createElement("p");
    p.innerHTML = "Time: " + time;
    document.getElementById("fireinfo").appendChild(p);
}

function ifAutomaticAlarm(AlarmTrue){
    let p = document.createElement("p");
    p.innerHTML = AlarmTrue ?"Automatic alarm: Yes" : "";
    document.getElementById("fireinfo").appendChild(p);
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
function fetchPlan(feature, layer){
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
                updateInterface(data, currentViewedCoords, primaryMap)
            });
    });
}
// Gets the current fires, loads them onto the map with the display function on click
// Make this reload the fires live, websocket maybe?
fetchFireMarkers();

let geojsonLayer;
function fetchFireMarkers(){
    fetch("/fires")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        geojsonLayer = new L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: fireIcon});
            },
            onEachFeature: markerFeatures
        });
        geojsonLayer.addTo(primaryMap);
    });
};


function updateInterface(data, currentViewedCoords, primaryMap){
    displayPlan(data);
    initDropDown(currentViewedCoords);
    poly.removeFrom(primaryMap);
    displayPolygon(data);
}

let poly
poly = L.polygon([[0,0][0,0]]); //0,0 polygon to intialise polylayer to avoid clearing of "undefined" first time fetchPlan is run
function displayPolygon(data){
    let polyCoords = data.BuildingMetaData.polygon;
    polyCoords.forEach(element => {
        element.reverse();
    });
    
    poly = L.polygon(polyCoords);
    poly.addTo(primaryMap);
}

//Not need for the program but useful for developing. Delete before exam
primaryMap.on('click', function(e){
    let coord = e.latlng.toString().split(',');
    let lat = coord[0].split('(');
    let lng = coord[1].split(')');
    console.log("You clicked the map at latitude: [" + lng[0] + ", " + lat[1] + "]");
});

async function postFire(location, typeFire, time, automaticAlarm, active, id) {
    fetch('/fireAlert', {
        method: 'POST', body: JSON.stringify({
            location: location,
            typeFire: typeFire,
            time: time,
            automaticAlarm: automaticAlarm,
            active: active,
            id: id
        })
    })
}

//init dropdown with commanders 
async function initDropDown(currentViewedCoords){
    let response = await fetch("/commanderID.json");
    let data = await response.json();
    let commanderList = data.commanders;
    const keys = Object.keys(commanderList);
    dropDownElement = document.getElementById('myDropdown');
    htmlString = '';
    keys.forEach((element) => {
        htmlString += `<a href="#" onclick="assignCommander(${element}, [${currentViewedCoords}])">${commanderList[element].commanderName}</a>`;
    })
    dropDownElement.innerHTML = htmlString;
    document.getElementById('dropdownDiv').style.display = "block";
}



function assignCommander(id, fireCoords) {
    fetch('http://127.0.0.1:3000/assignCommander', {
        method: 'POST', body: JSON.stringify({
            commanderID: id,
            fireCoordinates: fireCoords
        })
    })
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
/*   for chat   */
let updateSocket = new WebSocket('ws://127.0.0.1:3000/update');

updateSocket.onopen = function (event) {
   
}

updateSocket.onmessage = function (event) {
    geojsonLayer.removeFrom(primaryMap);
    fetchFireMarkers();
}

updateSocket.onclose = function(event) {
    if (document.getElementById("warning")) document.getElementById("warning").remove();
    let p = document.createElement("p");
    p.innerHTML = "CONNECTION TO SERVER LOST";
    p.id = "warning";
    p.style.textAlign = "center";
    opPlan.insertBefore(p, opPlan.childNodes[2]);
  };

  
