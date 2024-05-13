import { v4 as uuidV4 } from 'uuid';

const rooms = {};

export const roomHandler = (socket) => {
    const createRoom = ({ peerId, value, selectedLanguage, selectedGender, userName, userLanguage, userGender, userAge }) => {

        const existingRoom = Object.values(rooms).find(room => (
            room.language === userLanguage && room.gender === userGender && userAge >= value[0] && userAge <= value[1]
        ));

        const availableRoom = Object.values(rooms).find(room => (
            room.users.length < 2
        ));

        if (existingRoom) {
            joinRoom({ roomId: existingRoom.roomId, peerId, selectedLanguage, selectedGender, userName, userLanguage, userGender, userAge });
            return;
        }
        if (availableRoom) {
            joinRoom({ roomId: availableRoom.roomId, peerId, selectedLanguage, selectedGender, userName });
            return
        }

        const roomId = uuidV4();
        rooms[roomId] = {
            roomId,
            users: [peerId],
            names: [userName],
            language: selectedLanguage,
            gender: selectedGender
        };
        socket.emit("room-created", { roomId });
        console.log("User created the room", roomId);
        joinRoom({ roomId, peerId, selectedLanguage, selectedGender, userName });
        console.log(rooms);
    };

    const joinRoom = ({ roomId, peerId, selectedLanguage, selectedGender, userName, userLanguage, userGender, userAge }) => {
        const room = rooms[roomId];
        if (room) {
            console.log(`${userName} joined the room`, roomId, peerId);
            if (room.users.includes(peerId)) {
                console.log("User is already in the room", roomId, peerId);
                return;
            }
            if (room.users.length >= 2) {
                console.log("Room is already full", roomId);
                return;
            }
            room.users.push(peerId);
            room.names.push(userName);
            socket.join(roomId);
            socket.emit("user-joined", { roomId, peerId });
            socket.emit("get-user", {
                roomId,
                users: room.users,
                names: room.names,
            });
        } else {
            createRoom({ peerId, selectedLanguage, selectedGender });
        }
        socket.on("end-call", () => {
            console.log(`${userName} left the room`, roomId, peerId);
            leaveRoom({ roomId, peerId });
        });
        socket.on("disconnect", () => {
            console.log(`${userName} left the room`, roomId, peerId);
            leaveRoom({ roomId, peerId });
        });
    };

    const leaveRoom = ({ roomId, peerId }) => {
        socket.to(roomId).emit("user-disconnected", peerId);
        const room = rooms[roomId];
        if (room) {
            room.users = room.users.filter((user) => user.peerId !== peerId);
            if (room.users.length === 0) {
                delete rooms[roomId];
            }
        }
    };

    socket.on('create-room', createRoom);
    socket.on("join-room", joinRoom);
};