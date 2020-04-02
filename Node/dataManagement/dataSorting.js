let opPlanArray;

//lets other files access these functions
module.exports = {mergeSort, binarySearch, binaryInput};

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

// inputs an operative plan in the correct position in the sorted array
function binaryInput(newOpPlan, oldOpPlanArray, targetN, targetE){
    let startIndex = 0;
    let endIndex = oldOpPlanArray.length - 1;
    let middleIndex;
    let index;

    /* the array is searched using binary search
     * when the value is found it is not returned
     * the value is approx. the right placement for the new value
     */
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

    /* The new operative plan is inputted via the middle index
     * from there the exact position for the plan is found and it is inputted
     * the other values the shifts one position to give space
     */ 
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
    oldOpPlanArray[index] = newOpPlan;
    return oldOpPlanArray;
    //console.log(opPlanArray);
}


