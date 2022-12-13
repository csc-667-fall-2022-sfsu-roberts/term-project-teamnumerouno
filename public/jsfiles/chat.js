document 

.querySelector("#message")
.addEventListener("keydown", (chat) => {
    if(chat.keyCode == 13){
        fetch("/chat/0", {
            method: "post",
            headers: { "Content-Type": "term-project-teamnumerouno/json"},
            body: JSON.stringify({message: chat.target.value}), 
        })
        .then(() => {
            document.querySelector("#message").value = "";
        })
        .catch((error) => console.log(error));
    }
})

const messages = document.querySelector("#messages");

//Socket-related
socket.on("chat:0", ({sender, message, timestamp}) => {
    const template = document.querySelector("#messge");

    const content = template.content.cloneNode(true);
    content.querySelector(".messenger").innerText = messenger; //Sender
    content.querySelector(".chat").innerText = chat; //Chat Content
    content.querySelector(".time").innerText = time; //Timestamp

    messages.appendChild(content); //Returns the message
})