import { ctrlWrapper } from "../decorators/index.js";
import UserUnreg from "../models/User-unregister.js";

const saveUser = async (req, res) => {
    try {

        const count = await UserUnreg.countDocuments();


        const userNumber = (count + 1).toString().padStart(3, '0');
        const username = `User${userNumber}`;
        const newUser = new UserUnreg({ username, status: 'unregister' });
        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Помилка при збереженні користувача:", error);
        res.status(500).json({ error: "Помилка при збереженні користувача" });
    }
};


const getUsername = async (req, res) => {
    try {

        const lastUser = await UserUnreg.findOne().sort({ createdAt: -1 });
        if (lastUser) {
            res.status(200).json({ username: lastUser.username });
        } else {
            res.status(404).json({ error: "Користувачі відсутні" });
        }
    } catch (error) {
        console.error("Помилка при отриманні імені користувача:", error);
        res.status(500).json({ error: "Помилка при отриманні імені користувача" });
    }
};

const removeExpiredUsers = async () => {
    try {
        await UserUnreg.deleteMany({ createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
        console.log('Видалено застарілих користувачів');
    } catch (error) {
        console.error("Помилка при видаленні застарілих користувачів:", error);
    }
};

setInterval(removeExpiredUsers, 24 * 60 * 60 * 1000);


export default {
    signup: ctrlWrapper(saveUser),
    current: ctrlWrapper(getUsername),

};