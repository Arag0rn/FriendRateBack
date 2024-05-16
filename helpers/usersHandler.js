let users = [];

export const usersHandler = (socket) => {

    socket.on("user-join-hub", (userId) => {
        if (!users.includes(userId)) {
            users.push(userId);
            socket.handshake.customData = userId;
            console.log(`User with ID ${userId} connected to the hub.`);
            socket.emit("users-list", { users });
        } else {
            socket.emit("users-list", { users });
            return
        }
    });

    socket.on("user-leave-hub", (userId) => {
        console.log(`User with ID ${userId} left the hub.`);
        users = users.filter(user => user !== userId);
        socket.emit("users-list", { users });
    }); 
    
    socket.on("disconnect", () => {
        const userId = getUserId(socket);
        console.log(`User with ID ${userId} left the hub.`);
        leaveHub(userId);
        socket.emit("users-list", { users });
    });

    const leaveHub = (userId) => {
        socket.emit("user-disconnected", userId);
        users = users.filter(user => user !== userId);
    };

    const getUserId = (socket) => {
        return socket.handshake.customData;
    };
};