import { v4 as uuidV4 } from 'uuid';

const rooms = {};

export const roomHandler = (socket) => {
    const createRoom = ({ peerId, selectedLanguage, selectedGender }) => {

        const existingRoom = Object.values(rooms).find(room => (
            room.language === selectedLanguage && room.gender === selectedGender
        ));
        console.log(existingRoom);

        if (existingRoom) {
            joinRoom({ roomId: existingRoom.roomId, peerId, selectedLanguage, selectedGender });
            return;
        }

        const roomId = uuidV4();
        rooms[roomId] = {
            roomId,
            users: [peerId],
            language: selectedLanguage,
            gender: selectedGender
        };
        socket.emit("room-created", { roomId });
        console.log("User created the room", roomId);
        joinRoom({ roomId, peerId, selectedLanguage, selectedGender });
        console.log(rooms);
    };

    const joinRoom = ({ roomId, peerId, selectedLanguage, selectedGender }) => {
        const room = rooms[roomId];
        if (room) {
            console.log("User joined the room", roomId, peerId);
            if (room.users.includes(peerId)) {
                console.log("User is already in the room", roomId, peerId);
                return;
            }
            room.users.push(peerId);
            socket.join(roomId);
            socket.emit("user-joined", { roomId, peerId });
            socket.emit("get-user", {
                roomId,
                users: room.users,
            });
        } else {
            createRoom({ peerId, selectedLanguage, selectedGender });
        }
        socket.on("disconnect", () => {
            console.log("User left the room", roomId, peerId);
            leaveRoom({ roomId, peerId });
        });
    };

    const leaveRoom = ({ roomId, peerId }) => {
        socket.to(roomId).emit("user-disconnected", peerId);
        const room = rooms[roomId];
        if (room) {
            room.users = room.users.filter((user) => user.id !== peerId);
            if (room.users.length === 0) {
                delete rooms[roomId];
            }
        }
    };

    socket.on('create-room', createRoom);
    socket.on("join-room", joinRoom);
};