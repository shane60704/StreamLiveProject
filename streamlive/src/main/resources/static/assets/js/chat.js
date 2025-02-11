let stompClient = null;
let currentChatRoomId = null;
let currentSubscription = null; // 儲存當前的訂閱

// 連接 WebSocket 伺服器
function connectWebSocket() {
    const socket = new SockJS('/chat');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        console.log('已連接: ' + frame);
        const userId = getCurrentUserId();
        if (userId) {
            subscribeToNewChatRoomNotifications(userId);
            loadUserChatRooms(userId);
        }
    }, function(error) {
        console.error('連接失敗:', error);
        setTimeout(connectWebSocket, 5000);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const chatIcon = document.querySelector('.alert-img');
    const floatContainer = document.querySelector('.floating-circle');
    floatContainer.addEventListener('click', function () {
        chatIcon.style.display ="none";
        chatIcon.classList.remove('new-message');
    });
});

// 訂閱新的聊天室通知
function subscribeToNewChatRoomNotifications(userId) {
    stompClient.subscribe(`/topic/newRoom/${userId}`, function(chatRoomMessage) {
        const chatRoom = JSON.parse(chatRoomMessage.body);
        console.log("收到新聊天室通知:", chatRoom);
        loadUserChatRooms(chatRoom.userBId);
        getChatRoomInfo(chatRoom.userBId,chatRoom.userAId);
        const chatIcon = document.querySelector('.alert-img');
        chatIcon.style.display ="block";
        chatIcon.classList.add('new-message');
        console.log("add new-message")
    });
}

// 訂閱特定聊天室
function subscribeToChatRoom(chatRoomId) {
    if (stompClient) {
        if (currentSubscription) {
            currentSubscription.unsubscribe(); // 正確取消訂閱
        }

        // 訂閱新的聊天室頻道
        currentSubscription = stompClient.subscribe(`/topic/chat/${chatRoomId}`, function(messageOutput) {
            const data = JSON.parse(messageOutput.body);
            displayCurrentMessage(data, true); // 新訊息觸發自動滾動
        });

        currentChatRoomId = chatRoomId;
    }
}


// 加載用戶的聊天室清單
function loadUserChatRooms(userId) {
    fetch(`/api/1.0/users/${userId}/chatrooms`)
        .then(response => response.json())
        .then(chatRooms => {
            chatRooms.data.forEach(chatRoom => {
                addChatRoomToList(chatRoom);
            });
        })
        .catch(error => console.error('加載聊天室清單失敗:', error));
}

// 顯示聊天室列表中的新聊天室 (加入頭像、名稱、訊息和時間)
// chatRoom => id , uniqueChatroom , senderInfo[id,name,email,image] , receiverInfo[id,name,email,image] , recentMessage
function addChatRoomToList(chatRoom) {
    const chatRoomList = document.getElementById("chatRoomList");
    const userId = getCurrentUserId();
    const isCurrentUserSender = chatRoom.senderInfo.id === userId;

    const contactInfo = !isCurrentUserSender ? chatRoom.receiverInfo : chatRoom.senderInfo;
    const recentMessage = chatRoom.recentMessage ? chatRoom.recentMessage.content : '';
    const recentTimestamp = chatRoom.recentMessage ? formatTimestamp(chatRoom.recentMessage.timestamp) : '';

    if (!document.querySelector(`li[data-chat-room-id="${chatRoom.id}"]`)) {
        const listItem = document.createElement("li");
        listItem.classList.add("chat-room-item");
        listItem.dataset.chatRoomId = chatRoom.id;
        listItem.onclick = function() {
            joinChatRoom(chatRoom.id, contactInfo.name);
        };

        // 添加頭像
        const avatar = document.createElement("img");
        avatar.src = contactInfo.image ? contactInfo.image : 'https://seanproject.s3.ap-northeast-1.amazonaws.com/user.png';
        avatar.alt = contactInfo.name;
        avatar.classList.add("chat-room-avatar");

        // 添加聊天室資訊區域
        const chatInfoWrapper = document.createElement("div");
        chatInfoWrapper.classList.add("chat-info-wrapper");

        // 添加名稱和訊息
        const chatName = document.createElement("div");
        chatName.textContent = contactInfo.name;
        chatName.classList.add("chat-room-name");

        const lastMessage = document.createElement("div");
        lastMessage.textContent = recentMessage;
        lastMessage.classList.add("chat-room-last-message");

        // 添加時間
        const timestamp = document.createElement("div");
        timestamp.textContent = recentTimestamp;
        timestamp.classList.add("chat-room-timestamp");

        chatInfoWrapper.appendChild(chatName);
        chatInfoWrapper.appendChild(lastMessage);

        listItem.appendChild(avatar);
        listItem.appendChild(chatInfoWrapper);
        listItem.appendChild(timestamp);
        chatRoomList.appendChild(listItem);
    }
}

// 顯示聊天室列表中的新聊天室 (加入頭像、名稱、訊息和時間)
function addNewChatRoomToList(chatRoom) {
    console.log("addChatRoomToList:"+JSON.stringify(chatRoom));
    const chatRoomList = document.getElementById("chatRoomList");
    const userId = getCurrentUserId();
    const isCurrentUserSender = chatRoom.userAId.id === userId;

    const contactInfo = !isCurrentUserSender ? chatRoom.receiverInfo : chatRoom.senderInfo;
    const recentMessage = chatRoom.recentMessage ? chatRoom.recentMessage.content : '';
    const recentTimestamp = chatRoom.recentMessage ? formatTimestamp(chatRoom.recentMessage.timestamp) : '';

    if (!document.querySelector(`li[data-chat-room-id="${chatRoom.id}"]`)) {
        const listItem = document.createElement("li");
        listItem.classList.add("chat-room-item");
        listItem.dataset.chatRoomId = chatRoom.id;
        listItem.onclick = function() {
            console.log(chatRoom.id);
            console.log(contactInfo.name);
            joinChatRoom(chatRoom.id, contactInfo.name);
        };

        // 添加頭像
        const avatar = document.createElement("img");
        avatar.src = contactInfo.image ? contactInfo.image : "assets/image/default-avatar.png";
        avatar.alt = contactInfo.name;
        avatar.classList.add("chat-room-avatar");

        // 添加聊天室資訊區域
        const chatInfoWrapper = document.createElement("div");
        chatInfoWrapper.classList.add("chat-info-wrapper");

        // 添加名稱和訊息
        const chatName = document.createElement("div");
        chatName.textContent = contactInfo.name;
        chatName.classList.add("chat-room-name");

        const lastMessage = document.createElement("div");
        lastMessage.textContent = recentMessage;
        lastMessage.classList.add("chat-room-last-message");

        // 添加時間
        const timestamp = document.createElement("div");
        timestamp.textContent = recentTimestamp;
        timestamp.classList.add("chat-room-timestamp");

        chatInfoWrapper.appendChild(chatName);
        chatInfoWrapper.appendChild(lastMessage);

        listItem.appendChild(avatar);
        listItem.appendChild(chatInfoWrapper);
        listItem.appendChild(timestamp);
        chatRoomList.appendChild(listItem);
    }
}

// 加入聊天室並訂閱
function joinChatRoom(chatRoomId, chatRoomName) {
    // chat_room table id
    console.log("加入聊天室:", chatRoomId);
    document.getElementById('currentChatRoomName').textContent = chatRoomName; // 更新聊天室名稱
    subscribeToChatRoom(chatRoomId);
    connectWebSocketForContract(chatRoomId);
    loadChatHistory(chatRoomId); // 加載該聊天室的歷史訊息
}


// 加載聊天歷史記錄
function loadChatHistory(chatRoomId) {
    fetch(`/api/1.0/chatrooms/${chatRoomId}/messages`)
        .then(response => response.json())
        .then(data => {
            const messageArea = document.getElementById("messageArea");
            messageArea.innerHTML = ''; // 清空之前的訊息
            const clientInfo = data.client;
            const agentInfo = data.agent;

            data.messages.forEach(message => {
                displayMessage(message,clientInfo,agentInfo ,false); // 加載歷史訊息不滾動
            });

            // 在加載歷史訊息後，將視窗滾動到最新的訊息
            setTimeout(() => {
                messageArea.scrollTop = messageArea.scrollHeight;
            }, 100);
        })
        .catch(error => console.error('加載聊天歷史失敗:', error));
}

function getChatRoomInfo(currentUserId,otherUserId){
    fetch(`/api/1.0/chatroom/info?currentUserId=${currentUserId}&otherUserId=${otherUserId}`)
        .then(response => response.json())
        .then(chatRoom => {
            joinChatRoom(chatRoom.id, chatRoom.receiverInfo.name);
        })
        .catch(error => {
            console.error('進入聊天室失敗',error);
        })
}

function displayMessage(message, clientInfo, agentInfo, shouldScroll) {
    const messageArea = document.getElementById("messageArea");
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.textContent = message.content;

    // 時間戳
    const timestampElement = document.createElement("div");
    timestampElement.classList.add("timestamp");
    timestampElement.textContent = formatTimestamp(message.timestamp);

    const messageDisplay = document.createElement("div");
    messageDisplay.style.display="flex";

    const chatAvatar = document.createElement("img");
    chatAvatar.classList.add("chat-avatar");
    chatAvatar.style.width = "36px";
    chatAvatar.style.height = "36px";
    chatAvatar.style.borderRadius = "50%";

    const userId =localStorage.getItem("userId");
    // 根據訊息發送者設定頭像
    if (String(message.senderId) === String(clientInfo.id)) {
        chatAvatar.src = clientInfo.image && clientInfo.image !== '' ? clientInfo.image : 'https://seanproject.s3.ap-northeast-1.amazonaws.com/user.png';
    } else {
        chatAvatar.src = agentInfo.image && agentInfo.image !== '' ? agentInfo.image : 'https://seanproject.s3.ap-northeast-1.amazonaws.com/user.png';
    }

    // 根據訊息發送者決定訊息顯示方向
    if (String(message.senderId) === userId) {
        messageWrapper.classList.add("right");
        chatAvatar.style.margin ="0 0 0 8px";
        timestampElement.classList.add("time-right");
        messageElement.classList.add("background");
        messageDisplay.appendChild(messageElement);
        messageDisplay.appendChild(chatAvatar);
        messageWrapper.appendChild(messageDisplay);
    } else {
        chatAvatar.style.margin ="0 8px 0 0";
        messageDisplay.appendChild(chatAvatar);
        messageDisplay.appendChild(messageElement);
        messageWrapper.appendChild(messageDisplay);
    }

    messageWrapper.appendChild(timestampElement);
    // 加入訊息區域
    messageArea.appendChild(messageWrapper);

    // 滾動到最新
    if (shouldScroll) {
        messageWrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
        messageWrapper.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
}


function displayCurrentMessage(message,scroll){
    const messageArea = document.getElementById("messageArea");
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.textContent = message.content;

    // 時間戳
    const timestampElement = document.createElement("div");
    timestampElement.classList.add("timestamp");
    timestampElement.textContent = formatTimestamp(message.timestamp);

    const messageDisplay = document.createElement("div");
    messageDisplay.style.display="flex";

    const chatAvatar = document.createElement("img");
    chatAvatar.classList.add("chat-avatar");
    chatAvatar.style.width = "36px";
    chatAvatar.style.height = "36px";
    chatAvatar.style.borderRadius = "50%";
    const userId =localStorage.getItem("userId");

    // 根據訊息發送者決定訊息顯示方向
    if (String(message.senderId) === userId) {
        chatAvatar.src = `${message.imgSrc}`;
        messageWrapper.classList.add("right");
        chatAvatar.style.margin ="0 0 0 8px";
        timestampElement.classList.add("time-right");
        messageElement.classList.add("background");
        messageDisplay.appendChild(messageElement);
        messageDisplay.appendChild(chatAvatar);
        messageWrapper.appendChild(messageDisplay);
    } else {
        chatAvatar.src = `${message.imgSrc}`;
        chatAvatar.style.margin ="0 8px 0 0";
        messageDisplay.appendChild(chatAvatar);
        messageDisplay.appendChild(messageElement);
        messageWrapper.appendChild(messageDisplay);
    }

    messageWrapper.appendChild(timestampElement);
    // 加入訊息區域
    messageArea.appendChild(messageWrapper);

    // 滾動到最新
    if (scroll) {
        messageWrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
        messageWrapper.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
}

// 發送訊息
document.getElementById("sendMessageBtn").addEventListener("click", function() {
    const messageInput = document.getElementById("messageInput");
    const messageContent = messageInput.value.trim();
    const userId = getCurrentUserId();
    if (messageContent && stompClient && currentChatRoomId) {
        const message = {
            chatRoomId: currentChatRoomId,   // 當前聊天室 ID
            senderId: userId,                // 發送者 ID (從 localStorage 獲取)
            content: messageContent,         // 訊息內容
            timestamp: new Date().toISOString(), // 當前時間
            imgSrc: localStorage.getItem("userImage")
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));  // 透過 STOMP 發送訊息到後端
        messageInput.value = ''; // 清空輸入框
    } else {
        alert("請選擇聊天室並輸入訊息");
    }
});

// 新增聊天室按鈕
document.getElementById("createChatRoomBtn").addEventListener("click", function() {
    const user2Id = prompt("請輸入要聊天的用戶 ID:");
    const user1Id = getCurrentUserId();
    if (user2Id && user1Id) {
        fetch(`/api/1.0/chatroom?user1Id=${user1Id}&user2Id=${user2Id}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(chatRoom => {
                console.log("創建或獲取聊天室成功:", chatRoom);
                addChatRoomToList(chatRoom);
            })
            .catch(error => console.error('創建聊天室失敗:', error));
    } else {
        alert("請輸入有效的用戶 ID");
    }
});

// 新增聊天室按鈕
document.getElementById("createChatRoomBtn").addEventListener("click", function() {
    const user2Id = prompt("請輸入要聊天的用戶 ID:");
    const user1Id = getCurrentUserId();
    if (user2Id && user1Id) {
        fetch(`/api/1.0/chatroom?user1Id=${user1Id}&user2Id=${user2Id}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(chatRoom => {
                console.log("創建或獲取聊天室成功:", chatRoom);
                addChatRoomToList(chatRoom);
            })
            .catch(error => console.error('創建聊天室失敗:', error));
    } else {
        alert("請輸入有效的用戶 ID");
    }
});

// 從 localStorage 獲取當前登入的用戶 ID
function getCurrentUserId() {
    return localStorage.getItem('userId');
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '下午' : '上午';
    const formattedHours = hours % 12 || 12;
    return `${ampm} ${formattedHours}:${minutes}`;
}

connectWebSocket();