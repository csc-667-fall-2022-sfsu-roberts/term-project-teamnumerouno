const listOfGames = document.querySelector("#gamesList ul");

socket.on("game:created", ({gameId, title}) => {
    const li = document.createElement("li");
    const span = document.createElement("span");

    span.innerText = title;

    const form = document.createElement("form");
    form.action = `/games/${gameId}/join`;
    form.method = "post";

    const button = document.createElement("button");
    button.innerText = "Join Game";

    form.appendChild(button);

    li.appendChild(span);
    li.appendChild(form);

    gamesList.appendChild(li);
})