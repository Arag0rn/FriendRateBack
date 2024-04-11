

export const roomHandler = (socket) => {
    socket.on("join the room", () => {
        console.log("user join the room")
    });
};