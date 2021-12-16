const Conversation = {
    async lastMessageSender(parent, args, { db }, info){
        const [user] = await db.users.findAll({where: { id: parent.lastMessageSenderId }});
        return user;
    },
    async sender(parent, args, { db }, info){
        const [user] = await db.users.findAll({where: { id: parent.senderId }});
        return user;
    },
    async receiver(parent, args, { db }, info){
        const [user] = await db.users.findAll({where: { id: parent.receiverId }});
        return user;
    }

};

module.exports = Conversation;