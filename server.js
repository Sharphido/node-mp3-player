const fs = require('fs');
const qs = require('querystring');
const http = require('http');

const server = (listener = () => {}, opts = {}) => {
  return Object.assign(
    http.createServer(listener),
    opts
  );
};

const actions = () => {
  return {
    get: {
      root: (request, response) => {
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
      },
      png: (request, response) => {
        fs.readFile('static' + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'image/png'
          });
          response.write(data);
          response.end();
        });
      },
      js: (request, response) => {
        fs.readFile('static' + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'text/javascript'
          });
          response.write(data);
          response.end();
        });
      },
      css: (request, response) => {
        fs.readFile('static' + request.url, (error, data) => {
          response.writeHead(200, {
            'Content-Type': 'text/css'
          });
          response.write(data);
          response.end();
        });
      },
      mpeg: (request, response) => {
        let fileStream = fs.createReadStream('static' + request.url);
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
      },

    },
    post: {
      scan: (request, response) => {
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
      },
      update: (request, response) => {
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
      }
    },
  }
};

const app = server((request, response) => {
  request.url = decodeURI(request.url);
  console.log(request.method, request.url);
  let action;
  switch (request.method) {
    case 'GET':
      action = app.action.get;
      switch (request.url) {
        case '/':
        case '/index.html':
          action.root(request, response);
          break;
        default:
      }
      if (request.url.indexOf('.mp3') !== -1) {
        action.mpeg(request, response);
      } else if (request.url.indexOf('.png') !== -1) {
        action.png(request, response);
      } else if (request.url.indexOf('.js') !== -1) {
        action.js(request, response);
      } else if (request.url.indexOf('.css') !== -1) {
        action.css(request, response);
      }
      break;
    case 'POST':
      action = app.action.post;
      switch (request.url){
        case '/scan':
          action.scan(request, response);
        break;
        case '/update':
          action.update(request, response);
        break;
      }
      break;
  }
}, {
  action: actions(),
  port: 3000,
});

app.listen(app.port);

console.log('Server listening on localhost:' + app.port);
