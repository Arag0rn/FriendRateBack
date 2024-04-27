export async function deleteExpiredUsers() {
    try {
        const expiredUsers = await this.find({ sessionExpiration: { $lt: new Date() } });
        if (expiredUsers.length > 0) {
            await this.deleteMany({ _id: { $in: expiredUsers.map(user => user._id) } });
        }
    } catch (error) {
        console.error("Ошибка при удалении устаревших пользователей:", error);
        throw error;
    }
}