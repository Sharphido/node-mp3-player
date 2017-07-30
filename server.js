const fs = require('fs');
const qs = require('querystring');
const http = require('http');

const server = (listener) => {
  return http.createServer(listener);
};

const actions = () => {
  return {
    response: (request, response) => {
      let data = '';
      request.on('data', (d) => {
        console.log('data: ', d)
        data += d;
      });
      request.on('end', (d) => {
        let finish = qs.parse(data);
        if (finish.album) {
          let result = {
            files: []
          };
          fs.readdir(__dirname + '/static/mp3/' + finish.album, (error, files) => {
            if (error) {
              return console.log(error);
            }
            files.forEach(function(file) {
              console.log(file);
              result.files.push({
                'file': file
              });
              response.end(JSON.stringify(result));
            });
          });
        }
      });
    },
  }
};

const app = server((request, response) => {
  request.url = decodeURI(request.url);
  console.log(request.method, request.url);
  switch (request.method) {
    case "GET":
      switch (request.url) {
        case '/':
          let result = {
            dirs: [],
            files: []
          };
          fs.readdir(__dirname + '/static/mp3', (error, files) => {
            if (error) {
              return console.log(error);
            }
            files.forEach((file) => {
              result.dirs.push(file);
              toSend = JSON.stringify(result);
            });
            fs.readdir(__dirname + '/static/mp3/' + result.dirs[0], (error, files) => {
              if (error) {
                return console.log(error);
              }
              files.forEach((file) => {
                result.files.push({
                  'file': file
                });
                toSend = JSON.stringify(result);
              });
            });
          });
          fs.readFile("static/index.html", (error, data) => {
            if (error) {
              response.writeHead(404, {
                'Content-Type': 'text/html'
              });
              response.write("<h1>Error 404 - file not found!<h1>");
              response.end();
            } else {
              response.writeHead(200, {
                'Content-Type': 'text/html'
              });
              response.write(data);
              response.end();
            }
          });
          break;
        default:
      }

      if (request.url.indexOf(".mp3") !== -1) {
        let path = "static" + request.url
        let fileStream = fs.createReadStream(path);
        fileStream.on("open", () => {
          let stats = fs.statSync(path);
          response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stats.size
          });
          fileStream.pipe(response);
        });
        fileStream.on('error', (error) => {
          console.log(error)
        });
      }
      else if (request.url.indexOf('.png') !== -1) {
        fs.readFile("static" + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'image/png'
          });
          response.write(data);
          response.end();
        });
      }
      break;
    case "POST":
      app.action.response(request, response);
      break;
  }
});

app.action = actions();
app.port = 3000;
app.listen(app.port);

console.log('Server listening on localhost:' + app.port);
