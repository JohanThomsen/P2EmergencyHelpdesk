// Intro blurb, Code for Operative Plan GIS site, using leaflet
// Written as part of a 2nd semester project on AAU
const scale = 13;

// Leaflet copy-paste job, creates the map then gets the map from mapbox
let primaryMap = L.map("mapArea").setView([56.4321567, 8.1234567], scale);
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
        let outerElement = document.getElementById("strucPlan");
        outerElement.innerHTML = '<h3>Structure plan</h3>'; //Clears the outer element so no multiples appear with more clicks, while mainaining the header
        console.log(feature.geometry.coordinates);
        // Creates a paragraf for each attribute, with padding depending on the amount of attributes
        for(property in feature.properties) {
            let p = document.createElement("p");
            p.innerHTML = feature.properties[property];

            let attributeCount = Object.keys(feature.properties).length + 1;
            let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
            p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
            p.style.padding = "1px";

            outerElement.appendChild(p);

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
    let outerElement = document.getElementById("opPlan");
    outerElement.innerHTML = '<h3>Operative plan</h3>'; //Clears the outer element so no multiples appear with more clicks, while mainaining the header

    if (data) { // Checks whether the data arrived, if true, writes the information, otherwise displays an error message
        //Needs a full redesign, the properties layout does not fit the amount of data we need to display here, dropdowns are promising
        
        let p = document.createElement("p");
        p.innerHTML = data.opPlan.address;
        let attributeCount = Object.keys(data.opPlan).length + 1;
        console.log(attributeCount-1);
        let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
        p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
        p.style.padding = "1px";
    
        outerElement.appendChild(p);
        /* for(property in data.opPlan){
            let p = document.createElement("p");
            p.innerHTML = data.opPlan[property];
            console.log(data.opPlan);
            let attributeCount = Object.keys(data.opPlan).length + 1;
            console.log(attributeCount-1);
            let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
            p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
            p.style.padding = "1px";
    
            outerElement.appendChild(p);
        }   */   

    } else { // Styling could be improved, otherwise this section does its job
        let p = document.createElement("p");
        p.innerHTML = "Operative plan for this location not available";
        let attributeCount = 4;
        let padding = ((outerElement.clientHeight / attributeCount) - 18) / 2; // that 18(text height) is really scuffed, figure out a change if necessary
        p.style.margin = `${padding-1}px 2% ${padding-2}px 2%`; // -1 on both margin on account of padding, -1 on bottom because of border
        p.style.padding = "1px";
    
        outerElement.appendChild(p);
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

// Defines all the marker features
function markerFeatures(feature, layer){
    displayProperties(feature, layer);
    markerView(feature, layer);
    fetchPlan(feature, layer);
    
}

let acc = document.getElementsByClassName("accordion");

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    let panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}


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