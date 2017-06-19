
var fs = require("fs");
var qs = require("querystring");
var http = require("http");
var toSend = "{}";

function servResp(req, res) {
  var allData = "";
  req.on("data", function(data) {
    console.log("data: " + data)
    allData += data;
  });
  req.on("end", function(data) {
    var finish = qs.parse(allData)
    if (finish.album) {
      var obj = {};
      obj.files = [];
      fs.readdir(__dirname + '/static/mp3/' + finish.album, function(err, files) {
        if (err) {
          return console.log(err);
        }
        files.forEach(function(file) {
          console.log(file);
          obj.files.push({
            'file': file
          });
          toSend = JSON.stringify(obj);
        });
      });
    }
      //res.end(JSON.stringify(finish));
    res.end(toSend);

  });

}

function fixURL(url) {
  url = url.replace(/%20/g, " ");
  url = url.replace(/%C5%82/g, "ł");
  url = url.replace(/%C4%85/g, "ą");
  url = url.replace(/%C5%9B/g, "ś");
  url = url.replace(/%C5%BC/g, "ż");
  url = url.replace(/%C4%99/g, "ę");
  url = url.replace(/%C3%B3/g, "ó");
  url = url.replace(/%C4%87/g, "ć");
  url = url.replace(/%C3%A4/g, "ä");
  return url;
};

var server = http.createServer(function(req, res) {
  console.log(req.method); // zauważ ze przesyłane dane będą typu POST

  switch (req.method) {
    case "GET":
      req.url = fixURL(req.url);
      console.log("adres żądania: " + req.url)
      switch (req.url) {
        case '/':
          var obj = {};
          obj.dirs = [];
          fs.readdir(__dirname + '/static/mp3', function(err, files) {
            if (err) {
              return console.log(err);
            }
            files.forEach(function(file) {
              console.log(file);
              obj.dirs.push(file);
              toSend = JSON.stringify(obj);
              //tu dodaj foldery do tablicy
            });

            // tu mogę od razu wywołać taka samą
            // funkcję czytającą pliki z pierwszego katalogu
            obj.files = [];
            fs.readdir(__dirname + '/static/mp3/' + obj.dirs[0], function(err, files) {
              if (err) {
                return console.log(err);
              }
              files.forEach(function(file) {
                console.log(file);
                obj.files.push({
                  'file': file
                });
                toSend = JSON.stringify(obj);
              });
            });
          });
          fs.readFile("static/index.html", function(error, data) {
            if (error) {
              res.writeHead(404, {
                'Content-Type': 'text/html'
              });
              res.write("<h1>błąd 404 - nie ma pliku!<h1>");
              res.end();
            } else {
              res.writeHead(200, {
                'Content-Type': 'text/html'
              });
              res.write(data);
              res.end();
            }
          });
          break;
        default:

      }

      if (req.url.indexOf(".mp3") != -1) {
        var path = "static" + req.url
        var filestream = fs.createReadStream(path);
        filestream.on("open", function() {
          var stats = fs.statSync(path);

          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stats.size
          });
          filestream.pipe(res);
        });
        filestream.on('error', function(err) {
          // filestream.end();
          console.log(err)
        });

      }
      // console.log(req.url.split('.')[0]);
      if (req.url.split('.')[1] == 'png') {
        fs.readFile("static" + req.url, function(error, data) {
          res.writeHead(200, {
            'Content-Type': 'image/png'
          });
          res.write(data);
          res.end();
        })

        // console.log('foo');
      }
      // tu wykonaj załadowanie statycznej strony z formularzem
      break;
    case "POST":
      req.url = fixURL(req.url);
      console.log("adres żądania: " + req.url);

      // tu wykonaj funkcję "servResp", która pobierze dane przesłane
      // w formularzu i odpowie do przeglądarki
      // (uwaga - adres żądania się nie zmienia)

      servResp(req, res);
      break;

  }



})

server.listen(3000);
console.log("serwer staruje na porcie 3000 - ten komunikat zobaczysz tylko raz")


// for (var i = 0; i < directories.length; i++) {
//   var dirname = directories[i];
//   fs.readdir(__dirname + "/static/mp3/" + directories[i], function(err, files) {
//     if (err) {
//       return console.log(err);
//     }
//     files.forEach(function(file) {
//       console.log(dirname);
//       obj[dirname].push(file);
//       //console.log(file);
//       //tu dodaj foldery do tablicy
//     });
//     // if (obj.files.length == 3)
//     //console.log(obj);
//       toSend = JSON.stringify(obj);
//   });
// }
