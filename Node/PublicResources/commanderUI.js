// Intro blurb, Code for Operative Plan GIS site, using leaflet
// Written as part of a 2nd semester project on AAU

/* Calls the server for a list of all commanders.
 * Then passes that information on to the rest of the program
 */
let errorCode;
let commanderID;
function fetchCommanders(){
    fetch("/commanderList")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            login(data);
        })
}

/* Takes in a commander ID from the HTML input
 * Checks if it matches one from the list of commanders
 * If one is found HTML is created to show an operative plan
 */
function login(data) {
    let commanderFound = false;
    let commander = {
        ID: "",
        coords: []
    };
    commander.ID = document.getElementById('logInID').value;
    commanderID = commander.ID;
    for(id in data.commanders) {
        if (id === commander.ID){
            commander.coords = data.commanders[id].coordinates;
            if(commander.coords[0] == 0){
                commanderFound = false;
                errorCode = 0;
            } else {
                commanderFound = true;
            }
        }
    }

    getAndShowPlan(commander, commanderFound);   
}

/* Gets the operative plan from the server if commander was found, and if not an error message is displayed on the website */
function getAndShowPlan(commander, commanderFound){
    if(commanderFound === true){
        fetchPlan(commander.coords);
        document.getElementById("ErrorMessage").innerHTML = ``;
    } else {
        if (errorCode != 0){
            printErrors(1);
        } else {
            printErrors(0);
        }
    } 
}

const scale = 13;
let slideIndex = 1;

/* Gets the operative plan from the server,
 * then calls function which displaysa it on the website */
function fetchPlan(coordinates){
    let tempCoordX = coordinates[0];
    let tempCoordY = coordinates[1];
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
            if (typeof(data.opPlan.address) !== "undefined") {
                initCommanderHTML();
                displayPlan(data);
                displayImages(data.opPlan);
                console.log(data.BuildingMetaData.opCoords);
                displayResolveButton(data.BuildingMetaData.opCoords);
            } else {
                printErrors(2);
                resetHTML();
            }
         });
}

/* Creates HTML needed to show the commander an operative plan */
function initCommanderHTML(){
    document.getElementById('opPlan').style.marginRight="4%";
    document.getElementsByClassName('slideshow-container')[0].style.display="block";
    document.getElementsByClassName('buildingOverview-container')[0].style.display="block";
}

/* Resets the HTML if no operative plan was found */
function resetHTML(){
    document.getElementById('opPlan').style.marginRight="36.5%";
    document.getElementsByClassName('slideshow-container')[0].style.display="none";
    document.getElementsByClassName('buildingOverview-container')[0].style.display="none";
    document.getElementById("buildingOverviewContainer").innerHTML = "";
    document.getElementById("slideshowContainer").innerHTML = "";
    initHTML();
}

/* Displays the various images used on the website */
function displayImages(opPlan){
    if (opPlan.floorPlanAmount != 0) {
        let i;
        let slideAmount = opPlan.floorPlanAmount;
        initImageHTML(slideAmount);
        let floorPlanSource = opPlan.floorPlans;
        for(i = 1; i <= slideAmount; i++){
            createFloorPlanHTML(i, slideAmount, floorPlanSource);
        }
        showSlides(slideIndex);
    }
    createBuildingOverViewHTML(opPlan.buildingOverview);
}

/* Creates the empty HTML tags needed to show the slideshow of floorplans images */
function initImageHTML(slideAmount){
    document.getElementById("slideshowContainer").innerHTML = 
    `<div class="imageContainer" id = "slideshow">
    </div>`
    if (slideAmount != 1) {
        document.getElementById("slideshowContainer").innerHTML += 
        `<a class="prev" onclick="plusSlides(-1)">&#10094;</a>
        <a class="next" onclick="plusSlides(1)">&#10095;</a>`
    }
}

/* Fills in the images into the empty tags with the source of the images */
function createFloorPlanHTML(imageIndex, slideAmount, floorPlanSource){
    document.getElementById("slideshow").innerHTML += 
        `<div class="mySlides">
            <div class="numbertext">${imageIndex} / ${slideAmount}</div>
            <img class="image" src="${floorPlanSource}floor-${imageIndex}.png">
            <div class="text">Floor Plan:</div>
        </div>`
}

/* Creates the HTML needed to dispaly the buildingOverview */
function createBuildingOverViewHTML(imageSource){
    document.getElementById("buildingOverviewContainer").innerHTML = 
        `<div class="buildingOverview">
            <img class="image" src="buildingOverview/${imageSource}">
        </div>`
}

function displayResolveButton(coordinates){
    console.log(coordinates);
    document.getElementById("resolveFire").innerHTML = 
    `<button type="button" id = "resolveButton" onclick="resolveFire([${coordinates}])">Resolve Fire</button>`
}

function resolveFire(coordinates){
    console.log(coordinates);
    let flippedCoordinates = coordinates.reverse();
    postFire(flippedCoordinates, null, null, null, false);
    removeFireFromCommander(commanderID);
    location.reload();
}

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

/* Handles the slideshow */
function showSlides(n) {
    let i = 0;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "block";
}

function printErrors(errorCode){
    switch (errorCode) {
        case 0:
            document.getElementById("ErrorMessage").innerHTML = `Operative Plan Resolved`;
            break;
        
        case 1:
            document.getElementById("ErrorMessage").innerHTML = `Commander ID not found`;
            break;
    
        case 2:
            document.getElementById("ErrorMessage").innerHTML = "No operative plan found for commander";
            break;
        default:
            break;
    }
}