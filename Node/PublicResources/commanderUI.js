// Intro blurb, Code for Operative Plan GIS site, using leaflet
// Written as part of a 2nd semester project on AAU

function fetchCommanders(){
    fetch("/commanderList")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            login(data);
        })
}


function login(data) {
    let commanderFound = false;
    let commander = {
        ID: "",
        coords: []
    };
    commander.ID = document.getElementById('logInID').value;
    for(id in data.commanders) {
        if (id === commander.ID){
            initCommanderHTML();
            commander.coords = data.commanders[id].coordinates;
            commanderFound = true;
        }
    }

    getAndShowPlan(commander, commanderFound);   
}

function initCommanderHTML(){
    document.getElementById('opPlan').style.marginRight="4%";
    document.getElementsByClassName('slideshow-container')[0].style.display="block";
    document.getElementsByClassName('buildingOverview-container')[0].style.display="block";
}

function getAndShowPlan(commander, commanderFound){
    if(commanderFound === true){
        fetchPlan(commander.coords);
        document.getElementById("ErrorMessage").innerHTML = ``;
    } else {
        document.getElementById("ErrorMessage").innerHTML = `Commander ID not found`;
    } 
}

const scale = 13;
let slideIndex = 1;

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
            displayPlan(data);
            displayImages(data.opPlan);
         });
}

function displayImages(data){
    
    if (data.floorPlanAmount != 0) {
        initImageHTML();
        let i;
        let slideAmount = data.floorPlanAmount;
        let floorPlanSource = data.floorPlans;
        for(i = 1; i <= slideAmount; i++){
            createFloorPlanHTML(i, slideAmount, floorPlanSource);
        }
        showSlides(slideIndex);
    } else {
        document.getElementById("slideshowContainer").innerHTML =
        `<h2> No floor plans found </h2>`
    }
    createBuildingOverViewHTML(data.buildingOverview);
}

function initImageHTML(){
    document.getElementById("slideshowContainer").innerHTML = 
    `<div class="imageContainer" id = "slideshow">
    </div>
    <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
    <a class="next" onclick="plusSlides(1)">&#10095;</a>`
}

function createFloorPlanHTML(imageIndex, slideAmount, floorPlanSource){
    document.getElementById("slideshow").innerHTML += 
            `<div class="mySlides">
                <div class="numbertext">${imageIndex} / ${slideAmount}</div>
                <img class="image" src="${floorPlanSource}floor-${imageIndex}.png">
                <div class="text">Floor Plan:</div>
            </div>`
}

function createBuildingOverViewHTML(imageSource){
    document.getElementById("buildingOverviewContainer").innerHTML += 
        `<div class="buildingOverview">
            <img class="image" src="buildingOverview/${imageSource}">
        </div>`
}

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i = 0;
    let slides = document.getElementsByClassName("mySlides");
    //let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    // for (i = 0; i < dots.length; i++) {
    //     dots[i].className = dots[i].className.replace(" active", "");
    // }
    slides[slideIndex-1].style.display = "block";
    //dots[slideIndex-1].className += " active";
}