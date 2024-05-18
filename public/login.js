const socket = io();

async function checkLogin(){

    
    let user;
    if(sessionStorage.hclc){ 
        user = JSON.parse(sessionStorage.hclc);
    }

    socket.emit("loggedin",user);


    /*
    let login = await fetch("/checkLogin",{
        "method":"POST",
        "headers":{
            "content-type":"application/json"},
            "body":JSON.stringify(user)
    });
    let res = await login.json();
    
    if(res.passes === true){
        window.location.replace("index.html");
    }
    */
};


checkLogin();

async function login(){
    let user = {
        "name":document.getElementById("username").value.toLocaleLowerCase(),
        "password":document.getElementById("password").value,
        "timestamp":Date.now()
    }

    socket.emit("login",user);

    /* 

    const options = {
        "method":"POST",
        "headers":{ 
            "content-type":"application/json"
        },
        "body":JSON.stringify(user)
    }

    const res = await fetch('/login', options)
    const obj = await res.json()
    console.log(obj)
    if(obj.passes === true){ 
        user={
            "name":obj.name,
            "timestamp":obj.timestamp,
            "loggedIn":obj.loggedIn,
            "id":obj.id
        }

        async function setStorage() {
            sessionStorage.hclc = JSON.stringify(user);
        }

        setStorage().then(() => {
            window.location.replace("index.html");
        })

        
        
        console.log(user)
    }else{
        console.log(obj.error)
    }

    return obj;
*/
}

socket.on("loggedin",(user) => {
    if(user.error === false){
        window.location.replace("index.html");
    }
})


socket.on("login", (user) => {
    if(user.passes){
        sessionStorage.hclc = user;
        //window.location.replace("index.html")
    }
})