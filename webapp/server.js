/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var url = require('url');
var express = require('express');
var jwt = require('express-jwt');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

app.use(cors());

// Authentication middleware provided by express-jwt.
// This middleware will check incoming requests for a valid
// JWT on any routes that it is applied to.
//app.use(jwt({
//  secret: new Buffer('3fU9S8VNOqe3cq4u2g06oAlRUaGB3U4yN80mBgnnTH_NkJ0eubv8o_lgDdBiMqWq', 'base64'),
//  audience: 'gz3QoLutG1Z5LRwVTQZikRb3RchCPo2c'
//}).unless(function (req) {
//  var pathname = url.parse(req.originalUrl).pathname;
//  return !~pathname.indexOf("/api/");
//}));

var HEROES_FILE = path.join(__dirname, 'heroes.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/dashboard', express.static(path.join(__dirname, 'public')));
app.use('/heroes', express.static(path.join(__dirname, 'public')));
app.use('/logout', express.static(path.join(__dirname, 'public')));
app.use('/login', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest files.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});
//The default behavior is to throw an error when the token is invalid, 
//so you can add your custom logic to manage unauthorized access as follows:
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

app.get('/api/heroes', function(req, res) {
  fs.readFile(HEROES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/heroes', function(req, res) {
  fs.readFile(HEROES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var heroes = JSON.parse(data);
    var newHero = {
      id: heroes.data.length + 1,
      name: req.body.name
    };
    heroes.data.push(newHero);
    fs.writeFile(HEROES_FILE, JSON.stringify(heroes, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(heroes);
    });
  });
});

app.put('/api/heroes/:id', function(req, res) {
  fs.readFile(HEROES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var heroes = JSON.parse(data);
    var updatedHero = heroes.data.filter(hero => hero.id === req.body.id)[0];
    if(updatedHero){
        updatedHero.name=req.body.name;
    }
    
    fs.writeFile(HEROES_FILE, JSON.stringify(heroes, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(heroes);
    });
  });
});

app.delete('/api/heroes/:id', function(req, res) {
  fs.readFile(HEROES_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var heroes = JSON.parse(data);
    var newHeroesData=new Array();
    var deletedHero=null;
    for (var i = 0; i < heroes.data.length; i++) {
      deletedHero=heroes.data[i];
     if(deletedHero.id !== parseInt(req.params.id)){
        newHeroesData.push(deletedHero);
      }
    }
    
   heroes.data=newHeroesData;
    
    fs.writeFile(HEROES_FILE, JSON.stringify(heroes, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(heroes);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
