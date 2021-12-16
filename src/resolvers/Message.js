const Message = {
    async sender(parent, args, { db }, info){
        const [user] = await db.users.findAll({where: { id: parent.senderId }});
        return user;
    },
    async receiver(parent, args, { db }, info){
        const [user] = await db.users.findAll({where: { id: parent.receiverId }});
        return user;
    }
};

module.exports = Message;