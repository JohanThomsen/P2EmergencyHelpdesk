const http = require('http');
const fs = require('fs');
const path = require('path');

let port = 3000;
let hostName = '127.0.0.1';
let publicResources = './node/PublicResources/';

let server = http.createServer((request, response) => {
  if (request.method == 'GET') {
    switch (request.url) {
      case '/': 
        fileResponse('index.html', response);
        break; 

      case '/fires':
        fs.readFile('./Node/Data/currentFires.json', (error, data) => {
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.write(data);
          response.end('\n');
          console.log(data);
        });
        break;

      default:
        fileResponse(request.url, response);
        break;
    } 
  }

  if (request.method == 'POST') {
    new Promise((resolve, reject) => {
      request.on('data', (data) => {
        resolve(BinaryToJson(data));
      });
    })
      .then((jsonData) => {
          UpdateFile(jsonData);
      });
  };
});


server.listen(port, hostName, () =>{
  console.log('server running');
});

function BinaryToJson(data) {
  let dataString = data.toString();
  return (JSON.parse(dataString));
}


function UpdateFile(jsonData) {
  fs.readFile('./Node/Data/currentFires.json', (error, data) => {
    let firesArray = JSON.parse(data);
    firesArray.entries.push(jsonData);
    fs.writeFile('./Node/Data/currentFires.json', JSON.stringify(firesArray), (error) => {
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
  //console.log("The path is:"+p);
  return p;
}

function fileResponse(filename, res) {
  const sPath = securePath(filename);
  console.log("Reading:" + sPath);
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
    console.log(fileExtension);
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