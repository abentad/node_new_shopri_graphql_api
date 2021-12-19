const WishList = {
    async product(parent, args, { db }, info){
        const [product] = await db.products.findAll({ where: { id: parent.productId }});
        return product;
    },
    async user(parent, args, { db }, info){
        const [user] = await db.users.findAll({ where: { id: parent.userId }});
        return user;
    }
};

module.exports = WishList;