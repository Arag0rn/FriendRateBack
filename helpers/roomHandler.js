import { v4 as uuidV4 } from 'uuid';

const rooms = {};
const MAX_USERS_PER_ROOM = 2;

export const roomHandler = (socket) => {
    const createRoom = () => {
        const roomId = uuidV4();
        rooms[roomId] = [];
        socket.emit("room-created", { roomId });
        console.log("user created the room");
    };

    const joinRoom = ({ roomId, peerId }) => {
        if (rooms[roomId]) {
            if (rooms[roomId].length >= MAX_USERS_PER_ROOM) {
                createRoom();
                return;
            }
            console.log("user joined the room", roomId, peerId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
            socket.to(roomId).emit("user-joined", { peerId });
            socket.emit("get-users", {
                roomId,
                participants: rooms[roomId],
            });

            socket.on("disconnect", () => {
                console.log("user left the room", peerId);
                leaveRoom({ roomId, peerId });
            });
        }
    };

    const leaveRoom = ({ peerId, roomId }) => {
        rooms[roomId] = rooms[roomId]?.filter((id) => id !== peerId);
        socket.to(roomId).emit("user-disconnected", peerId);
    };

    socket.on("create-room", createRoom);
    socket.on("join-room", joinRoom);
};