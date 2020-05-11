/*const functions = {
    displayPlan: (data) => displayPlan(data),
    enableAccordion: () => enableAccordion(),
    toggleActive: () => toggleActive()
};
// Details for the icon used on the fires
module.exports = {displayPlan, enableAccordion, toggleActive};*/

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

function initHTML(){
    document.getElementById("Generel").innerHTML = "";
    document.getElementById("Equip").innerHTML = "";
    document.getElementById("Nearby").innerHTML = "";
    if (document.getElementById("address")) document.getElementById("address").remove();
    if (document.getElementById("warning")) document.getElementById("warning").remove();
    if (document.getElementById("pdf")) document.getElementById("pdf").remove(); 
}

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
// Creates nearby warnings if a special consideration exists for any of the nearby buildings
// Prints the address of the warning, and the special consideration
function checkForNearbyWarnings(data){
    let nearbyconsideration = false;
    data.NearbyWarnings.forEach(warning => {
        for (element in warning){ //this needs to be fixed in another way
            if (element == "specialConsiderations") {
                nearbyconsideration = true;
            }
        }
    })

    if (nearbyconsideration === true){
        displayNearbyWarnings(data.NearbyWarnings);  
    }
}

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

// From stackoverflow by Steve Hansell
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}