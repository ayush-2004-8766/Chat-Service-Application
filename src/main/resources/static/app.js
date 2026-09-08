let stompClient = null;

let currentRoomId = null;

let isConnected = false;

const token =
    localStorage.getItem("token");

const userName =
    localStorage.getItem("name");


if (!token) {

    window.location.href =
        "/index.html";
}


document.getElementById(
    "userName"
).innerText =
    userName;


connectWebSocket();

loadRooms();

function connectWebSocket() {

    console.log("Connecting WebSocket...");

    const socket = new SockJS("/ws");

    stompClient = Stomp.over(socket);

    stompClient.debug = function(message) {
        console.log("STOMP:", message);
    };

    stompClient.connect(
        {},
        function(frame) {

            isConnected = true;

            console.log(
                "WebSocket Connected Successfully"
            );

            document.getElementById(
                "connectionStatus"
            ).innerText = "● Connected";

            document.getElementById(
                "connectionStatus"
            ).style.color = "#22c55e";

        },
        function(error) {

            isConnected = false;

            console.error(
                "WebSocket Connection Error:",
                error
            );

            document.getElementById(
                "connectionStatus"
            ).innerText = "● Disconnected";

            document.getElementById(
                "connectionStatus"
            ).style.color = "#ef4444";
        }
    );
}

async function createRoom() {

    const roomName =
        document.getElementById(
            "roomName"
        ).value;

    if (!roomName) {

        alert(
            "Enter room name"
        );

        return;
    }

    const response =
        await fetch(
            "/api/chat/rooms",
            {
                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    roomName: roomName
                })
            }
        );

    if (!response.ok) {

        alert(
            "Room creation failed"
        );

        return;
    }

    const room =
        await response.json();

    alert(
        "Room created: "
        + room.roomName
    );

    document.getElementById(
        "roomName"
    ).value = "";

    loadRooms();
}


async function loadRooms() {

    const response =
        await fetch(
            "/api/chat/rooms",
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

    if (!response.ok) {

        return;
    }

    const rooms =
        await response.json();

    const roomsDiv =
        document.getElementById(
            "rooms"
        );

    roomsDiv.innerHTML = "";

    rooms.forEach(
        function (room) {

            const button =
                document.createElement(
                    "button"
                );

            button.innerText =
                room.roomName;

            button.className =
                "room-button";

            button.onclick =
                function () {

                    joinRoom(
                        room.id,
                        room.roomName
                    );

                };

            roomsDiv.appendChild(
                button
            );
        }
    );
}


function joinRoom(
    roomId,
    roomName
) {

    currentRoomId =
        roomId;

    document.getElementById(
        "currentRoom"
    ).innerText =
        "Room: " + roomName;

    document.getElementById(
        "messages"
    ).innerHTML = "";

    if (!stompClient) {

        alert(
            "WebSocket not connected"
        );

        return;
    }

    stompClient.subscribe(
        "/topic/room/" + roomId,
        function (message) {

            const received =
                JSON.parse(
                    message.body
                );

            displayMessage(
                received
            );

        }
    );
}


function sendMessage() {

    if (!currentRoomId) {

        alert(
            "Please select a room"
        );

        return;
    }

    const input =
        document.getElementById(
            "messageInput"
        );

    const content =
        input.value.trim();

    if (!content) {

        return;
    }

    const message = {

        roomId:
            currentRoomId,

        sender:
            userName,

        content:
            content,

        type:
            "CHAT"
    };

    stompClient.send(
        "/app/chat",
        {},
        JSON.stringify(message)
    );

    input.value = "";
}


function displayMessage(
    message
) {

    const messagesDiv =
        document.getElementById(
            "messages"
        );

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message";

    div.innerHTML =
        "<strong>"
        + message.sender
        + ":</strong> "
        + message.content;

    messagesDiv.appendChild(
        div
    );

    messagesDiv.scrollTop =
        messagesDiv.scrollHeight;
}


function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "name"
    );

    localStorage.removeItem(
        "email"
    );

    window.location.href =
        "/index.html";
}

function handleEnter(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }
}