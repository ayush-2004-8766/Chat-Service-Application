// =====================================================
// GLOBAL VARIABLES
// =====================================================

let stompClient = null;
let currentRoomId = null;
let currentRoomName = null;
let isConnected = false;
let currentSubscription = null;
let typingSubscription = null;


// =====================================================
// LOGIN DETAILS
// =====================================================

const token = localStorage.getItem("token");
const userName = localStorage.getItem("name");
const userEmail = localStorage.getItem("email");


// =====================================================
// CHECK LOGIN
// =====================================================

if (!token) {
    window.location.href = "/index.html";
}


// =====================================================
// SHOW USER NAME
// =====================================================

const userNameElement = document.getElementById("userName");
if (userNameElement) {
    userNameElement.innerText = userName || "User";
}


// =====================================================
// SHOW USER AVATAR
// =====================================================

const userAvatar = document.getElementById("userAvatar");
if (userAvatar) {
    userAvatar.innerText = userName ? userName.charAt(0).toUpperCase() : "U";
}


// =====================================================
// START APPLICATION
// =====================================================

connectWebSocket();
loadRooms();
loadUserStatus();
setInterval(loadUserStatus, 10000);


// =====================================================
// TYPING INDICATOR LISTENER (GLOBAL)
// =====================================================
let typingTimeout = null;

document.addEventListener("DOMContentLoaded", function() {
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
        messageInput.addEventListener("input", function() {
            if (!currentRoomId || !stompClient || !isConnected) return;

            stompClient.send("/app/typing", {}, JSON.stringify({
                roomId: currentRoomId,
                sender: userName,
                isTyping: true
            }));

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                if (stompClient && isConnected && currentRoomId) {
                    stompClient.send("/app/typing", {}, JSON.stringify({
                        roomId: currentRoomId,
                        sender: userName,
                        isTyping: false
                    }));
                }
            }, 2000);
        });
    }
});


// =====================================================
// CONNECT WEBSOCKET
// =====================================================

function connectWebSocket() {
    console.log("Connecting WebSocket...");
    const socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);

    stompClient.debug = function(message) {
        console.log("STOMP:", message);
    };

    stompClient.connect(
        {'user-email': userEmail},
        function(frame) {
            isConnected = true;
            console.log("WebSocket Connected Successfully");
            const status = document.getElementById("connectionStatus");
            if (status) {
                status.innerText = "● Connected";
                status.style.color = "#22c55e";
            }
        },
        function(error) {
            isConnected = false;
            console.error("WebSocket Connection Error:", error);
            const status = document.getElementById("connectionStatus");
            if (status) {
                status.innerText = "● Disconnected";
                status.style.color = "#ef4444";
            }
        }
    );
}


// =====================================================
// CREATE ROOM
// =====================================================

async function createRoom() {
    const roomNameInput = document.getElementById("roomName");
    const roomPasswordInput = document.getElementById("roomPassword");
    const roomName = roomNameInput.value.trim();
    const roomPassword = roomPasswordInput.value;

    if (!roomName) {
        alert("Please enter room name");
        roomNameInput.focus();
        return;
    }

    if (!roomPassword) {
        alert("Please enter room password");
        roomPasswordInput.focus();
        return;
    }

    if (roomPassword.length < 4) {
        alert("Room password must be at least 4 characters");
        roomPasswordInput.focus();
        return;
    }

    try {
        const response = await fetch(
            "/api/chat/rooms",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ roomName: roomName, roomPassword: roomPassword })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Room creation failed:", errorText);
            alert("❌ Room creation failed");
            return;
        }

        const room = await response.json();
        alert("✅ Room created successfully!");
        roomNameInput.value = "";
        roomPasswordInput.value = "";
        await loadRooms();

        if (room && room.id) {
            await joinRoom(room.id, room.roomName, roomPassword);
        }
    }
    catch (error) {
        console.error("Create Room Error:", error);
        alert("❌ Cannot connect to server");
    }
}


// =====================================================
// LOAD ROOMS
// =====================================================

async function loadRooms() {
    try {
        const response = await fetch(
            "/api/chat/rooms",
            {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            }
        );

        if (!response.ok) {
            console.error("Failed to load rooms");
            return;
        }

        const rooms = await response.json();
        const roomsDiv = document.getElementById("rooms");
        roomsDiv.innerHTML = "";

        if (!rooms || rooms.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-rooms";
            emptyMessage.innerText = "No rooms available";
            roomsDiv.appendChild(emptyMessage);
            return;
        }

        rooms.forEach(function(room) {
            const roomItem = document.createElement("div");
            roomItem.className = "room-item";

            const roomButton = document.createElement("button");
            roomButton.className = "room-button";
            roomButton.innerText = room.roomName;
            roomButton.onclick = function() {
                joinRoom(room.id, room.roomName);
            };

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-room-btn";
            deleteButton.innerText = "🗑";
            deleteButton.title = "Delete room";
            deleteButton.onclick = function(event) {
                event.stopPropagation();
                deleteRoom(room.id, room.roomName);
            };

            roomItem.appendChild(roomButton);
            roomItem.appendChild(deleteButton);
            roomsDiv.appendChild(roomItem);
        });
    }
    catch (error) {
        console.error("Load Rooms Error:", error);
    }
}


// =====================================================
// JOIN ROOM
// =====================================================

async function joinRoom(roomId, roomName, autoPassword = null) {
    if (!stompClient || !isConnected) {
        alert("WebSocket not connected");
        return;
    }

    let roomPassword = autoPassword;
    if (roomPassword === null) {
        roomPassword = prompt("🔒 Enter password for #" + roomName);
    }

    if (roomPassword === null) return;
    if (!roomPassword.trim()) {
        alert("Room password is required");
        return;
    }

    try {
        const response = await fetch(
            "/api/chat/rooms/" + roomId + "/join",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ roomPassword: roomPassword })
            }
        );

        if (!response.ok) {
            alert("❌ Incorrect room password");
            return;
        }

        if (currentSubscription) {
            currentSubscription.unsubscribe();
            currentSubscription = null;
        }

        currentRoomId = roomId;
        currentRoomName = roomName;
        document.getElementById("currentRoom").innerText = "Room: " + roomName;
        document.getElementById("messages").innerHTML = "";

        // 1. Load History First
        await loadMessageHistory(roomId);

        // 2. Mark Messages as Read API Call
        try {
            const readResponse = await fetch("/api/chat/messages/read/" + roomId + "?readerName=" + encodeURIComponent(userName), {
                method: "POST",
                headers: { "Authorization": "Bearer " + token }
            });
            console.log("Read API Status:", readResponse.status);
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }

        // 3. Subscribe to Read Status for Live Double Ticks
        stompClient.subscribe("/topic/room/" + roomId + "/read", function(message) {
            const reader = message.body;
            if (reader !== userName) {
                const messageDivs = document.querySelectorAll(".message-sent");
                messageDivs.forEach(div => {
                    const tickSpan = div.querySelector(".tick-mark");
                    if (tickSpan) {
                        tickSpan.innerText = "✓✓";
                        tickSpan.style.color = "#3b82f6"; // Blue Ticks
                    }
                });
            }
        });

        // 4. Subscribe Room Messages
        currentSubscription = stompClient.subscribe(
            "/topic/room/" + roomId,
            function(message) {
                try {
                    const received = JSON.parse(message.body);
                    displayMessage(received);
                } catch (error) {
                    console.error("Message parse error:", error);
                }
            }
        );

        console.log("Joined room:", roomName);
    }
    catch (error) {
        console.error("Join Room Error:", error);
        alert("❌ Cannot connect to server");
    }
}


// =====================================================
// SUBSCRIBE TYPING STATUS (GLOBAL LISTENER)
// =====================================================
// Note: Handled inside room subscription dynamically, or kept clean.


// =====================================================
// LOAD MESSAGE HISTORY
// =====================================================

async function loadMessageHistory(roomId) {
    try {
        const response = await fetch(
            "/api/chat/messages/room/" + roomId,
            {
                method: "GET",
                headers: { "Authorization": "Bearer " + token }
            }
        );

        if (!response.ok) {
            console.error("Failed to load message history");
            return;
        }

        const messages = await response.json();

        messages.forEach(function(message) {
            displayMessage(message);
        });
    }
    catch (error) {
        console.error("Error loading message history:", error);
    }
}


// =====================================================
// SEND MESSAGE
// =====================================================

function sendMessage() {
    if (!currentRoomId) {
        alert("Please select a room first");
        return;
    }

    if (!stompClient || !isConnected) {
        alert("WebSocket is not connected");
        return;
    }

    const input = document.getElementById("messageInput");
    const content = input.value.trim();

    if (!content) return;

    const message = {
        roomId: currentRoomId,
        sender: userName,
        content: content,
        type: "CHAT"
    };

    stompClient.send("/app/chat", {}, JSON.stringify(message));
    input.value = "";
    input.focus();
}


// =====================================================
// DISPLAY MESSAGE (WITH TICKS & IMAGES)
// =====================================================
function displayMessage(message) {
    const messagesDiv = document.getElementById("messages");

    const welcome = messagesDiv.querySelector(".welcome");
    if (welcome) {
        welcome.remove();
    }

    const div = document.createElement("div");
    const isMe = message.sender === userName;
    div.className = "message " + (isMe ? "message-sent" : "message-received");

    const sender = document.createElement("strong");
    sender.textContent = message.sender || "User";

    const content = document.createElement("div");
    content.className = "message-content";

    const isImage = message.type === "IMAGE" || (message.content && message.content.startsWith("/uploads/"));

    if (isImage) {
        const img = document.createElement("img");
        if (message.content.startsWith("/uploads/")) {
            img.src = "http://localhost:8080" + message.content;
        } else {
            img.src = message.content;
        }
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.style.marginTop = "5px";
        content.appendChild(img);
    } else {
        content.textContent = message.content || "";
    }

    // Read Receipt Ticks Logic
    if (isMe) {
        const tickSpan = document.createElement("span");
        tickSpan.className = "tick-mark"; // Important for live update
        tickSpan.style.fontSize = "0.75rem";
        tickSpan.style.marginLeft = "5px";

        tickSpan.innerText = message.status === "READ" ? "✓✓" : "✓";
        tickSpan.style.color = message.status === "READ" ? "#3b82f6" : "#9ca3af";
        content.appendChild(tickSpan);
    }

    div.appendChild(sender);
    div.appendChild(content);
    messagesDiv.appendChild(div);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


// =====================================================
// DELETE ROOM
// =====================================================

async function deleteRoom(roomId, roomName) {
    const confirmed = confirm("⚠️ Delete room '" + roomName + "'?\n\nAll messages related to this room may also be deleted.");
    if (!confirmed) return;

    try {
        const response = await fetch(
            "/api/chat/rooms/" + roomId,
            {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Delete Room Failed:", errorText);

            if (response.status === 403) {
                alert("❌ You are not the owner of this room.");
            } else {
                alert("❌ Failed to delete room.");
            }
            return;
        }

        alert("✅ Room deleted successfully.");

        if (currentRoomId === roomId) {
            currentRoomId = null;
            currentRoomName = null;

            if (currentSubscription) {
                currentSubscription.unsubscribe();
                currentSubscription = null;
            }

            document.getElementById("currentRoom").innerText = "Select a room";
            document.getElementById("messages").innerHTML = `
                <div class="welcome">
                    <div class="welcome-icon">💬</div>
                    <h2>Welcome to Softmint Chat</h2>
                    <p>Select a room and start chatting in real-time.</p>
                </div>
            `;
        }

        await loadRooms();
    }
    catch (error) {
        console.error("Delete Room Error:", error);
        alert("❌ Cannot connect to server.");
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {
    if (stompClient && isConnected) {
        stompClient.disconnect(function() {
            console.log("WebSocket disconnected");
        });
    }

    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    window.location.href = "/index.html";
}


// =====================================================
// ENTER KEY
// =====================================================

function handleEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}


// =====================================================
// SEND IMAGE
// =====================================================
function sendImage() {
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Image = event.target.result;

        const message = {
            roomId: currentRoomId,
            sender: userName,
            content: base64Image,
            type: "IMAGE"
        };

        stompClient.send("/app/chat", {}, JSON.stringify(message));
        fileInput.value = "";
    };
    reader.readAsDataURL(file);
}


// =====================================================
// LOAD USER STATUS (LAST SEEN LOGIC)
// =====================================================
async function loadUserStatus() {
    try {
        const response = await fetch("/api/users/status", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) return;

        const users = await response.json();
        const usersDiv = document.getElementById("usersList");

        if (!usersDiv) return;
        usersDiv.innerHTML = "";

        users.forEach(user => {
            if (user.name === userName) return;

            const userItem = document.createElement("div");
            userItem.className = "room-item";
            userItem.style.display = "flex";
            userItem.style.justifyContent = "space-between";
            userItem.style.padding = "12px";
            userItem.style.color = "#d1d5db";
            userItem.style.borderBottom = "1px solid #374151";

            const nameSpan = document.createElement("strong");
            nameSpan.innerText = user.name;

            const statusSpan = document.createElement("span");

            if (user.isOnline) {
                statusSpan.innerHTML = "🟢 Online";
                statusSpan.style.color = "#22c55e";
                statusSpan.style.fontSize = "0.85rem";
            } else {
                let timeText = "Offline";
                if (user.lastSeen) {
                    const date = new Date(user.lastSeen);
                    timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                statusSpan.innerHTML = "🕒 " + timeText;
                statusSpan.style.color = "#9ca3af";
                statusSpan.style.fontSize = "0.8rem";
            }

            userItem.appendChild(nameSpan);
            userItem.appendChild(statusSpan);
            usersDiv.appendChild(userItem);
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}


// =====================================================
// EMOJI PICKER LOGIC
// =====================================================
function toggleEmojiPicker() {
    const picker = document.getElementById("emojiPicker");
    if (picker) {
        picker.style.display = picker.style.display === "none" ? "block" : "none";
    }
}

function insertEmoji(emoji) {
    const input = document.getElementById("messageInput");
    if (input) {
        input.value += emoji;
        input.focus();
    }
    const picker = document.getElementById("emojiPicker");
    if (picker) {
        picker.style.display = "none";
    }
}

document.addEventListener("click", function(event) {
    const picker = document.getElementById("emojiPicker");
    const emojiBtn = document.getElementById("emojiBtn");
    if (picker && emojiBtn) {
        if (!picker.contains(event.target) && !emojiBtn.contains(event.target)) {
            picker.style.display = "none";
        }
    }
});