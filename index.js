//partially following https://www.youtube.com/watch?v=wxbQP1LMZsw and the course containing it
const serverName = "Server";

const blacklistedNames = [serverName,""," "]


//fs
const fs = require('fs');
let data = require("./data.json");
let logins = require("./logins.json");
function save(indent){
  if(indent === true){
    fs.writeFileSync("./data.json",JSON.stringify(data,null,"    "));
  }else{
    fs.writeFileSync("./data.json",JSON.stringify(data));
  }
}
function saveLogin(){
    fs.writeFileSync("./logins.json",JSON.stringify(logins))
}

//express
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json({limit:'1mb'}))
app.use(express.static("public"));


//app.listen(3000, () => console.log("listening at 3000"));

//socket.io
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname, "index.html");
});


io.on("connection", (socket) => {
  //console.log("a user connected");

  //console.log(socket.client);//for later when seein' if someone's online or not

  socket.on("deletechannel",(orders) => {
    if(orders.user.id === 0){
      data[`${orders.channel}`].messages = [];
      save()
      socket.emit("message",{content:"channel history deleted",timmestamp:Date.now(),author:serverName,send:true})
    }
  })


  //logging in
  socket.on("loggedin", (usr) => {

    if(usr === null){
      socket.emit("loggedin",{passes:false,error:"no data"})
      return;
    }
    

    let user = {
      name:usr.name,
      loggedIn:usr.loggedIn,
      timestamp:usr.timestamp,
      id:usr.id,
      error:"username not found",
      passes:false
    }
    console.log(user)

    if(logins.usernames.includes(user.name)){
      console.log("username found")

      for(var i = 0; i < logins.usernames.length; i++){

        if(logins.accounts[i].name === user.name){

          user.error = "incorrect password";

          if(logins.accounts[i].password === user.password){
            console.log("correct password")

            user = {

              "name":user.name,
              "error":false,
              "id":i,
              "loggedIn":true,
              "timestamp":user.timestamp,
              "passes":true
            };

            logins.accounts[i].timestamp = user.timestamp;
            
            saveLogin();
            }
          }
        }
      }
    else{
      }

    io.emit("loggedin",user);

  })

  //messages
  socket.on("message", (message) => {let admin = false;if(message.author.id == 0 || message.author.id == data[`${message.channel}`].owner){admin = true;}message.send = true;let content = message.content;if(content.startsWith("/")){let command = content.slice(1).split(" ")[0];let args = content.split(" ").slice(1);let msg = args.join(" ");if(command === "searchuser" && message.author.id === 0){let user = args[0];let out = {content:user,author:serverName,timestamp:message.timestamp,send:true};if(logins.usernames.includes(user)){for(var i = 0; i < logins.usernames.length; i++){if(logins.usernames[i] === user){out.content = JSON.stringify(logins.accounts[i]);};};}else{out.content = "user not found :(";}socket.emit("message",out);return;}if(command === "delall"){data[`${message.channel}`].messages = [];save();io.emit("message",{content:"channel history deleted",author:serverName,timestamp:message.timesatmp,send:true});return;}if(command === "del"){let num = parseInt(args[0]);let m = data[`${message.channel}`].messages;let l = m.length-1;data[`${message.channel}`].messages = m.slice(l,num);}message.author = message.author.name;let savedMessage = {content:message.content,author:message.author,timestamp:message.timestamp};data[`${message.channel}`].messages.push(savedMessage);save();io.emit("message", message);}else{message.author = message.author.name;let savedMessage = {content:message.content,author:message.author,timestamp:message.timestamp};data[`${message.channel}`].messages.push(savedMessage);save();io.emit("message", message);}

    
  });

  socket.on("disconnect", (user) => {
    //console.log("user disconected");
  });

});


//start server
server.listen(3000, () => {console.log("server running on http://localhost:3000");});

//get channel
app.post("/channel",(req,res) => {let out = {"messages":data[req.body.give].messages,"members":data[req.body.give].members};res.json(out);})

//login
app.post("/login",(req,res) => {
  //let user = req.body;user.error = "username not found";if(logins.usernames.includes(user.name)){for(var i = 0; i < logins.usernames.length; i++){if(logins.accounts[i].name === user.name){user.error = "incorrect password";if(logins.accounts[i].password === user.password){user = {"name":user.name,"error":false,"id":i,"loggedIn":true,"timestamp":user.timestamp,"passes":true};logins.accounts[i].timestamp = user.timestamp;saveLogin();}}}}else{}res.json(user);
})


//check if login matches
app.post("/checkLogin",(req,res) => {let user = req.body;if(!logins.accounts[user.id]){res.json({"error":"account does not exsist","passes":false});return;}let acc = logins.accounts[user.id];if(acc.timestamp === user.timestamp && acc.name === user.name){user.error = false;user.passes = true;res.json(user);}})


//create account
app.post("/register",(req,res) => {console.log("attempted sign up");let user = req.body;user.passes = false;if(logins.usernames.includes(user.username) || blacklistedNames.includes(user.username)){user.error = "username already exsists!";res.json(user);return;}else{user.passes = true;logins.usernames.push(user.username);user.id = logins.accounts.length;user.timestamp = Date.now();logins.accounts.push(user);saveLogin();res.json(user);}});

