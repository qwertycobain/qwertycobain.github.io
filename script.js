var intervalo = window.setInterval(carregar,1000)


function carregar()
{
    var msg = window.document.getElementById("test")
    var foto = window.document.getElementById("fotolegal")
    var hora = new Date()
    // agora = 22 
    var agora = hora.getHours()
    var min = hora.getMinutes()
    var secs = hora.getSeconds()
    if (agora < 10){
        agora= (`0${agora}`)
    }
    if (min < 10){
        min = (`0${min}`)
    }
    if (secs < 10 ){
        secs = (`0${secs}`)
    }
    
    msg.style.color = "black"
    msg.style.fontFamily = "monospace"
    msg.innerHTML = (`is ${agora}:${min}:${secs} hours <br>`)
    //msg.innerHTML = (`its ${agora} hours <br>`)
    if (agora >= 6 && agora < 12)
    {
        msg.innerHTML += ("its a good time for a shot roit?")
        
        foto.scr="coke.jpg"
        document.body.background = "#ff0000"
    }
    else if (agora > 12 && agora <= 18)
    {
        msg.innerHTML += ("its a good time for smoke some weed roit?")
        foto.src = "weed.jpg"
        document.body.style.background = "#669900"
    }
    else{
        msg.innerHTML+=("its a good time for a xan roit? <br>")
        msg.innerHTML+=("good night mdfk")
        foto.src="alprazolam.jpeg"
    }
}
