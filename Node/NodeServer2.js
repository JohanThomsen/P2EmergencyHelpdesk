const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const search = require('./dataManagement/mergeEksampel.js');

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

      case '/fires':
        SendJson('./Node/Data/currentFires.geojson', response);
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
          CheckFire(jsonData, './Node/Data/currentFires.geojson');
        });
        break;
      case '/addOpPlan':
        console.log('Adding plan');
        break;
      case '/fileupload':
        let newOpPlan = {
            coordinates: [0, 0],
                address: '',
                buildingDefinition:{
                            buildingDefinition:   '',
                            Usage:                '',
                            height:               0,
                            specialConsideration: ''
                },
                firefightingEquipment:{
                    fireLift:               false,
                    escapeStairs:           false,
                    risers:                 false,
                    sprinkler:              false,
                    smokeDetectors:         false,
                    markers:                false,
                    automaticFireDetector:  false,
                    internalAlert:          false
                },
                consideration: '',
                fullOpPlan:''
        };
        
        console.log('Uploading');
        let form = new formidable.IncomingForm();
        form.parse(request);

        form.on('fileBegin', (name, file) => {
            file.path = `C:/Git/P2/P2Projekt/Node/dataManagement/OperativePDF/${file.name}`;
            newOpPlan.fullOpPlan = file.path;
        });

        form.on('file', (name, file) => {
            console.log(`Uploaded ${file.name}`);
        });

        form.on('field', (name, field) => {
            switch (name) {
                case 'ncoordinate':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.coordinates[0] = Number(field);
                    break;
                case 'ecoordinate':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.coordinates[1] = Number(field);
                    break;
                case 'address':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.address = field;
                    break;  
                case 'buildingDefinition':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.buildingDefinition.buildingDefinition = field;
                    break;          
                case 'usage':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.buildingDefinition.Usage = field;
                    break;
                case 'height':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.buildingDefinition.height = field;
                    break;
                case 'specialConsiderations':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.buildingDefinition.specialConsideration = field;
                    break;
                case 'risers':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.risers = true;
                    }
                    break;
                case 'sprinkler':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.sprinkler = true;
                    }
                    break;
                case 'internalAlert':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.internalAlert = true;
                    }
                    break;
                case 'markers':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.markers = true;
                    }
                    break;
                case 'automaticFireDetector':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.automaticFireDetector = true;
                    }
                    break;
                case 'escapeStairs':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.escapeStairs = true;
                    }
                    break;
                case 'fireLift':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.fireLift = true;
                    }
                    break;
                case 'smokeDetector':
                    console.log('Handling: ', name);
                    console.log(field);
                    if (field) {
                        newOpPlan.firefightingEquipment.smokeDetectors = true;
                    }
                case 'considerations':
                    console.log('Handling: ', name);
                    console.log(field);
                    newOpPlan.consideration = field;
                default:
                    break;
            }
        });

        console.log('NewOpPlan :', newOpPlan);
        processPost(newOpPlan, response);

        response.writeHead(301,
            {location: 'http://127.0.0.1:5500/opPlanInput.html'
        });
        break;

    }
  };
});

//server listen for requests 
server.listen(port, hostName, () =>{
});

//GET response with JSON data
function SendJson(path, response){
  fs.readFile(path, (error, data) => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.write(data);
    response.end('\n');
  })
}

//convert binary message to JSON data
function BinaryToJson(data) {
  let dataString = data.toString();
  return (JSON.parse(dataString));
}

//update list of fires with new information
function CheckFire(jsonData, path) {
  let test123 = fs.readFileSync(path);
  let json = JSON.parse(test123);  
  let entryValue = EntryExist(json.features, jsonData.location, 'location');
  if (jsonData.active == true) {
    if (entryValue.returnValue != true) {
      UpdateFile(jsonData, path);     
    }
    return;
  } else if(entryValue.returnValue == true) {
    console.log(entryValue.returnValue); 
      //if it is not active, but exists in the file, it is deleted  
      DeleteEntry(path, entryValue.indexValue);
      return;
  }
}

//check if an entry exists in an array. 
function EntryExist(array, searchKey, valueKey) {
  let returnValue = false;
  let indexValue;
  array.forEach((element, index)=>{
    if (JSON.stringify(element[valueKey]) == JSON.stringify(searchKey)){
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
    firesObject.features.push({ "type": "Feature", "properties": {"typeFire": jsonData.typeFire, "time": jsonData.time, "automaticAlarm": jsonData.automaticAlarm, "active": jsonData.active}, "geometry": {"type": "Point", "coordinates": jsonData.location}}) ;
    fs.writeFile(path, JSON.stringify(firesObject), (error) => {
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
    fs.writeFile(path, JSON.stringify(firesArray), (error) => {
      if (error) {
        throw error;
      }
    });
  });
}

/*
* Server fil ting
 */
const rootFileSystem = process.cwd();

function securePath(userPath) {
  if (userPath.indexOf('\0') !== -1) {

    return undefined;

  }
  userPath = publicResources + userPath;

  let p = path.join(rootFileSystem, path.normalize(userPath));
  return p;
}

function fileResponse(filename, res) {
  const sPath = securePath(filename);
  
  fs.readFile(sPath, (err, data) => {
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
  })
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

  async function processPost (post, res) {
    console.log("In Process")
        fs.readFile('dataManagement/dataBase.json', 'utf8',(err, data) => {
          if (err){
            console.log(err);
          } else {
            console.log('Updating JSON');
            console.log('Post: ', post);
            opPlanArray = JSON.parse(data);
            opPlanArray.data = search.mergeSort(opPlanArray.data);
            console.log(opPlanArray.data);
            //opPlanArray.data.push(post);
            opPlanArray.data = search.binaryInput(post, opPlanArray.data, post.coordinates[0], post.coordinates[1]);
            console.log(opPlanArray.data);
            let jsonOpPlan = JSON.stringify(opPlanArray, null, 4);
            fs.writeFile('dataManagement/dataBase.json', jsonOpPlan, 'utf8', (err, data) => {
                if (err){
                    console.log(err);
                }
            });
          }
        });
  }