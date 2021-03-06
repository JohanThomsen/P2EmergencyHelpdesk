//  Made by group SW2B2-20 from Aalborg unversity 
//  
//  Server file that handles all requests and file editing. 
//  

const http =            require('http');
const fs =              require('fs');
const formidable =      require('formidable');
const search =          require('./dataSorting.js');
const checkPolygon =    require('./checkPolygon.js');
const webSocketServer = require('websocket');

//server setup variables
const port = 3000;
const hostName = '127.0.0.1';
const publicResources = './Node/PublicResources/';

//HTTP server
let server = http.createServer((request, response) => {
    if (request.method == 'GET') {
        GETRequests(request, response);
    }

    if (request.method == 'POST') {
        POSTRequests(request, response);
    };
});

//Cases for GET request 
function GETRequests(request, response){
    switch (request.url) {
        case '/': 
            fileResponse('HTML/index.html', response);
        break; 

        case '/uploadOP': 
            fileResponse('HTML/opPlanInput.html', response);
        break; 

        case '/fires':
            fileResponse('../Data/currentFires.geojson', response);
        break;

        case (request.url.match(/^\/operativePlans=\d{1,};\d{1,}_\d{1,};\d{1,}$/) || {}).input:
            sendOperativePlan('./Node/Data/dataBase.json', request.url, response);
        break;

        case ('/buildings'):
            fs.readFile('./Node/Data/Buildings.geojson', (err, data) => {
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                response.write(data);
                response.end('\n');
                });
        break;
        
        case ('/commanders'):
            fileResponse('HTML/commanderUI.html', response);
        break;

        case ('/commanderList'):
            fileResponse('../Data/commanderID.json', response);
        break;

        default:
            fileResponse(request.url, response);
        break;
    }  
}

//Cases for POST request 
function POSTRequests(request, response){
    switch(request.url){
        case'/fireAlert':
            console.log("got request");
            new Promise((resolve, reject) => {
                request.on('data', (data) => {
                    resolve(BinaryToJson(data));
                });
            })
            .then((jsonData) => {
                CheckFire(jsonData, './Node/Data/currentFires.geojson');
            });
            response.statusCode = 200;
            response.end('\n');
        break;

        case '/addOpPlan':
            handleOpPlan(request, response);
        break;

        case '/assignCommander':
            new Promise((resolve, reject) => {
                request.on('data', (data) => {
                    resolve(BinaryToJson(data));
                });
            })
            .then((jsonData) => {
                updateCommanderFile(jsonData, response);
            });
        break;     

        case '/removeFireFromCommander':
            new Promise((resolve, reject) => {
                request.on('data', (data) => {
                    resolve(BinaryToJson(data));
                });
            })
            .then((jsonData) => {
                removeFireFromCommander(jsonData, response);
            });
        break; 

        case '/clearFires':
            fs.writeFileSync('./Node/Data/currentFires.geojson',
                `{
                "type": "FeatureCollection",
                "name": "currentFires",
                "features": []
                }`)
            response.statusCode = 200;
            response.end('\n');
        break;
            
        case ('/validateInside'):
            let building;
            new Promise((resolve, reject) => {
                request.on('data', (data) => {
                    resolve(BinaryToJson(data));
                });
            })
            .then((jsonData) => {
                building = insideBuilding(jsonData.coords, './Node/Data/Buildings.geojson');
                if (building.fileIndex != -1){
                    response.statusCode = 200;
                    response.write(JSON.stringify({result: true,
                                                   polygon: building.polygon}));
                    response.end('\n');
                }
                else{
                    response.statusCode = 200;
                    response.write(JSON.stringify({result : false}));
                    response.end('\n');
                }
            });

        break;

    }
}

/* Removes a given fire from all comaders assigned to that fire, then updates the commander file,
 * And refreshes the operator site */
function removeFireFromCommander(jsonData, response){
    let commanderPath = './Node/Data/commanderID.json'
    let commanderFile = fs.readFileSync(commanderPath);
    let commanderData = JSON.parse(commanderFile);
    Object.keys(commanderData.commanders).forEach((key) => {
        if(commanderData.commanders[key].coordinates[0] == jsonData.fireCoordinates[0]) {
            commanderData.commanders[key].coordinates = [0,0];
        }
    })

    fs.writeFile(commanderPath, JSON.stringify(commanderData, null, 4), (error) => {
        if (error) {
            throw error;
        }
    });
    updateServer.broadcastUTF(JSON.stringify({message: "resolved fire" }));
    response.statusCode = 200;
    response.end('\n')    
}
//server listen for requests 
server.listen(port, hostName, () =>{
});
console.log('server running');

/*  Websocket code      */
/*   for map update     */

let updateServer = new webSocketServer.server({
    httpServer: server
});
  
updateServer.on('request', (request) => {
    let connection = request.accept(null, request.origin);
    
    updatePing = function(){
        updateServer.broadcastUTF(JSON.stringify({message: "update ping" }));
        console.log('PINGED');
    }
});

/* Updates the commander JSON file with inputted coordinates
 * and such linking a commder with those coordinates */
function updateCommanderFile(jsonData, response) {
    let commanderPath = './Node/Data/commanderID.json'
    let firePath      = './Node/Data/currentFires.geojson'
    let commanderFile = fs.readFileSync(commanderPath);
    let fireFile      = fs.readFileSync(firePath);
    let commanderData = JSON.parse(commanderFile);
    let fireData      = JSON.parse(fireFile);
    if  (commanderData.commanders[jsonData.commanderID].coordinates[0] === 0) {
        commanderData.commanders[jsonData.commanderID].coordinates = jsonData.fireCoordinates;
        fs.writeFile(commanderPath, JSON.stringify(commanderData, null, 4), (error) => {
            if (error) {
                throw error;
            }
        });
    
        assignFire(fireData, jsonData, firePath);
        response.statusCode = 200;
        response.end('\n')
    } else {
        response.statusCode = 405;
        response.end('\n');
    }
    
    
}


/* Assigns a fire to a commander using the fire ID, then updates the commander JSON file */
function assignFire(fireData, jsonData, firePath) {
    fireData.features.forEach(element => {
        if (element.properties.id === jsonData.fireID && 
        !element.properties.assignedCommanders.includes(jsonData.commanderID)) {

            element.properties.assignedCommanders.push(jsonData.commanderID);
            fs.writeFileSync(firePath, JSON.stringify(fireData, null, 4), (error) => {
                if (error) {
                    throw error;
                }
            });
            
            updateServer.broadcastUTF(JSON.stringify({ message: "update ping" }));
        }
    });
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
    let entryValue = entryExist(json.features, jsonData.location, 'geometry', 'coordinates');
    if (jsonData.active == true) {
        if (entryValue.returnValue != true) {
            UpdateFile(jsonData, path);
            updateServer.broadcastUTF(JSON.stringify({message: "update ping" }));
        }
        return;
    } else if(entryValue.returnValue == true) {
        //if it is not active, but exists in the file, it is deleted  
        deleteEntry(path, entryValue.indexValue);
        updateServer.broadcastUTF(JSON.stringify({message: "update ping" }));
        return;
    }
}

//check if an entry exists in an array. 
function entryExist(array, searchKey, valueKey1, valueKey2) {
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

//update JSON file with new fire
function UpdateFile(jsonData, path) {
    fs.readFile(path, (error, data) => {
        let firesObject = JSON.parse(data);
        firesObject.features.push({ "type": "Feature",
                                    "properties": {
                                        "typeFire"           : jsonData.typeFire, 
                                        "time"               : jsonData.time, 
                                        "automaticAlarm"     : jsonData.automaticAlarm, 
                                        "active"             : jsonData.active,
                                        "id"                 : incrementID(firesObject),
                                        "assignedCommanders" : []
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

function incrementID(firesObject){
    if (firesObject.features[0] == undefined) {
        return 0;
    } else {
        return firesObject.features[firesObject.features.length-1].properties.id + 1;
    }
}
//delete object in array
function deleteEntry(path, index){
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




/* Collects all the data needed do display the operative plan and packages it up into one object,
 * then sends it back via a response */
function sendOperativePlan(path, requestUrl, response) {
    let file = fs.readFileSync(path);
    let opArraySorted = JSON.parse(file).data;
    let coordinates = splitData(requestUrl.match(/\d{1,};\d{1,}_\d{1,};\d{1,}$/));
    let metaData = insideBuilding(coordinates, './Node/Data/Buildings.geojson');
    let resultIndex = search.binarySearch(opArraySorted, metaData.opCoords == null ? coordinates[0] : metaData.opCoords[0], metaData.opCoords == null ? coordinates[1] : metaData.opCoords[1]);
    let result = {
        opPlan: resultIndex != -1 ? opArraySorted[resultIndex] : {},
        BuildingMetaData: metaData,
        NearbyWarnings: resultIndex != -1 ? NearbyLocation(opArraySorted, resultIndex, opArraySorted[resultIndex].coordinates) : []
    };
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(result, null, 4));
    response.end('\n');
}

function splitData(data) {
    let coordinates = data[0].split('_');
    let result = coordinates.map((element) => {
        return Number(element.replace(';', '.'));
    })
    return(result);
}

/* Checks if a given coordinate point is within a building and if it is 
 * returns an object with with info on a polygon and a link to a given operative plan*/
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
        }
    });

    if (success === true) {
        return {name     : geoJsonObject.features[buildingIndex].properties.name,
                type     : geoJsonObject.features[buildingIndex].properties.type,
                polygon  : geoJsonObject.features[buildingIndex].geometry.coordinates[0][0], 
                fileIndex: buildingIndex, 
                opCoords : geoJsonObject.features[buildingIndex].properties.opPlanCoords};
    } else {
        return {name: '', type: '', polygon: '', fileIndex: '-1'};
    }
}

/* Checks nearby locations and returns an array of those neaby locations with special considerations */
function NearbyLocation(opArray, index, coordinates) {  
    return checkNext(coordinates, index, opArray).concat(checkPrevious(coordinates, index, opArray));
}

/* Recursiviely looks through all nearby building for special considerations
 * then returns an array of those nearby warnings */
function checkNext(start, index, opArray) {
    let nextX = opArray[index + 1].coordinates[0];
    let nextY = opArray[index + 1].coordinates[1];
    if (start[0] > nextX - 0.005) {
        if (start[1] < nextY + 0.005 && start[1] > nextY - 0.005) {
            for (element in opArray[index + 1]){
                if (element == "specialConsiderations"){
                    return nextArray = [opArray[index + 1]].concat(checkNext(start, index+1, opArray));
                }
            }
        }
    }
    return []; 
}

/* Recursiviely looks through all nearby building for special considerations
 * then returns an array of those nearby warnings */
function checkPrevious(start, index, opArray) {
    let prevX = opArray[index - 1].coordinates[0];
    let prevY = opArray[index - 1].coordinates[1];
    if (start[0] < prevX + 0.005) {
        if (start[1] < prevY + 0.005 && start[1] > prevY - 0.005) {
            for (element in opArray[index - 1]){
                if (element == "specialConsiderations"){
                    return nextArray = [opArray[index - 1]].concat(checkPrevious(start, index - 1, opArray));
                }
            }
        }
    }
    return []; 
}

/* Responds with a file of the name inputted */
function fileResponse(filename, res) {
    const path = publicResources + filename;
    console.log(path);
    fs.readFile(path, (err, data) => {
        if (err) {
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

function guessMimeType(fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const ext2Mime = {
        "txt": "text/txt",
        "html": "text/html",
        "ico": "image/ico",
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
            writeOpPlanToFile(data, post);
        }
    });
    fs.readFile('./Node/Data/Buildings.geojson', (err, buildings) => {
        if (err){
            console.log(err);
        } else {
            writeBuildingsToFile(buildings, post);
        }
    })
}

/* Takes the inputted operative plan and inputs its into a sorted array
 * into the correct sorted location */
async function writeOpPlanToFile(data, post){
    let opPlanArray = await JSON.parse(data);
    opPlanArray.data = search.binaryInput(post, opPlanArray.data, post.coordinates[0], post.coordinates[1]);
    let jsonOpPlan = JSON.stringify(opPlanArray, null, 4).replace(/\\\\/g, "/");
    fs.writeFile('Node/Data/dataBase.json', jsonOpPlan, 'utf8', (err, data) => {
        if (err){
            console.log(err);
        }
    });
}

/* Takes the operative plan and links it to a building then updates the building file with that link*/
async function writeBuildingsToFile(buildings, post){
    let buildingArray = await JSON.parse(buildings);
    let buildingIndex = insideBuilding([post.coordinates[0], post.coordinates[1]], './Node/Data/Buildings.geojson').fileIndex;
    if (buildingIndex != -1){
        buildingArray.features[buildingIndex].properties.opPlanCoords = [post.coordinates[0], post.coordinates[1]];
        let updatedArray = JSON.stringify(buildingArray);
        fs.writeFile('./Node/Data/Buildings.geojson', updatedArray, (err, data) => {
            if (err){
                console.log(err);
            }
        });
    }
}
/* formidable catches the form and parses it
 * then the opPlan object is updated with the values from the form
 * and the database is updated
 * afterwards it redirects back to the page.
 */
function handleOpPlan(request, response){
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
        floorPlans:       '',
        floorPlanAmount:  0
    };

    let form = new formidable.IncomingForm();
    form.parse(request);

    form.on('fileBegin', (name, file) => {
        handleFiles(name, file, newOpPlan);
    });

    form.on('file', (name, file) => {
        console.log(`Uploaded ${file.name}`);
    });

    form.on('field', (name, field) => {
        newOpPlan = handleFields(name, field, newOpPlan);
    });

    form.on('end', () => {
        floorPlanIncrement = 1;
        newOpPlan = updateDatabase(newOpPlan, response);
    });
    

    response.writeHead(301,
        {location: '/uploadOP'
    });
    response.end('\n');
}

/* The files are placed in a specified filepath by using and
 * The opPlan Object is updated with its location.
 */
function handleFiles(name, file, newOpPlan){
    if (name === 'fullOpPlan'){
        fileName = file.name.replace(/\s/g, '_');
        file.path = `Node/PublicResources/OperativePDF/${fileName}`;
        newOpPlan.fullOpPlan = `OperativePDF/${fileName}`;
    } else if (name === 'buildingOverview'){
        fileName = file.name.replace(/\s/g, '_');
        file.path = `Node/PublicResources/buildingOverview/${fileName}`;
        newOpPlan.buildingOverview = `${fileName}`;
    } else if (name === 'floorPlans'){
        let folder = newOpPlan.address.replace(/\s/g, '_').replace('æ','ae').replace('ø','oe').replace('å','aa');
        let dirName = `Node/PublicResources/floorPlans/${folder}`;
        if (!fs.existsSync(dirName)){
            fs.mkdirSync(dirName);
        }
        file.path = `${dirName}/floor-${newOpPlan.floorPlanAmount + 1}.png`;
        newOpPlan.floorPlans = `floorPlans/${folder}/`;
        newOpPlan.floorPlanAmount += 1;
    }
    return newOpPlan;
}

/* The opPlan object is updated using the field event
* Each field has a name which is used to update the matching key in the object
*/
function handleFields(name, field, newOpPlan){
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
        newOpPlan[name] = field;
    }
    return newOpPlan;
}

/* Checks if the given name is a coordinate field */
function isCoordinate (name) {
    if (name ===  'ncoordinate' || name === 'ecoordinate') {
        return true;
    } else {
        return false;
    }
}

/* Checks if the given name is a fire fighting equipment field */
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