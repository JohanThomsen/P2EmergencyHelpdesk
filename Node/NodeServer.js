const http = require('http');
const fs = require('fs');
const path = require('path');
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

      case (request.url.match(/^\/operativePlans=\d{1,};\d{1,}_\d{1,};\d{1,}$/) || {}).input:
          sendOperativePlan('./Node/dataManagement/dataBase.json', request.url);
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
    }
  };
});
NearbyLocation('./Node/dataManagement/dataBase.json', 3, [56.4321567, 8.1234567]);

//server listen for requests 
server.listen(port, hostName, () =>{
});

//( a || b ) && !( a && b )
function NearbyLocation(path, index, coordinates) {
  let file = fs.readFileSync(path);
  let opArray = JSON.parse(file).data;
  let opArraySorted = search.mergeSort(opArray);
  let fireCoords = coordinates;

  }
  if (fireCoords[0] > opArraySorted[index + 1].coordinates[0]-1) {
    if (fireCoords[1] < opArraySorted[index + 1].coordinates[1]-1 || fireCoords[1] > opArraySorted[index + 1].coordinates[1]+1) {
      console.log('nearby1');
      NearbyLocation(path, index+1, coordinates);
    }
  }
  if (fireCoords[0] > opArraySorted[index - 1].coordinates[0]+1) {
    if (fireCoords[1] > opArraySorted[index - 1].coordinates[1]-1 || fireCoords[1] < opArraySorted[index - 1].coordinates[1]+1) {
      console.log('nearby2');
      NearbyLocation(path, index+1, coordinates);
    }
  }
  return(null);
}

function SplitData(data) {
  let coordinates = data[0].split('_');
  console.log(coordinates);
  let result = coordinates.map((element) => {
    return Number(element.replace(';', '.'));
  })
  return(result);
}
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
  let file = fs.readFileSync(path);
  let json = JSON.parse(file);  
  let entryValue = EntryExist(json.features, jsonData.location, 'geometry', 'coordinates');
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
    firesObject.features.push({ "type": "Feature", "properties": {"typeFire": jsonData.typeFire, "time": jsonData.time, "automaticAlarm": jsonData.automaticAlarm, "active": jsonData.active}, "geometry": {"type": "Point", "coordinates": jsonData.location}}) ;
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

function sendOperativePlan(path, requestUrl) {
  let file = fs.readFileSync(path);
  let opArray = JSON.parse(file).data;
  let coordinates = SplitData(requestUrl.match(/\d{1,};\d{1,}_\d{1,};\d{1,}$/));
  let opArraySorted = search.mergeSort(opArray);
  let operativePlan = search.binarySearch(opArraySorted, coordinates[0], coordinates[1]);
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(operativePlan, null, 4));
  response.end('\n');
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