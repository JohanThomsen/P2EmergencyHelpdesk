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
        let post = processPost(request);
        break;
      case '/fileupload':
        let form = new formidable.IncomingForm();
        form.parse(request, (err, fields, files) => {
          let oldPath = files.filetoupload.path;
          console.log(oldPath);
          let newPath = 'E:/P2Kode/Node/Data' + files.filetoupload.name;
          fs.rename(oldPath, newPath, (err) => {
            if (err) throw err;
          });
          response.write('file uploaded');
          response.end();
        
        });
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

  async function processPost (req, res) {
    console.log("In Process")
    if (req.method == "POST") {
      console.log("Processing Post")
      let body = "";
      req.on("data", (data) => {
        body += data;
  
        if (body.length > 1e6) {
          req.connection.destroy();
          console.log("Destroying POST")
        }
      });
  
      req.on("end", () => {
        let post = body;
        console.log("Finishing POST")
        console.log(post);
        post = JSON.parse(post);
  
        fs.readFile('Node/dataBase.json', 'utf8',(err, data) => {
          if (err){
            console.log(err);
          } else {
            console.log('Updating JSON');
            opPlanArray = JSON.parse(data);
            opPlanArray.data = search.mergeSort(opPlanArray.data);
            console.log(opPlanArray.data);
            //opPlanArray.data.push(post);
            opPlanArray.data = search.binaryInput(post, opPlanArray.data, post.coordinates[0], post.coordinates[1]);
            console.log(opPlanArray.data);
            let jsonOpPlan = JSON.stringify(opPlanArray, null, 4);
            fs.writeFile('Node/dataBase.json', jsonOpPlan, 'utf8', (err, data) => {
                if (err){
                    console.log(err);
                }
            });
          }
        });
  
  
        return post;
      })
  
  
    }
  }