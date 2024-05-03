const MAX_USERS_PER_ROOM = 2;

export const roomHandler = (socket) => {
    const rooms = {};

    const joinOrCreateRoom = (peerId) => {
        let roomToJoin = null;

        for (const roomId in rooms) {
            if (rooms[roomId].length < MAX_USERS_PER_ROOM) {
                roomToJoin = roomId;
                break;
            }
        }

        if (roomToJoin) {
            rooms[roomToJoin].push(peerId);
            socket.join(roomToJoin);
            socket.emit("user-joined", { roomId: roomToJoin, peerId });
            socket.emit("get-user", { roomId: roomToJoin, users: rooms[roomToJoin] });
            console.log("User joined the room", roomToJoin, peerId);
        } else {
            // Создаем новую комнату и добавляем пользователя в нее
            const newRoomId = uuidV4();
            rooms[newRoomId] = [peerId];
            socket.join(newRoomId);
            socket.emit("room-created", { roomId: newRoomId });
            console.log("User created and joined new room", newRoomId, peerId);
        }
    };

    const leaveRoom = (roomId, peerId) => {
        if (rooms[roomId]) {
            socket.to(roomId).emit("user-disconnected", peerId);
            rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
        }
    };

    socket.on("create-room", (peerId) => {
        joinOrCreateRoom(peerId);
    });

    socket.on("join-room", (roomId, peerId) => {
        joinOrCreateRoom(peerId);
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            if (rooms[roomId].includes(socket.id)) {
                leaveRoom(roomId, socket.id);
                break;
            }
        }
    });
};