async function register(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const passvord = document.getElementById("password2").value;

    if(password != passvord){
        return "passwords must match!"
    }

    const options = {
        "method":"POST",
        "headers":{ 
            "content-type":"application/json"
        },
        "body":JSON.stringify({"username":username})
    }
    const res = await fetch("/register", options)
    const obj = await res.json()
    console.log(obj)
    
    if(obj.error != false){
        document.getElementById("alert").innerText = obj.error || "Unknown error";
        document.getElementById("alert").classList.remove("hidden")
    }

    if(obj.passes === true){
        user={
            "name":res.name,
            "timestamp":res.timestamp,
            "loggedIn":res.loggedIn,
            "id":res.id
        }

        sessionStorage.hclc = JSON.stringify(user)

        window.location.replace("index.html")
        return user;
    }else{
        console.log(res.error)
        return;
    }
}

document.getElementById("login").onkeyup = (e) => {
    if(e.key === "Enter" && document.getElementById("password2").value && document.getElementById("username").value &&  document.getElementById("password").value){
        console.log(register());
    }
}