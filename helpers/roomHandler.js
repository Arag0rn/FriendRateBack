import {v4 as uuidV4} from 'uuid';

const rooms = {}

export const roomHandler = (socket) => {
    const joinRoom = ({roomId, peerId}) => {
        console.log("user join the room", roomId);
        socket.join(roomId);
    }
    const createRoom = () => {
        const roomId = uuidV4();
        rooms[roomId] = [];
        socket.emit('room-created', {roomId});
        console.log("user create the room")
    }
    socket.on("join-room",  joinRoom);
    socket.on('create-room', createRoom);
};