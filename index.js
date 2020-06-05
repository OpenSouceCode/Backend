const express = require('express');
const server = express();
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended:true}));

server.get('/', function(req, res){
    res.send('Working');
})

var clientid = '3157a2cc9b56ba3637f2';
var clientsecret = '1aa806057c1bd13477c29606944bffade30997a8';

server.get('/organizations', async function(req, res){
    var data = [];
    fetch(`https://api.github.com/organizations?per_page=100&client_id=${clientid}&client_secret=${clientsecret}`).then(function(response){return response.json();}).then(function(json){
        data = Object.keys(json);
        console.log(data.length);
        res.send(data);
    });
})

server.get('/languages', function(req, res){
    var languages = {};
    fetch(`https://api.github.com/repos/shubhamxkumar/languages/languages?client_id=${clientid}&client_secret=${clientsecret}`).then(function(response){
        return response.json();
    }).then(function(json){
        languages = json;
        console.log(languages);
        res.send(languages);
    })
})

server.get('/feed', function(req, res) {
    var type = req.body.type;
    var owner = req.body.owner;
    var filterLang = req.body.filter;
    console.log(filterLang);
    var data = [];
    if(type!=null&&owner!=null){
        if(type == 'users'){
            fetch(`https://api.github.com/users/${owner}/repos?client_id=${clientid}&client_secret=${clientsecret}`).then(function(response){
                return response.json();
        }).then(async function(json){
            data = json;
            if(filterLang == null){
                res.send(data);
            }
            var filteredData = []; 
            for(var i =0;i<data.length;i++){
                var dataLang = [];
                await fetch(`${data[i]["languages_url"]}?client_id=${clientid}&client_secret=${clientsecret}`).then(function(response){
                    return response.json();
                }).then(function(json){
                    var flag = 0;
                    dataLang = Object.keys(json);
                    for(var j = 0 ; j<dataLang.length ; j++){
                        if(dataLang[j] == filterLang){
                            console.log(filterLang);
                            console.log(dataLang[j]);
                            flag++;
                        }
                    }
                    if(flag>0){
                        console.log(data[i]["name"]);
                        filteredData.push(data[i]);
                    }
                });
            }
            console.log(filteredData.length); 
            res.send(filteredData);
        });
        }
        else if(type == 'organizations'){
            fetch(`https://api.github.com/orgs/${owner}/repos?client_id=${clientid}&client_secret=${clientsecret}`).then(function(response){
                return response.json();
        }).then(async function(json){
            data = json;
            if(filterLang == null){
                res.send(data);
            }
            var filteredData = []; 
            for(var i =0;i<data.length;i++){
                var dataLang = [];
                await fetch(`${data[i]["languages_url"]}?client_id=${clientid}&client_secret=${clientsecret}`).then(function(response){
                    return response.json();
                }).then(function(json){
                    var flag = 0;
                    dataLang = Object.keys(json);
                    for(var j = 0 ; j<dataLang.length ; j++){
                        if(dataLang[j] == filterLang){
                            console.log(filterLang);
                            console.log(dataLang[j]);
                            flag++;
                        }
                    }
                    if(flag>0){
                        console.log(data[i]["name"]);
                        filteredData.push(data[i]);
                    }
                });
            }
            console.log(filteredData.length); 
            res.send(filteredData);
        });
        }
        else {
            res.send('Invalid Type');
        }
    }
    else{
        res.send('Invalid Type');
    }
})

const port = 3000;

server.listen(port, function(){
    console.log('Server running on port: ' + port);
})