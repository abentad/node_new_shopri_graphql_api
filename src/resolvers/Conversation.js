const Conversation = {
    async lastMessageSender(parent, args, { db }, info){
        const [user] = await db.users.findAll({where: { id: parent.lastMessageSenderId }});
        return user;
    }
};

module.exports = Conversation;