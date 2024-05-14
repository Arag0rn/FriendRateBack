let users = [];

export const usersHandler = (socket) => {
    const sendUsersList = () => {
        socket.emit("users-list", { users });
        console.log(users);

    };

    socket.on("user-join-hub", (userId) => {
        if (users.includes(userId)) {
         return
        }
        users.push(userId);
        socket.handshake.customData = userId;
        sendUsersList();
        console.log(`User with ID ${userId} connected to the hub.`);

    });

    socket.on("user-leave-hub", (userId) => {
        console.log(`User with ID ${userId} left the hub.`);
        users = users.filter(user => user !== userId);
        sendUsersList();
    });

    socket.on("disconnect", () => {
        const userId = getUserId(socket);
        console.log(`User with ID ${userId} left the hub.`);
        leaveHub(userId);
        sendUsersList();
    });

    const leaveHub = (userId) => {
        socket.emit("user-disconnected", userId);
        users = users.filter(user => user !== userId);
    };

    const getUserId = (socket) => {
        return socket.handshake.customData;
    };
};