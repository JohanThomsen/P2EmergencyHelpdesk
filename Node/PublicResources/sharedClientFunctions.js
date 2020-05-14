/* Takes in the operative plan from the server.
 * then displays the information from that operative plan on the website
 */
function displayPlan(data){
    opPlanHTML = document.getElementById("opPlan");
    initHTML();

     // Checks whether the data arrived, if true, writes the information, otherwise displays an error message
    if (data) {
        displayOpPlanHTML(data, opPlanHTML);
        outerAccordion = document.getElementById("Nearby");
        checkForNearbyWarnings(data);
        enableAccordion();
        if (data.opPlan.fullOpPlan){
            createDownloadLink(data.opPlan.fullOpPlan);     
        }
        
    } else { // Creates the warning if there is no operative plan available
        noDownloadLinkWarning()  
    }

}

/* Initializes the needed HTML to show the operative plan,
 * and cleans up so any previous operative plans shown are removed */
function initHTML(){
    document.getElementById("Generel").innerHTML = "";
    document.getElementById("Equip").innerHTML = "";
    document.getElementById("Nearby").innerHTML = "";
    if (document.getElementById("address")) document.getElementById("address").remove();
    if (document.getElementById("warning")) document.getElementById("warning").remove();
    if (document.getElementById("pdf")) document.getElementById("pdf").remove(); 
}

/* Displays the text from the operative plan */
function displayOpPlanHTML(data, opPlanHTML){
    for (property in data.opPlan){
        if (property == "address"){
            displayAddress(data, opPlanHTML);
        } else if (property == "buildingDefinition" || 
                   property == "usage"              || 
                   property == "height"             || 
                   property == "specialConsiderations"){
            displayGenerel(data, property);
        } else if (property.toLowerCase() == "firefightingequipment"){
            displayEquip(data, property);
        }
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

//Displays the various firefihting equipment from the operative plan
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

// Creates nearby warnings if a special consideration exists for any of the nearby buildings
// Prints the address of the warning, and the special consideration
function checkForNearbyWarnings(data){
    let nearbyconsideration = false;
    data.NearbyWarnings.forEach(warning => {
        for (element in warning){
            if (element == "specialConsiderations") {
                nearbyconsideration = true;
            }
        }
    })

    if (nearbyconsideration === true){
        displayNearbyWarnings(data.NearbyWarnings);  
    }
}

/* Takes in the nearby warnings and creates the html for them */
function displayNearbyWarnings(NearbyWarnings){
    for (property in NearbyWarnings){
        let button = document.createElement("button");
        button.className = "accordion";
        button.innerHTML = NearbyWarnings[property].address;
        outerAccordion.appendChild(button);

        let accordion = document.createElement("div");
        accordion.className = "panel";
        accordion.id = NearbyWarnings[property].address;
        outerAccordion.appendChild(accordion);
        
        writeOutWarning(NearbyWarnings[property])   
    }
}

/* Writes out the nearbywarning to the website */
function writeOutWarning(property){
    for (element in property){
        if (element == "specialConsiderations"){
            let p = document.createElement("p");
            p.innerHTML = element.capitalize() + ": " + property[element];
            document.getElementById(property.address).appendChild(p);
        }
    }
}

// Creates the download link for the opPlan
function createDownloadLink(PDFpath){
    let a = document.createElement("a");
    a.href = PDFpath;
    a.download = "Full operative plan";
    a.innerHTML = "Full operative plan";
    a.id = "pdf"
    opPlan.insertBefore(a, opPlan.childNodes[3]);
}  

/* Displays a warning on the website if no operative plans download is available */
function noDownloadLinkWarning(){
    if (document.getElementById("warning")){
        document.getElementById("warning").remove();
    } 
    let p = document.createElement("p");
    p.innerHTML = "Operative plan for this location not available";
    p.id = "warning";
    p.style.textAlign = "center";
    opPlan.insertBefore(p, opPlan.childNodes[2]);
}

// After possibly creating/removing accordions for nearby warnings, all accordions must be event enabled to work
function enableAccordion(){
    let acc = document.getElementsByClassName("accordion");

    for (let i = 0; i < acc.length; i++) {
    acc[i].removeEventListener("click", toggleActive);
    acc[i].addEventListener("click", toggleActive);
    }
}

/* Toggle between adding and removing the "active" class,
 * to highlight the button that controls the panel */
function toggleActive() {
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

/* Posts a fire to the server*/
async function postFire(location, typeFire, time, automaticAlarm, active) {
    console.log(location);
    fetch('/fireAlert', {
        method: 'POST', body: JSON.stringify({
            location: location,
            typeFire: typeFire,
            time: time,
            automaticAlarm: automaticAlarm,
            active: active
        })
    })
}

/* Sends the operative plan to a commander, by linking fire coordinates
 * with the coordinates of the fire */
function assignCommander(id, fireCoords, fireID, name) {
    fetch('http://127.0.0.1:3000/assignCommander', {
        method: 'POST', body: JSON.stringify({
            commanderID: id,
            fireCoordinates: fireCoords,
            fireID: fireID
        })
    })
    .then((response => {
        if (response.status == 405) {
            printErrors(3);
        } else {
            document.getElementById('assignedCommanders').innerHTML += 
            `${name} <br>`
        }
    })) 
}


/* From stackoverflow by Steve Hansell
 * Function added to the string prototype that capitalizes a string */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
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
        
        case 3:
            document.getElementById("assignedCommanders").innerHTML += " Commander already dispatched";
        default:
            break;
    }
}