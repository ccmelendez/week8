var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
//var credentials = require('./credentials.js.template');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret:'SuperSecretPasswordDontTellNoOne'}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);


app.get('/',function(req,res,next){
  var context = {};
  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length || 0;
  context.toDo = req.session.toDo || [];
  console.log(context.toDo);

  res.render('toDo',context);
});

app.post('/',function(req,res){
  var context = {};

  if(req.body['New List']){
    req.session.name = req.body.name;
    req.session.toDo = [];
    req.session.curId = 0;
  }

  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  

  if(req.body['Add Item']){
    var x = false;
    if(requestByCity(req.body.location,req))
    {
      x = true;
      console.log("x:" + x);
    }

    req.session.toDo.push({"name":req.body.name, "id":req.session.curId,"Location":req.body.location,"minTemp":req.body.minTemperature,"highlight": x});
    x=false;
    //var checkTemp = 
    

    console.log(req.body.location);
    //console.log(checkTemp);
    console.log(req.body.minTemperature);
    
    req.session.curId++;
  }

  

  if(req.body['Done']){
    req.session.toDo = req.session.toDo.filter(function(e){
      return e.id != req.body.id;
    })
  }

  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length;
  context.toDo = req.session.toDo;

  console.log(context.toDo);
  res.render('toDo',context);
});

function requestByCity(city,req){
  var openWeather={};
  var warmEnough = request('http://api.openweathermap.org/data/2.5/weather?q='+ city +'&APPID=acdb95891096b79331450cc51b87c1c6', function(err,response,body){
    if(!err && response.statusCode<400){
      openWeather.owm=body;
      //console.log(JSON.parse(context.owm).main.temp);
      //res.render('toDo',context);
    }else {
      console.log(err);
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
    console.log(JSON.parse(openWeather.owm).main.temp);
    console.log(req.body.minTemperature);
    var checkTemp = JSON.parse(openWeather.owm).main.temp;
    if(checkTemp < req.body.minTemperature ){
      //console.log(re;
      //console.log("req.session.toDo.length: " + (req.session.toDo.length-1));
      //console.log("req.session.toDo[i]:" + req.session.toDo[req.session.toDo.length-1].highlight);
      //req.session.toDo[req.session.toDo.length-1].highlight = false;
      //console.log("req.session.toDo[i]:" + req.session.toDo[req.session.toDo.length-1].highlight);
      warmEnough = true;
    } else{
      warmEnough = false;
    }
    //return checkTemp;
  });
  return warmEnough;
}
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

