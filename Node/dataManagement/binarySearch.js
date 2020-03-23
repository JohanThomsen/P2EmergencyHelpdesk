let array2 = [2,4,6,8,11,22,33,44,55,66,69,77,88,99,111,222,333,420,444,555,666,777,888,999,9999];
let foundValue = binarySearch(array2,93);
console.log(foundValue);
let opPlanArray;

function binarySearch(array, target){
    let startIndex = 0;
    let endIndex = array.length - 1;
    let middleIndex;

    while (startIndex <= endIndex) {
        middleIndex = Math.floor((startIndex + endIndex) / 2);

        if (target === array[middleIndex]) {
            console.log("found");
            return array[middleIndex];
        }
        if (target > array[middleIndex]) {
            startIndex = middleIndex + 1;
            console.log("searching right side");
        }
        if (target < array[middleIndex]) {
            endIndex = middleIndex - 1;
            console.log("searching left side");        
        }
    }
    console.log("target value not found" + middleIndex);
}


async function getOperativeData(){
    let opResult = await fetch(`dataBase.json`);
     opPlanArray = await opResult.json();
    
}

getOperativeData().then(() => {
    console.log(opPlanArray);
})
