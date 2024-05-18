async function checkLogin(){
    let user;
    if(sessionStorage.hclc){
        user = JSON.parse(sessionStorage.hclc);
    }
    let login = await fetch("/checkLogin",{"method":"POST","headers":{"content-type":"application/json"},"body":JSON.stringify(user)});
    let res = await login.json();
    if(res.passes === false){
        window.location.replace("login.html");
    }
};

checkLogin();
let autoscroll = true;
function logout(){
    sessionStorage.removeItem("hclc");
    window.location.replace("login.html");
}

function openSettings(){
    document.getElementById("settings_button").innerHTML = '<button id="settings_control" class="setting_button" onClick="closeSettings()"><p class="setting_word">close</p></button>';
    document.getElementById("settings").classList.remove("hidden");
    document.getElementById("text").classList.add("hidden");
    document.getElementById("menu").classList.add("hidden");
}

function closeSettings(){
    document.getElementById("settings_button").innerHTML = '<button id="settings_control" class="setting_button" onClick="openSettings()"><p class="setting_word">settings</p></button>';
    document.getElementById("text").classList.remove("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("settings").classList.add("hidden");
}

function switchAutoscroll(){
    switch(autoscroll){
        case true:
            autoscroll = false;
        break;
        case false:
            autoscroll = true;
        break;
        default:
            autoscroll = true;
    }
};

let channel = 0;
const socket = io();
async function displayMessages(channel){
    let chan = await fetch("/channel",{"method":"POST","headers":{"content-type":"application/json"},"body":JSON.stringify({"give":`${channel}`})});
    channel = await chan.json();console.log(channel);
    document.getElementById("messages").innerHTML = "";
    for(var i = 0; i < channel.messages.length; i++){
        let message = channel.messages[i];
        let d = new Date(message.timestamp);
        d = `${d}`.substring(0,21);
        const msgHeader = document.createElement("p");
        msgHeader.innerText = `${message.author} - ${d}`;
        msgHeader.classList.add("message_header");
        const p = document.createElement("p");
        p.innerText = message.content;p.classList.add("message_content");
        const span = document.createElement("span");
        span.classList.add("message");
        span.appendChild(msgHeader);
        span.appendChild(p);
        document.getElementById("messages").appendChild(span);
        span.scrollIntoView({ behavior: "smooth", block: "end" });
    }
       
};

displayMessages(channel)

function addMessage(message){
        let d = new Date(message.timestamp);
        d = `${d}`.substring(0,21);
        const msgHeader = document.createElement("p");
        msgHeader.innerText = `${message.author} - ${d}`;
        msgHeader.classList.add("message_header");
        const p = document.createElement("p");
        p.innerText = message.content;p.classList.add("message_content");
        const span = document.createElement("span");
        span.classList.add("message");
        span.appendChild(msgHeader);
        span.appendChild(p);
        document.getElementById("messages").appendChild(span);
        if(autoscroll === true){
            span.scrollIntoView({ behavior: "smooth", block: "end" });            
        }
}

async function send(messageContent){
    let message = {
        content:messageContent,
        author:JSON.parse(sessionStorage.hclc),
        timestamp:Date.now(),
        channel:channel
    };
    socket.emit("message", message);
    return message;
}

socket.on("message",(message) => {
    console.log("new message")
    document.getElementById("input").value = "";

    if(message.send){
        addMessage(message);
    }
    
});

let shift = false;
document.getElementById("input").onkeydown = (e) =>{
    if(e.key === "Shift"){
        shift = true;
    }
};

document.getElementById("input").onkeyup = (e) => {
    if(e.key === "Enter" && shift === false){
        let val = document.getElementById("input").value;
        val = val.substring(0,val.length-1);
        send(val).then((res) => {
            //addMessage(res);
            //document.getElementById("input").value = "";
        });
        }
    shift = false;
}
