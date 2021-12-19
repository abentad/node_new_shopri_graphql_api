const jwt = require('jsonwebtoken');
const jwtSecret = 'somesecret';


const Query = {
    async user(parent, { id }, { db }, info){
        const [user] = await db.users.findAll({ where: { id } });
        if(!user) throw new Error('User not found');
        return user;
    },
    async userByPhone(parent, { phoneNumber }, { db }, info){
        const [user] = await db.users.findAll({ where: { phoneNumber }});
        if(!user) throw new Error('User not found');
        const token = jwt.sign({ id: user.id }, jwtSecret);
        return { user, token };
    },
    async users(parent, args, { db }, info){
        const users = await db.users.findAll();
        return users;
    },
    async product(parent, { id }, { db }, info){
        const [product] = await db.products.findAll({ where: { id }});
        if(!product) throw new Error('Product not found');
        return product;
    },
    async products(parent, { page, limit}, { db }, info){
        if(page <= 0 || limit > 15) throw new Error('Invalid request');
        const { count, rows } = await db.products.findAndCountAll({ offset: (page - 1) * limit, limit: limit, order: [ ['id', 'DESC'] ], where: { isPending: "false" } });
        const pages = Math.ceil(count / limit);
        return { count, products: rows, pages};
    },
    async conversations(parent, { userId }, { db }, info){
        let convs = [];
        const conversationsBySender = await db.conversations.findAll({ where: { senderId: userId } });
        const conversationsByReceiver = await db.conversations.findAll({ where: { receiverId: userId } });
        convs.push(...conversationsBySender, ...conversationsByReceiver);
        return convs;
    },
    async messages(parent, { conversationId }, { db }, info){
        const messages = await db.messages.findAll({ where: { conversationId }});
        return messages;
    },
    async wishlists(parent, { userId }, { db }, info){
        const wishlists = await db.wishlist.findAll({ where: { userId }});
        return wishlists;
    }

}

module.exports = Query;