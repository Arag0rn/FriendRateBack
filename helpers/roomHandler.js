import { v4 as uuidV4 } from 'uuid';

const rooms = {};
const MAX_USERS_PER_ROOM = 2;

export const roomHandler = (socket) => {

    const createRoom = ({peerId}) => {
        const roomId = uuidV4()
        rooms[roomId] = [];
        socket.emit("room-created", {roomId});
        console.log("user create the room", roomId);
        joinRoom({ roomId, peerId });
        console.log(rooms);
    }
    const joinRoom = ({roomId, peerId}) => {
        if (rooms[roomId]){
            console.log("user join the room", roomId, peerId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
            socket.emit("user-joined", { roomId, peerId });
            socket.emit("get-user", {
                roomId,
                users: rooms[roomId],
            });
    } else {
        createRoom({ peerId });
    }
    socket.on("disconnect", () => {
        console.log("user left the room", roomId, peerId);
        leaveRoom({ roomId, peerId });
    });
    }

    const leaveRoom = ({ roomId, peerId }) => {
        socket.to(roomId).emit("user-disconnected", peerId);
        rooms[roomId] = rooms[roomId]?.filter((id) => id !== peerId);
    };

    socket.on('create-room', createRoom);
    socket.on("join-room",  joinRoom);

}