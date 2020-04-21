const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const search = require('./dataManagement/dataSorting.js');
const checkPolygon = require('./checkPolygon.js');
const webSocketServer = require('websocket');

//server setup variables
const port = 3000;
const hostName = '127.0.0.1';
const publicResources = './node/PublicResources/';

//HTTP server
let server = http.createServer((request, response) => {
  //Cases for GET request 
    if (request.method == 'GET') {
        switch (request.url) {
            case '/': 
                fileResponse('index.html', response);
            break; 

            case '/uploadOP': 
            fileResponse('opPlanInput.html', response);
            break; 

            case '/fires':
                fileResponse('currentFires.geojson', response);
            break;

            case (request.url.match(/^\/operativePlans=\d{1,};\d{1,}_\d{1,};\d{1,}$/) || {}).input:
                sendOperativePlan('./Node/Data/dataBase.json', request.url, response);
            break;

            case ('/buildings'):
                fs.readFile('./Node/Buildingsgeojson', (err, data) => {
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    response.write(data);
                    response.end('\n');
                    });
            break;

            default:
                fileResponse(request.url, response);
            break;
    } 
  }

  //Cases for POST request 
    if (request.method == 'POST') {
        switch(request.url){
        case'/fireAlert':
            new Promise((resolve, reject) => {
                request.on('data', (data) => {
                    resolve(BinaryToJson(data));
                });
            })
            .then((jsonData) => {
                CheckFire(jsonData, './Node/PublicResources/currentFires.geojson');
            });
            response.statusCode = 200;
            response.end('\n');
        break;

        case '/addOpPlan':
            handleOpPlan(request, response);
        break;
        }
    };
});

//server listen for requests 
server.listen(port, hostName, () =>{
});


/*Websocket code*/
/*   for map update   */
let test; 

let updateServer = new webSocketServer.server({
    httpServer: server
  });
  
  updateServer.on('request', (request) => {
    console.log((new Date()) + 'Connection from origin: ' + request.origin);
    let conenction = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    updatePing = function(){
        updateServer.broadcastUTF(JSON.stringify({message: "update ping" }));
        console.log('PINGED');
    }
    
    

  });
  

//console.log(checkPolygon.checkPolygon([[9.9314944, 57.0462362], [9.9315033, 57.0462819], [9.9315998, 57.0467743], [9.9316016, 57.0467837], [9.9318321, 57.0467725], [9.9318377, 57.0468267], [9.9319988, 57.0468179], [9.9320002, 57.0468448], [9.933088, 57.0467891], [9.9329993, 57.0463101], [9.9329407, 57.0463116], [9.9329382, 57.046276], [9.9330566, 57.0462722], [9.9330571, 57.0462029], [9.9330097, 57.0462034], [9.9330083, 57.0461685], [9.9322898, 57.0461892], [9.9314944, 57.0462362]], [9.932281699291654, 57.04652291941613]));

function NearbyLocation(path, index, coordinates) {
    let file = fs.readFileSync(path);
    let opArray = JSON.parse(file).data; //dobbelt arbejde
    let opArraySorted = search.mergeSort(opArray);
    
    return checkNext(coordinates, index, opArraySorted).concat(checkPrevious(coordinates, index, opArraySorted));
}

function checkNext(start, index, opArraySorted) {
    let nextX = opArraySorted[index + 1].coordinates[0];
    let nextY = opArraySorted[index + 1].coordinates[1];
    if (start[0] > nextX - 0.005) {
        if (start[1] < nextY + 0.005 && start[1] > nextY - 0.005) {
            return nextArray = [opArraySorted[index + 1]].concat(checkNext(start, index+1, opArraySorted));
        }
    }
    return []; 
}

function checkPrevious(start, index, opArraySorted) {
    let prevX = opArraySorted[index - 1].coordinates[0];
    let prevY = opArraySorted[index - 1].coordinates[1];
    if (start[0] < prevX + 0.005) {
        if (start[1] < prevY + 0.005 && start[1] > prevY - 0.005) {
            return nextArray = [opArraySorted[index - 1]].concat(checkPrevious(start, index - 1, opArraySorted));
        }
    }
    return []; 
}

function SplitData(data) {
    let coordinates = data[0].split('_');
    let result = coordinates.map((element) => {
        return Number(element.replace(';', '.'));
    })
    return(result);
}

//convert binary message to JSON data
function BinaryToJson(data) {
    let dataString = data.toString();
    return (JSON.parse(dataString));
}

//update list of fires with new information
function CheckFire(jsonData, path) {
    let file = fs.readFileSync(path);
    let json = JSON.parse(file);  
    let entryValue = EntryExist(json.features, jsonData.location, 'geometry', 'coordinates');
    if (jsonData.active == true) {
        if (entryValue.returnValue != true) {
            UpdateFile(jsonData, path);
            //updatePing()   
            updateServer.broadcastUTF(JSON.stringify({message: "update ping" }));
        }
        return;
    } else if(entryValue.returnValue == true) {
        //if it is not active, but exists in the file, it is deleted  
        DeleteEntry(path, entryValue.indexValue);
        //updatePing()
        updateServer.broadcastUTF(JSON.stringify({message: "update ping" }));
        return;
    }
}

/*function sendEvent(response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.write("event: ping\n");
    response.end('\n');
    console.log(response)
}*/

//check if an entry exists in an array. 
function EntryExist(array, searchKey, valueKey1, valueKey2) {
    let returnValue = false;
    let indexValue;
    array.forEach((element, index)=>{
        //check how many parameters are used
        if (JSON.stringify(valueKey2 ? element[valueKey1][valueKey2] : element[valueKey1]) == JSON.stringify(searchKey)){
            returnValue = true;
            indexValue = index;
        }
    })  
    return {returnValue, indexValue};
}

//update JSON file 
function UpdateFile(jsonData, path) {
    fs.readFile(path, (error, data) => {
        let firesObject = JSON.parse(data);
        firesObject.features.push({ "type": "Feature",
                                    "properties": {
                                        "typeFire"      : jsonData.typeFire, 
                                        "time"          : jsonData.time, 
                                        "automaticAlarm": jsonData.automaticAlarm, 
                                        "active"        : jsonData.active
                                    }, 
                                    "geometry": {
                                        "type"       : "Point", 
                                        "coordinates": jsonData.location}
                                    });
        fs.writeFile(path, JSON.stringify(firesObject, null, 4), (error) => {
            if (error) {
                throw error;
            }
        });
    });
}

//delete object in array
function DeleteEntry(path, index){
    fs.readFile(path, (error, data) => {
        let firesArray = JSON.parse(data);
        firesArray.features.splice(index, 1);
        fs.writeFile(path, JSON.stringify(firesArray, null, 4), (error) => {
            if (error) {
                throw error;
            }
        });
    });
}

function sendOperativePlan(path, requestUrl, response) {
    let file = fs.readFileSync(path);
    let opArray = JSON.parse(file).data;
    let coordinates = SplitData(requestUrl.match(/\d{1,};\d{1,}_\d{1,};\d{1,}$/));
    let opArraySorted = search.mergeSort(opArray);
    let resultIndex = search.binarySearch(opArraySorted, coordinates[0], coordinates[1]);
    let result = {
        opPlan: resultIndex != -1 ? opArraySorted[resultIndex] : {},
        BuildingMetaData: insideBuilding(coordinates, './Node/Buildings.geojson'),
        NearbyWarnings: resultIndex != -1 ? NearbyLocation(path, resultIndex, coordinates) : []
    };
    //console.log(result)
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(result, null, 4));
    response.end('\n');
}

//console.log(insideBuilding([9.932281699291654, 57.04652291941613], './Node/Buildings.geojson'));
function insideBuilding(point, geoJsonPath) {
    point = point.reverse(); //
    let geoJsonFile = fs.readFileSync(geoJsonPath);
    let geoJsonObject = JSON.parse(geoJsonFile);
    let success = false; 
    let buildingIndex;
    geoJsonObject.features.forEach((element, index) => {
        let diffX = Math.abs(element.geometry.coordinates[0][0][0][0] - point[0]);
        let diffY = Math.abs(element.geometry.coordinates[0][0][0][1] - point[1]);
        if (diffX < 0.005 && diffY < 0.005) {
            if (checkPolygon.checkPolygon(element.geometry.coordinates[0][0], point)) {
                buildingIndex = index;
                success =  true; 
                return;
            }
        //buildingIndex = -1;
        }
        //buildingIndex = -1;
    });

    if (success == false) {
        buildingIndex = -1; 
    }

    if (buildingIndex != -1) {
        return {name: geoJsonObject.features[buildingIndex].properties.name, type: geoJsonObject.features[buildingIndex].properties.type, polygon: geoJsonObject.features[buildingIndex].geometry.coordinates[0][0]};
    } else {
        return {name: '', type: '', polygon: ''};
    }
}

//Server fil ting
function fileResponse(filename, res) {
    const path = publicResources + filename;
    
    fs.readFile(path, (err, data) => {
        if (err) {
            console.error(err);
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/txt');
            res.write("File Error:" + String(err));
            res.end("\n");
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', guessMimeType(filename));
            res.write(data);
            res.end('\n');
        }
    });
}

//better alternative: use require('mmmagic') library
function guessMimeType(fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const ext2Mime = { //Aught to check with IANA spec
        "txt": "text/txt",
        "html": "text/html",
        "ico": "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
        "js": "text/javascript",
        "json": "application/json",
        "css": 'text/css',
        "png": 'image/png',
        "jpg": 'image/jpeg',
        "wav": 'audio/wav',
        "mp3": 'audio/mpeg',
        "svg": 'image/svg+xml',
        "pdf": 'application/pdf',
        "doc": 'application/msword',
        "docx": 'application/msword'
    };
    //incomplete
    return (ext2Mime[fileExtension] || "text/plain");
}

/* reads and parses the database.
 * inputs the new recieved operative plan via the binary input function in the sorted array
 * reloads the updated database
 */
async function updateDatabase (post, res) {
    fs.readFile('Node/Data/dataBase.json', 'utf8',(err, data) => {
        if (err){
            console.log(err);
        } else {
           // console.log('Updating JSON');
            console.log('Post: ', post);
            opPlanArray = JSON.parse(data);
            //opPlanArray.data = search.mergeSort(opPlanArray.data);
            //console.log(opPlanArray.data);
            opPlanArray.data = search.binaryInput(post, opPlanArray.data, post.coordinates[0], post.coordinates[1]);
            console.log(opPlanArray.data);
            let jsonOpPlan = JSON.stringify(opPlanArray, null, 4).replace(/\\\\/g, "/");
            fs.writeFile('Node/Data/dataBase.json', jsonOpPlan, 'utf8', (err, data) => {
                if (err){
                    console.log(err);
                }
            });
            
        }
    });
}

/* formidable catches the form and parses it
 * then the opPlan object is updated with the values from the form
 * and the database is updated
 * afterwards it redirects back to the page.
 */
function handleOpPlan(request, response){
    let floorPlanIncrement = 1;
    let newOpPlan = {
        coordinates: [0, 0],
        address: '',
        buildingDefinition:    '',
        usage:                 '',
        height:                0,
        specialConsiderations: '',
        fireFightingEquipment:{
            fireLift:               false,
            escapeStairs:           false,
            risers:                 false,
            sprinkler:              false,
            smokeDetectors:         false,
            markers:                false,
            automaticFireDetector:  false,
            internalAlert:          false
        },
        consideration:    '',
        fullOpPlan:       '',
        buildingOverview: '',
        floorPlans:       ''
    };

    //console.log('Uploading');
    let form = new formidable.IncomingForm();
    form.parse(request);

    /* The file is placed in a specified filepath by using (__dirname) and
     * The opPlan Object is updated with its location.
     */
    form.on('fileBegin', (name, file) => {
        if (name === 'fullOpPlan'){
            fileName = file.name.replace(/\s/g, '_');
            file.path = `Node/PublicResources/OperativePDF/${fileName}`;
            newOpPlan.fullOpPlan = `OperativePDF/${fileName}`;
        } else if (name === 'buildingOverview'){
            fileName = file.name.replace(/\s/g, '_');
            file.path = `Node/PublicResources/buildingOverview/${fileName}`;
            newOpPlan.buildingOverview = `buildingOverview/${fileName}`;
        } else if (name === 'floorPlans'){
            console.log(newOpPlan.address);
            let folder = newOpPlan.address.replace(/\s/g, '_');
            let dirName = `Node/PublicResources/floorPlans/${folder}`;
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName);
            }
            file.path = `${dirName}/floor-${floorPlanIncrement}.png`;
            newOpPlan.floorPlans = `floorPlans/${folder}/`;
            floorPlanIncrement++;
        }
    });

    form.on('file', (name, file) => {
        console.log(`Uploaded ${file.name}`);
    });

    /* The opPlan object is updated using the field event
     * Each field has a name which is used to update the matching key in the object
     */
    form.on('field', (name, field) => {
        /*console.log('Handling: ', name);
        console.log(field);*/
        if (isFirefightingEquipment(name)) {
            newOpPlan.fireFightingEquipment[name] = true;
        } else if (isCoordinate(name)) {
            if (name  === 'ncoordinate'){
                newOpPlan.coordinates[0] = Number(field);
            }

            if (name  === 'ecoordinate'){
                newOpPlan.coordinates[1] = Number(field);
            }
        } else {
            newOpPlan[name] = field
        }
    });

    form.on('end', () => {
        updateDatabase(newOpPlan, response);
    });
    

    response.writeHead(301,
        {location: '/opPlanInput.html'
    });
    response.end('\n');
}

function isCoordinate (name) {
    if (name ===  'ncoordinate' || name === 'ecoordinate') {
        return true;
    } else {
        return false;
    }
}

function isFirefightingEquipment (name) {
    if (name === 'risers'                || 
        name === 'sprinkler'             || 
        name === 'internalAlert'         || 
        name === 'markers'               || 
        name === 'automaticFireDetector' || 
        name === 'escapeStairs'          || 
        name === 'fireLift'              || 
        name === 'smokeDetectors') {
        return true;
    } else {
        return false;
    }
}