// =====================================================
// GLOBAL VARIABLES
// =====================================================

let stompClient = null;

let currentRoomId = null;

let currentRoomName = null;

let isConnected = false;

let currentSubscription = null;


// =====================================================
// LOGIN DETAILS
// =====================================================

const token =
    localStorage.getItem("token");

const userName =
    localStorage.getItem("name");


// =====================================================
// CHECK LOGIN
// =====================================================

if (!token) {

    window.location.href =
        "/index.html";

}


// =====================================================
// SHOW USER NAME
// =====================================================

const userNameElement =
    document.getElementById("userName");

if (userNameElement) {

    userNameElement.innerText =
        userName || "User";

}


// =====================================================
// SHOW USER AVATAR
// =====================================================

const userAvatar =
    document.getElementById("userAvatar");

if (userAvatar) {

    userAvatar.innerText =
        userName
            ? userName.charAt(0).toUpperCase()
            : "U";

}


// =====================================================
// START APPLICATION
// =====================================================

connectWebSocket();

loadRooms();


// =====================================================
// CONNECT WEBSOCKET
// =====================================================

function connectWebSocket() {

    console.log(
        "Connecting WebSocket..."
    );


    const socket =
        new SockJS("/ws");


    stompClient =
        Stomp.over(socket);


    // Disable excessive STOMP console logs
    stompClient.debug =
        function(message) {

            console.log(
                "STOMP:",
                message
            );

        };


    // =================================================
    // CONNECT
    // =================================================

    stompClient.connect(

        {},

        function(frame) {

            isConnected = true;

            console.log(
                "WebSocket Connected Successfully"
            );


            const status =
                document.getElementById(
                    "connectionStatus"
                );


            if (status) {

                status.innerText =
                    "● Connected";

                status.style.color =
                    "#22c55e";

            }

        },


        function(error) {

            isConnected = false;


            console.error(
                "WebSocket Connection Error:",
                error
            );


            const status =
                document.getElementById(
                    "connectionStatus"
                );


            if (status) {

                status.innerText =
                    "● Disconnected";

                status.style.color =
                    "#ef4444";

            }

        }

    );

}


// =====================================================
// CREATE ROOM
// =====================================================

async function createRoom() {

    const roomNameInput =
        document.getElementById(
            "roomName"
        );


    const roomPasswordInput =
        document.getElementById(
            "roomPassword"
        );


    const roomName =
        roomNameInput.value.trim();


    const roomPassword =
        roomPasswordInput.value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!roomName) {

        alert(
            "Please enter room name"
        );

        roomNameInput.focus();

        return;

    }


    if (!roomPassword) {

        alert(
            "Please enter room password"
        );

        roomPasswordInput.focus();

        return;

    }


    if (roomPassword.length < 4) {

        alert(
            "Room password must be at least 4 characters"
        );

        roomPasswordInput.focus();

        return;

    }


    // =================================================
    // API CALL
    // =================================================

    try {

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

                    body:
                        JSON.stringify({

                            roomName:
                                roomName,

                            roomPassword:
                                roomPassword

                        })

                }
            );


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Room creation failed:",
                errorText
            );


            alert(
                "❌ Room creation failed"
            );


            return;

        }


        // =================================================
        // SUCCESS
        // =================================================

        const room =
            await response.json();


        alert(
            "✅ Room created successfully!"
        );


        // =================================================
        // CLEAR INPUTS
        // =================================================

        roomNameInput.value = "";

        roomPasswordInput.value = "";


        // =================================================
        // RELOAD ROOMS
        // =================================================

        await loadRooms();


        // =================================================
        // OPTIONAL:
        // AUTOMATICALLY JOIN CREATED ROOM
        // =================================================

        if (room && room.id) {

            await joinRoom(
                room.id,
                room.roomName,
                roomPassword
            );

        }

    }
    catch (error) {

        console.error(
            "Create Room Error:",
            error
        );


        alert(
            "❌ Cannot connect to server"
        );

    }

}


// =====================================================
// LOAD ROOMS
// =====================================================

async function loadRooms() {

    try {

        const response =
            await fetch(
                "/api/chat/rooms",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            console.error(
                "Failed to load rooms"
            );

            return;

        }


        const rooms =
            await response.json();


        const roomsDiv =
            document.getElementById(
                "rooms"
            );


        roomsDiv.innerHTML = "";


        // =================================================
        // NO ROOMS
        // =================================================

        if (!rooms ||
            rooms.length === 0) {

            const emptyMessage =
                document.createElement(
                    "div"
                );


            emptyMessage.className =
                "empty-rooms";


            emptyMessage.innerText =
                "No rooms available";


            roomsDiv.appendChild(
                emptyMessage
            );


            return;

        }


        // =================================================
        // CREATE ROOM ITEMS
        // =================================================

        rooms.forEach(
            function(room) {

                // =========================================
                // ROOM ITEM
                // =========================================

                const roomItem =
                    document.createElement(
                        "div"
                    );


                roomItem.className =
                    "room-item";


                // =========================================
                // ROOM BUTTON
                // =========================================

                const roomButton =
                    document.createElement(
                        "button"
                    );


                roomButton.className =
                    "room-button";


                roomButton.innerText =
                    room.roomName;


                roomButton.onclick =
                    function() {

                        joinRoom(
                            room.id,
                            room.roomName
                        );

                    };


                // =========================================
                // DELETE BUTTON
                // =========================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.className =
                    "delete-room-btn";


                deleteButton.innerText =
                    "🗑";


                deleteButton.title =
                    "Delete room";


                deleteButton.onclick =
                    function(event) {

                        event.stopPropagation();

                        deleteRoom(
                            room.id,
                            room.roomName
                        );

                    };


                // =========================================
                // ADD ELEMENTS
                // =========================================

                roomItem.appendChild(
                    roomButton
                );


                roomItem.appendChild(
                    deleteButton
                );


                roomsDiv.appendChild(
                    roomItem
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Load Rooms Error:",
            error
        );

    }

}


// =====================================================
// JOIN ROOM
// =====================================================

async function joinRoom(
    roomId,
    roomName,
    autoPassword = null
) {

    // =================================================
    // CHECK WEBSOCKET
    // =================================================

    if (!stompClient ||
        !isConnected) {

        alert(
            "WebSocket not connected"
        );

        return;

    }


    // =================================================
    // ASK PASSWORD
    // =================================================

    let roomPassword =
        autoPassword;


    if (roomPassword === null) {

        roomPassword =
            prompt(
                "🔒 Enter password for #" +
                roomName
            );

    }


    // =================================================
    // CANCEL
    // =================================================

    if (roomPassword === null) {

        return;

    }


    // =================================================
    // EMPTY PASSWORD
    // =================================================

    if (!roomPassword.trim()) {

        alert(
            "Room password is required"
        );

        return;

    }


    // =================================================
    // VERIFY PASSWORD
    // =================================================

    try {

        const response =
            await fetch(
                "/api/chat/rooms/"
                + roomId
                + "/join",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body:
                        JSON.stringify({

                            roomPassword:
                                roomPassword

                        })

                }
            );


        // =================================================
        // WRONG PASSWORD
        // =================================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Join Room Failed:",
                errorText
            );


            alert(
                "❌ Incorrect room password"
            );


            return;

        }


        // =================================================
        // PASSWORD CORRECT
        // =================================================

        console.log(
            "Room password verified"
        );


        // =================================================
        // UNSUBSCRIBE OLD ROOM
        // =================================================

        if (currentSubscription) {

            currentSubscription.unsubscribe();

            currentSubscription =
                null;

        }


        // =================================================
        // SET CURRENT ROOM
        // =================================================

        currentRoomId =
            roomId;


        currentRoomName =
            roomName;


        document.getElementById(
            "currentRoom"
        ).innerText =
            "Room: " + roomName;


        // =================================================
        // CLEAR MESSAGES
        // =================================================

        document.getElementById(
            "messages"
        ).innerHTML = "";


        // =================================================
        // LOAD HISTORY
        // =================================================

        await loadMessageHistory(
            roomId
        );


        // =================================================
        // SUBSCRIBE ROOM
        // =================================================

        currentSubscription =
            stompClient.subscribe(

                "/topic/room/" +
                roomId,

                function(message) {

                    try {

                        const received =
                            JSON.parse(
                                message.body
                            );


                        displayMessage(
                            received
                        );

                    }
                    catch (error) {

                        console.error(
                            "Message parse error:",
                            error
                        );

                    }

                }

            );


        console.log(
            "Joined room:",
            roomName
        );


    }
    catch (error) {

        console.error(
            "Join Room Error:",
            error
        );


        alert(
            "❌ Cannot connect to server"
        );

    }

}


// =====================================================
// LOAD MESSAGE HISTORY
// =====================================================

async function loadMessageHistory(
    roomId
) {

    try {

        const response =
            await fetch(
                "/api/chat/messages/room/"
                + roomId,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            console.error(
                "Failed to load message history"
            );

            return;

        }


        const messages =
            await response.json();


        // =================================================
        // DISPLAY MESSAGES
        // =================================================

        messages.forEach(
            function(message) {

                displayMessage(
                    message
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Error loading message history:",
            error
        );

    }

}


// =====================================================
// SEND MESSAGE
// =====================================================

function sendMessage() {

    // =================================================
    // CHECK ROOM
    // =================================================

    if (!currentRoomId) {

        alert(
            "Please select a room first"
        );

        return;

    }


    // =================================================
    // CHECK WEBSOCKET
    // =================================================

    if (!stompClient ||
        !isConnected) {

        alert(
            "WebSocket is not connected"
        );

        return;

    }


    // =================================================
    // INPUT
    // =================================================

    const input =
        document.getElementById(
            "messageInput"
        );


    const content =
        input.value.trim();


    // =================================================
    // EMPTY MESSAGE
    // =================================================

    if (!content) {

        return;

    }


    // =================================================
    // MESSAGE
    // =================================================

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


    // =================================================
    // SEND STOMP
    // =================================================

    stompClient.send(

        "/app/chat",

        {},

        JSON.stringify(
            message
        )

    );


    // =================================================
    // CLEAR INPUT
    // =================================================

    input.value = "";

    input.focus();

}

// =====================================================
// DISPLAY MESSAGE
// =====================================================
function displayMessage(message) {

    const messagesDiv = document.getElementById("messages");

    // =================================================
    // REMOVE WELCOME SCREEN
    // =================================================
    const welcome = messagesDiv.querySelector(".welcome");
    if (welcome) {
        welcome.remove();
    }

    // =================================================
    // MESSAGE DIV (FIXED: Sirf ek baar declare kiya hai)
    // =================================================
    const div = document.createElement("div");

    // Check karein ki message aapne bheja hai ya kisi aur ne
    const isMe = message.sender === userName;
    div.className = "message " + (isMe ? "message-sent" : "message-received");

    // =================================================
    // SENDER
    // =================================================
    const sender = document.createElement("strong");
    sender.textContent = message.sender || "User";

    // =================================================
    // CONTENT
    // =================================================
    const content = document.createElement("span");
    content.className = "message-content";
    content.textContent = message.content || "";

    // =================================================
    // APPEND
    // =================================================
    div.appendChild(sender);
    div.appendChild(content);
    messagesDiv.appendChild(div);

    // =================================================
    // AUTO SCROLL
    // =================================================
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


// =====================================================
// DELETE ROOM
// =====================================================

async function deleteRoom(
    roomId,
    roomName
) {

    // =================================================
    // CONFIRM
    // =================================================

    const confirmed =
        confirm(
            "⚠️ Delete room '" +
            roomName +
            "'?\n\n" +
            "All messages related to this room may also be deleted."
        );


    if (!confirmed) {

        return;

    }


    // =================================================
    // DELETE API
    // =================================================

    try {

        const response =
            await fetch(
                "/api/chat/rooms/"
                + roomId,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        // =================================================
        // ERROR
        // =================================================

        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Delete Room Failed:",
                errorText
            );


            if (response.status === 403) {

                alert(
                    "❌ You are not the owner of this room."
                );

            }
            else {

                alert(
                    "❌ Failed to delete room."
                );

            }

            return;

        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            "✅ Room deleted successfully."
        );


        // =================================================
        // IF CURRENT ROOM
        // =================================================

        if (currentRoomId === roomId) {

            currentRoomId =
                null;


            currentRoomName =
                null;


            // Unsubscribe

            if (currentSubscription) {

                currentSubscription.unsubscribe();

                currentSubscription =
                    null;

            }


            // Reset header

            document.getElementById(
                "currentRoom"
            ).innerText =
                "Select a room";


            // Reset messages

            document.getElementById(
                "messages"
            ).innerHTML = `

                <div class="welcome">

                    <div class="welcome-icon">
                        💬
                    </div>

                    <h2>
                        Welcome to Softmint Chat
                    </h2>

                    <p>
                        Select a room and start chatting
                        in real-time.
                    </p>

                </div>

            `;

        }


        // =================================================
        // RELOAD ROOMS
        // =================================================

        await loadRooms();

    }
    catch (error) {

        console.error(
            "Delete Room Error:",
            error
        );


        alert(
            "❌ Cannot connect to server."
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    // =================================================
    // DISCONNECT WEBSOCKET
    // =================================================

    if (stompClient &&
        isConnected) {

        stompClient.disconnect(
            function() {

                console.log(
                    "WebSocket disconnected"
                );

            }
        );

    }


    // =================================================
    // CLEAR STORAGE
    // =================================================

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "name"
    );

    localStorage.removeItem(
        "email"
    );

    localStorage.removeItem(
        "role"
    );


    // =================================================
    // LOGIN PAGE
    // =================================================

    window.location.href =
        "/index.html";

}


// =====================================================
// ENTER KEY
// =====================================================

function handleEnter(
    event
) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

}