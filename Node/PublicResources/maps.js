// Intro blurb, Code for Operative Plan GIS site, using leaflet
// Written as part of a 2nd semester project on AAU

const scale = 13;

// Details for the icon used on the fires
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

// Gets the building properties from the marker and displays them in the box
function displayProperties(feature, layer){
    layer.on('mousedown', (e) => {
        document.getElementById("fireinfo").innerHTML ="";
        //console.log(feature.geometry.coordinates);
        // Creates a paragraf for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            if (property == 'typeFire'){
                let p = document.createElement("p");
                p.innerHTML = "Type of fire: " + feature.properties[property];
                document.getElementById("fireinfo").appendChild(p);
            } else if (property == "time"){
                let p = document.createElement("p");
                p.innerHTML = "Time: " + feature.properties[property];
                document.getElementById("fireinfo").appendChild(p);
            } else if (property == "automaticAlarm"){
                let p = document.createElement("p");
                p.innerHTML = feature.properties[property] ?"Automatic alarm: Yes" : "";
                document.getElementById("fireinfo").appendChild(p);
            }
            

        }
    });
}

// Gets the current fires, loads them onto the map with the display function on click
// Make this reload the fires live, websocket maybe?
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


fetchFireMarkers();
//Gets the operative plan data, and calls displayPlan with the appropriate response
function fetchPlan(feature, layer){
    layer.on("mousedown", (e) => {
        let tempCoordX = feature.geometry.coordinates[0];
        let tempCoordY = feature.geometry.coordinates[1];
        let stringedCoord = String(tempCoordY) + "_" + String(tempCoordX);
        stringedCoord = stringedCoord.replace(/[.]/g,";");//replaces ALL . with ;
        //console.log(stringedCoord);

        //Checks whether data was present, otherwise returns false, could maybe be done with error handling, but seems unnecessary
        fetch(`/operativePlans=${stringedCoord}`)
            .then((response) => {
                if (response.status == 404) {
                    return false;
                } else return response.json();              
            })
            .then((data) => {
                displayPlan(data);
                displayPolygon(data);
            });
        });
}

function displayPolygon(data){
    let polyCoords = data.BuildingMetaData.polygon;
    let poly
    polyCoords.forEach(element => {
        element.reverse();
    });
    console.log("Data + polygon array: ");
    console.log(data);
    console.log(data.BuildingMetaData.polygon);    //test of array with polygons
//  polyCoords = [[9.932281699291654, 57.04652291941613],[10, 58],[11, 58]]/*data.BuildingMetaData.polygon*/;
    poly = L.polygon(polyCoords);
    poly.removeFrom(primaryMap);
    poly.addTo(primaryMap);
}

// Is functional, but the actual plans, when available, need redesign
function displayPlan(data){
    //console.log(data);
    let opPlan = document.getElementById("opPlan");
    document.getElementById("Generel").innerHTML = "";
    document.getElementById("Equip").innerHTML = "";
    document.getElementById("Nearby").innerHTML = "";
    if (document.getElementById("address")) document.getElementById("address").remove();
    if (document.getElementById("warning")) document.getElementById("warning").remove();
    if (document.getElementById("pdf")) document.getElementById("pdf").remove();

    if (data) { // Checks whether the data arrived, if true, writes the information, otherwise displays an error message
        for (property in data.opPlan){
            if (property == "address"){
                displayAddress(data, opPlan);
            } else if (property == "buildingDefinition" || property == "usage" || property == "height" || property == "specialConsideration"){
                displayGenerel(data, property);
            } else if (property.toLowerCase() == "firefightingequipment"){
                displayEquip(data, property);
            }
        }

        // Creates nearby warnings if a special consideration exists for any of the nearby buildings
        // Prints the address of the warning, and the special consideration
        outerAccordion = document.getElementById("Nearby");
        let nearbyconsideration;
        for (element in data.NearbyWarnings[property]){
            if (element == "specialConsideration") {nearbyconsideration = true;}
        }
        if (nearbyconsideration == true){
            for (property in data.NearbyWarnings){
                let button = document.createElement("button");
                button.className = "accordion";
                button.innerHTML = data.NearbyWarnings[property].address;
                outerAccordion.appendChild(button);
    
                let accordion = document.createElement("div");
                accordion.className = "panel";
                accordion.id = data.NearbyWarnings[property].address;
                outerAccordion.appendChild(accordion);
                
                for (element in data.NearbyWarnings[property]){
                    if (element == "specialConsideration"){
                        let p = document.createElement("p");
                        p.innerHTML = element.capitalize() + ": " + data.NearbyWarnings[property][element];
                        document.getElementById(data.NearbyWarnings[property].address).appendChild(p);
                    }
                }
            }
        }
        // After possibly creating/removing accordions for nearby warnings, all accordions must be event enabled to work
        enableAccordion();

        // Creates the download link for the opPlan
        if (data.opPlan.fullOpPlan){
            let a = document.createElement("a");
            a.href = data.opPlan.fullOpPlan;
            a.download = "Full operative plan";
            a.innerHTML = "Full operative plan";
            a.id = "pdf"
            opPlan.insertBefore(a, opPlan.childNodes[3]);
        }
        
    } else { // Creates the warning if there is no operative plan available
        if (document.getElementById("warning")) document.getElementById("warning").remove();
        let p = document.createElement("p");
        p.innerHTML = "Operative plan for this location not available";
        p.id = "warning";
        p.style.textAlign = "center";
        opPlan.insertBefore(p, opPlan.childNodes[2]);
    }

}

//Displays the address of the clicked fire at the top
function displayAddress(data, outerElement){
    let p = document.createElement("p");
    p.innerHTML = data.opPlan.address;
    p.style.textAlign = "center";
    p.id = "address";
    outerElement.insertBefore(p, outerElement.childNodes[2]);
}

// Displays all the generel data for the fire in the relevant accordion
function displayGenerel(data, property){
    let p = document.createElement("p");
    p.innerHTML = property.capitalize() + ": " + data.opPlan[property];
    document.getElementById("Generel").appendChild(p);
}

// 
function displayEquip(data, property){
    for (item in data.opPlan[property]){
        if (data.opPlan[property][item] == true){
        let p = document.createElement("p");
        p.innerHTML = item.capitalize();
        document.getElementById("Equip").appendChild(p);
    }}
    let p = document.createElement("p");
    p.innerHTML = "Consideration: " + data.opPlan.consideration;
    document.getElementById("Equip").appendChild(p);
}

// From stackoverflow by Steve Hansell
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Zooms in on the marker when it is clicked on
function markerView(feature, layer){
    layer.on("mousedown", (e) => {
        let coordX = feature.geometry.coordinates[0];
        let coordY = feature.geometry.coordinates[1];
        primaryMap.flyTo([coordY,coordX], scale+3);
    });
}

// Defines all the marker features
function markerFeatures(feature, layer){
    displayProperties(feature, layer);
    markerView(feature, layer);
    fetchPlan(feature, layer);
    
}

function enableAccordion(){
    let acc = document.getElementsByClassName("accordion");

    for (let i = 0; i < acc.length; i++) {
    acc[i].removeEventListener("click", toggleActive);
    acc[i].addEventListener("click", toggleActive);
    }
}

function toggleActive() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");
    /* Toggle between hiding and showing the active panel */
    let panel = this.nextElementSibling;
    if (panel.style.display === "none") {
    panel.style.display = "block";
    } else {
    panel.style.display = "none";
    }
}

enableAccordion();

async function postFire(location, typeFire, time, automaticAlarm, active, id) {
    fetch('http://127.0.0.1:3000/fireAlert', {
        method: 'POST', body: JSON.stringify({
            location: location,
            typeFire: typeFire,
            time: time,
            automaticAlarm: automaticAlarm,
            active: active,
            id: id
        })
    })
    console.log('Message');
}

async function getFire() {
    let response = await fetch("http://127.0.0.1:3000/fires");
    let data = await response.json();
    //console.log(data);
}

/*Websocket code*/
/*   for chat   */
let updateSocket = new WebSocket('ws://127.0.0.1:3000/chat');

updateSocket.onopen = function (event) {
    
}

updateSocket.onmessage = function (event) {
    
    console.log("PING");
    geojsonLayer.removeFrom(primaryMap);
    fetchFireMarkers();

}