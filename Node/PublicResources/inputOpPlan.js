function sendData(){
    let form = document.getElementById('opPlanForm');
    let formData = new FormData(document.getElementById('opPlanForm'));
    console.log(formData);
    
    let newOpPlan = {
        opPlanId: document.getElementById('opPlanId'),
        coordinates: [document.getElementById('ncoordinate').value, document.getElementById('ecoordinate').value],
            address: document.getElementById('address').value,
            buildingDefinition:{
                        Usage:                document.getElementById('usage').value,
                        height:               document.getElementById('height').value,
                        specialConsideration: document.getElementById('specialConsiderations').value
            },
            firefightingEquipment:{
                fireLift:               document.getElementById('fireLift').checked,
                escapeStairs:           document.getElementById('escapeStairs').checked,
                risers:                 document.getElementById('risers').checked,
                sprinkler:              document.getElementById('sprinkler').checked,
                smokeDetectors:         document.getElementById('smokeDetector').checked,
                markers:                document.getElementById('markers').checked,
                automaticFireDetector:  document.getElementById('automaticFireDetector').checked,
                internalAlert:          document.getElementById('internalAlert').checked
            },
            consideration: document.getElementById('considerations').value,
            //fullOpPlan:document.getElementById('fullOpPlan').files[0].name
    }
    console.log(newOpPlan);
    handleFormData(newOpPlan);
}

async function handleFormData(opPlan) {
    fetch('http://127.0.0.1:3000/addOpPlan', {method:'POST', body: JSON.stringify(opPlan)})
    console.log(OpPlan);
}
    