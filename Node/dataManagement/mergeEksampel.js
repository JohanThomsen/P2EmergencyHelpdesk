let opPlanArray;
let newOpPlanOrg = {   
"coordinates": [56.7865567, 10],
"address": "Nyvej 123",
"buildingDefinition": "Factory",
"typeOfIncident":{
    "A": "Textile fire",
    "B": "Fluid fire",
    "C": "Gas fire",
    "D": "Metal fire",
    "E": "Electrical fire",
    "F": "Oil fire"
},
"consideration":{
    "values": "Inventory to save",
    "hazards": "Gas leak"
},
"fullOpPlan": "alt"
}
getOperativeData()
.then(()=>{
    opPlanArray.data = mergeSort(opPlanArray.data);
    //let updatedJSON = JSON.stringify(opPlanArray);
    binaryInput(newOpPlanOrg, opPlanArray.data, newOpPlanOrg.coordinates[0], newOpPlanOrg.coordinates[1]);
    let foundValue = binarySearch(opPlanArray.data, newOpPlanOrg.coordinates[0], newOpPlanOrg.coordinates[1]);
    console.log(foundValue);
    //console.log(opPlanArray);
})
.catch((Error) => {
    console.log(`Error: ${Error}`);
});


async function getOperativeData(){
    let opResult = await fetch(`dataBase.json`);
    opPlanArray = await opResult.json();
    console.log(opPlanArray);
}


function mergeSort (unsortedArray) {
    // No need to sort the array if the array only has one element or empty
    if (unsortedArray.length <= 1) {
        return unsortedArray;
    }
    // In order to divide the array in half, we need to figure out the middle
    const middle = Math.floor(unsortedArray.length / 2);
  
    // This is where we will be dividing the array into left and right
    const left = unsortedArray.slice(0, middle);
    const right = unsortedArray.slice(middle);
  
    // Using recursion to combine the left and right
    return merge(
        mergeSort(left), mergeSort(right)
    );
  }
  
  // Merge the two arrays: left and right
function merge (left, right) {
    let resultArray = [], leftIndex = 0, rightIndex = 0;
  
    // We will concatenate values into the resultArray in order
    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex].coordinates[0] < right[rightIndex].coordinates[0]) {
            resultArray.push(left[leftIndex]);
            leftIndex++; // move left array cursor
        } else { 
            resultArray.push(right[rightIndex]);
            rightIndex++; // move right array cursor
        }
    }
  
    // We need to concat to the resultArray because there will be one element left over after the while loop
    return resultArray
            .concat(left.slice(leftIndex))
            .concat(right.slice(rightIndex));
  }

function binarySearch(array, targetN, targetE){
    let startIndex = 0;
    let endIndex = array.length - 1;

    while (startIndex <= endIndex) {
        let middleIndex = Math.floor((startIndex + endIndex) / 2);

        if (targetN === array[middleIndex].coordinates[0]) {
            if (targetE === array[middleIndex].coordinates[1]){
                return array[middleIndex];
            }
        }
        if (targetN > array[middleIndex].coordinates[0]) {
            startIndex = middleIndex + 1;
        }
        if (targetN < array[middleIndex].coordinates[0]) {
            endIndex = middleIndex - 1;      
        }
    }
}


function binaryInput(newOpPlan, oldOpPlanArray, targetN, targetE){
    let startIndex = 0;
    let endIndex = oldOpPlanArray.length - 1;
    let middleIndex;
    //console.log(newOpPlan);
    let index;

    //First we do a binary search on the array, but instead of returning the value, we jump down ti input with middleindex saved.

    while (startIndex <= endIndex) {
        middleIndex = Math.floor((startIndex + endIndex) / 2);

        if (targetN === oldOpPlanArray[middleIndex].coordinates[0]) {
            if (targetE === oldOpPlanArray[middleIndex].coordinates[1]){
                break;
            }
        }
        if (targetN > oldOpPlanArray[middleIndex].coordinates[0]) {
            startIndex = middleIndex + 1;
        }
        if (targetN < oldOpPlanArray[middleIndex].coordinates[0]) {
            endIndex = middleIndex - 1;      
        }
    }

    //Here the new opPlan is inputted by starting with the middle index and finding the exact position for the new OpPlan
    //And inserting it by placing itin the correct position and then shifting all values after so it fits.

    /*console.log(middleIndex);
    console.log(targetN);
    console.log(oldOpPlanArray[middleIndex].coordinates[0]);*/
    if (targetN > oldOpPlanArray[middleIndex].coordinates[0]) {
        for (let i = middleIndex; i < oldOpPlanArray.length; i++) {
            
            if (targetN <= oldOpPlanArray[middleIndex].coordinates[0]) {
                for (let j = oldOpPlanArray.length; j > i; j--) {
                    oldOpPlanArray[j+1] = oldOpPlanArray[j];   
                }
            } 
        index = i;
        break;
        }
    }

    if (targetN < oldOpPlanArray[middleIndex].coordinates[0]) {
        for (let i = middleIndex; i > 0; i--) {
            
            if (targetN <= oldOpPlanArray[i].coordinates[0]) {
                for (let j = oldOpPlanArray.length - 1 ; j >= i; j--) {
                    oldOpPlanArray[j+1] = oldOpPlanArray[j];
                    
                }
                
            }    
        index = i;
        break;
        }
    }
    oldOpPlanArray[index] = newOpPlan
    //console.log(opPlanArray);
}


