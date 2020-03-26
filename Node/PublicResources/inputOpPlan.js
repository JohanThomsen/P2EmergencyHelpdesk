function sendData(){
    let form = document.getElementById('opPlanForm');
    let formData = new FormData(document.getElementById('opPlanForm'));
    console.log(formData);
    
    let newOpPlan = {
        coordinates: [document.getElementById('ncoordinate').value, document.getElementById('ecoordinate').value],
            address:document.getElementById('address').value,
            buildingDefinition:{
                        Usage: document.getElementById('usage').value,
                        height: document.getElementById('height').value,
                        specialConsideration: document.getElementById('specialConsiderations').value
            },
            firefightingEquipment:{
                fireLift: document.getElementById('fireLift').value,
                escapeStairs: document.getElementById('escapeStairs').value,
                risers: document.getElementById('risers').value,
                sprinkler: document.getElementById('sprinkler').value,
                smokeDetectors: document.getElementById('smokeDetector').value,
                markers: document.getElementById('markers').value,
                automaticFireDetector: document.getElementById('automaticFireDetector').value,
                internalAlert: document.getElementById('internalAlert').value
            },
            consideration: document.getElementById('considerations').value,
            //fullOpPlan:
    }
    console.log(newOpPlan);
}