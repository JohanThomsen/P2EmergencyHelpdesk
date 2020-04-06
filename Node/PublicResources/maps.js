// Intro blurb, Code for Operative Plan GIS site, using leaflet
// Written as part of a 2nd semester project on AAU
const scale = 13;
9.9189, 57.05016// Leaflet copy-paste job, creates the map then gets the map from mapbox
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
        console.log(feature.geometry.coordinates);
        // Creates a paragraf for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            let p = document.createElement("p");
            p.innerHTML = feature.properties[property];

            // let attributeCount = Object.keys(feature.properties).length + 1;
            // let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
            // p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
            // p.style.padding = "1px";

            document.getElementById("fireinfo").appendChild(p);

        }
    });
}

// Gets the current fires, loads them onto the map with the display function on click
// Make this reload the fires live, websocket maybe?
fetch("/fires")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let geojsonLayer = new L.geoJSON(data, {
            onEachFeature: markerFeatures
        });

        geojsonLayer.addTo(primaryMap);
    });

//Gets the operative plan data, and calls displayPlan with the appropriate response
function fetchPlan(feature, layer){
    layer.on("mousedown", (e) => {
        let tempCoordX = feature.geometry.coordinates[0];
        let tempCoordY = feature.geometry.coordinates[1];
        let stringedCoord = String(tempCoordY) + "_" + String(tempCoordX);
        stringedCoord = stringedCoord.replace(/[.]/g,";");//replaces ALL . with ;
        console.log(stringedCoord);

        //Checks whether data was present, otherwise returns false, could maybe be done with error handling, but seems unnecessary
        fetch(`/operativePlans=${stringedCoord}`)
            .then((response) => {
                if (response.status == 404) {
                    return false;
                } else return response.json();              
            })
            .then((data) => {
                displayPlan(data);
            });
        });
}

// Is functional, but the actual plans, when available, need redesign
function displayPlan(data){
    let opPlan = document.getElementById("opPlan");
    document.getElementById("Generel").innerHTML = "";
    document.getElementById("Equip").innerHTML = "";
    document.getElementById("Nearby").innerHTML = "";
    if (document.getElementById("address")) document.getElementById("address").remove();
    if (document.getElementById("warning")) document.getElementById("warning").remove();

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

        outerAccordion = document.getElementById("Nearby");
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
                if (element == "buildingDefinition" || element ==  "usage" || element == "specialConsideration"){
                    let p = document.createElement("p");
                    p.innerHTML = element.capitalize() + " = " + data.NearbyWarnings[property][element];
                    document.getElementById(data.NearbyWarnings[property].address).appendChild(p);
                }
            }
        }
        enableAccordion();

    } else { // Styling could be improved, otherwise this section does its job
        if (document.getElementById("warning")) document.getElementById("warning").remove();
        let p = document.createElement("p");
        p.innerHTML = "Operative plan for this location not available";
        p.id = "warning";
        p.style.textAlign = "center";
        opPlan.insertBefore(p, opPlan.childNodes[2]);
    }

}

function displayAddress(data, outerElement){
    let p = document.createElement("p");
    p.innerHTML = data.opPlan.address;
    p.style.textAlign = "center";
    p.id = "address";
    outerElement.insertBefore(p, outerElement.childNodes[2]);
}

function displayGenerel(data, property){
    let p = document.createElement("p");
    p.innerHTML = property.capitalize() + " = " + data.opPlan[property];
    document.getElementById("Generel").appendChild(p);
}

function displayEquip(data, property){
    for (item in data.opPlan[property]){
        if (data.opPlan[property][item] == true){
        let p = document.createElement("p");
        p.innerHTML = item.capitalize() + " = available";
        document.getElementById("Equip").appendChild(p);
    }}
    let p = document.createElement("p");
    p.innerHTML = "Consideration = " + data.opPlan.consideration;
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
    console.log(data);
}