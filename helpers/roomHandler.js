import { v4 as uuidV4 } from 'uuid';

const rooms = {};

// const generateRandomNumber = () => {
//     return Math.floor(1000 + Math.random() * 9000);
// };

export const roomHandler = (socket) => {
    const createRoom = ({
        peerId,
        value = [18, 99],
        selectedLanguage = 'en',
        selectedGender = 'any',
        userLanguage = 'en',
        userGender = 'any',
        userAge = 18,
        userData = { avatarURL: '', rate: 0, ratingCount: 0 }
    } = {}) => {

        console.log(userData);
        const existingRoom = Object.values(rooms).find(room => (
            room.language === userLanguage && room.gender === userGender &&  userAge >= value[0] && userAge <= value[1]
        ));

        if (existingRoom) {
            joinRoom({ roomId: existingRoom.roomId, peerId, selectedLanguage, selectedGender, userLanguage, userGender, userAge,  userData});
            return;
        }

        const availableRoom = Object.values(rooms).find(room => (
            room.users.length < 2
        ));

        if (availableRoom) {
            joinRoom({ roomId: availableRoom.roomId, peerId, selectedLanguage, selectedGender, userData});
            return;
        }

        const roomId = uuidV4();
        rooms[roomId] = {
            roomId,
            users: [],
            names: [],
            language: selectedLanguage,
            gender: selectedGender
        };
        socket.emit("room-created", { roomId });
        console.log("User created the room", roomId);
        joinRoom({ roomId, peerId, selectedLanguage, selectedGender, userData});
        console.log(rooms);
    };

    const joinRoom = ({ roomId, peerId, selectedLanguage, selectedGender, userLanguage, userGender, userAge, userData}) => {
        const room = rooms[roomId];
        if (room) {
            if (room.users.includes(peerId)) {
                console.log("User is already in the room", roomId, peerId);
                return;
            } else if (room.users.length >= 2) {
                console.log("Room is already full", roomId);
                return;
            } else {
                room.users.push(peerId);
                room.names.push({
                    userName: userData.userName || 'Unregistered User',
                    avatarURL: userData.avatarURL,
                    rate: userData.rate,
                    ratingCount: userData.ratingCount
                } );
                socket.join(roomId);
                console.log(`${userData.userName}  joined the room`, roomId, peerId);
                console.log(rooms);
                socket.to(roomId).emit("user-joined", { roomId, peerId, names: room.names,});
                console.log(room.names);
                socket.emit("get-user", {
                    roomId,
                    users: room.users,
                    names: room.names,
                });
            }
        } else {
            createRoom({ peerId, value, selectedLanguage, selectedGender, userLanguage, userGender, userAge,  userData});
        }
        socket.on("end-call", () => {
            console.log(`${userData.userName} left the room`, roomId, peerId);
            leaveRoom({ roomId, peerId });
        });
        socket.on("disconnect", () => {
            console.log(`${userData.userName} left the room`, roomId, peerId);
            leaveRoom({ roomId, peerId });
        });
    };

    const leaveRoom = ({ roomId, peerId }) => {
        socket.to(roomId).emit("user-disconnected", peerId);
        const room = rooms[roomId];
        if (room) {
            room.users = room.users.filter((user) => user.peerId !== peerId);
                delete rooms[roomId];

        }
    };

    socket.on('create-room', createRoom);
    socket.on("join-room", joinRoom);
}
