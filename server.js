const fs = require('fs');
const qs = require('querystring');
const http = require('http');

const server = (listener = () => {}, options = {}) => {
  return Object.assign(
    http.createServer(listener),
    options
  );
};

const actions = () => {
  return {
    response: (request, response) => {
      switch (request.url) {
        case '/scan':
          let result = {
              directories: [],
              files: []
            };
            fs.readdir(__dirname + '/static/mp3', (error, files) => {
              if (error) {
                return console.log(error);
              }
              files.forEach((file) => {
                result.directories.push(file);
                toSend = JSON.stringify(result);
              });
              fs.readdir(__dirname + '/static/mp3/' + result.directories[0], (error, files) => {
                if (error) {
                  return console.log(error);
                }
                files.forEach((file) => {
                  result.files.push({
                    'file': file
                  });
                });
                response.end(
                  JSON.stringify(result)
                );
              });
            });
        break;
        case '/update':
          let querystring = '';
          request.on('data', (data) => {
            querystring += data;
          });
          request.on('end', (data) => {
            const query = qs.parse(querystring);
            if (query.album) {
              let result = {
                files: []
              };
              fs.readdir(__dirname + '/static/mp3/' + query.album, (error, files) => {
                if (error) {
                  return console.log(error);
                }
                files.forEach((file) => {
                  result.files.push({
                    'file': file
                  });
                });
                response.end(
                  JSON.stringify(result)
                );
              });
            }
          });
        break;
      }
    },
  }
};

const app = server((request, response) => {
  request.url = decodeURI(request.url);
  console.log(request.method, request.url);
  switch (request.method) {
    case 'GET':
      switch (request.url) {
        case '/':
        case '/index.html':
          fs.readFile('static/index.html', (error, data) => {
            if (error) {
              response.writeHead(404, {
                'Content-Type': 'text/html'
              });
              response.write('<h1>Error 404 - file not found!<h1>');
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

      if (request.url.indexOf('.mp3') !== -1) {
        let path = 'static' + request.url
        let fileStream = fs.createReadStream(path);
        fileStream.on('open', () => {
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
        fs.readFile('static' + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'image/png'
          });
          response.write(data);
          response.end();
        });
      }
      else if (request.url.indexOf('.js') !== -1) {
        fs.readFile('static' + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'text/javascript'
          });
          response.write(data);
          response.end();
        });
      }
      else if (request.url.indexOf('.css') !== -1) {
        fs.readFile('static' + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'text/css'
          });
          response.write(data);
          response.end();
        });
      }
      break;
    case 'POST':
      app.action.response(request, response);
      break;
  }
}, {
  action: actions(),
  port: 3000
});

app.listen(app.port);

console.log('Server listening on localhost:' + app.port);
