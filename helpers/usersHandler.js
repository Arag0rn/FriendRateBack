let  users = [];

export const usersHandler = (socket) => {
    socket.on("user-join-hub", (userId) => {
        if (!users.includes(userId)) {
            users.push(userId);
        }
            // console.log(`User with ID ${userId} connected to the hub.`);
        socket.emit("users-list", { users });

    });

    socket.on("user-leave-hub", (userId) => {
        console.log(`User with ID ${userId} left the hub.`);
        users = users.filter(user => user !== userId);
        socket.emit("users-list", { users });

    });

    socket.on("disconnect", () => {
        console.log("user left the hub");
    });
};