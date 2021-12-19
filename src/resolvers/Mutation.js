const jwt = require('jsonwebtoken');
const getUserId = require('../utils/getUserId');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { uploadProfileImage, uploadProductImages, removeProfileImage } = require('../utils/fileUpload');



const jwtSecret = 'somesecret';



const Mutation = {
    async createUser(parent, { data, file }, { db }, info){
        const { newFileName, isUploaded } = await uploadProfileImage(file);
        if(!isUploaded) throw new Error('Invalid image format');
        // if(data.password.length < 8) throw new Error('Password length must be at least 8');
        // data.password = await hashPassword(data.password);
        const user = await db.users.create({ ...data, profile_image: newFileName });
        if(!user) throw new Error('Failed Signing up user');
        const token = jwt.sign({ id: user.id }, jwtSecret);
        return { user, token };    
    },
    async loginUser(parent, { data }, { db }, info){
        const [user] = await db.users.findAll({ where: { email: data.email } });
        if(!user) throw new Error('Email doesn\'t exist');
        const isMatch = await comparePassword(data.password, user.password);
        if(!isMatch) throw new Error('Incorrect password');
        const token = jwt.sign({ id: user.id }, jwtSecret);
        return { user, token };
    },
    async loginUserByToken(parent, args, { db, req }, info){
        const userId = getUserId(req);
        const [user] = await db.users.findAll({ where: { id: userId }});
        if(!user) throw new Error('User not found');
        return user;
    },
    async updateUser(parent, { data, file }, { db, req }, info){
        const userId = getUserId(req);
        let fileName = "";
        const [originalUser] = await db.users.findAll({ where: { id: userId }});
        if(file) {
            const { newFileName, isUploaded } = await uploadProfileImage(file);
            if(!isUploaded) throw new Error('Invalid image format');
            const profileRemoved = removeProfileImage(originalUser.profile_image);
            if(!profileRemoved) throw new Error('Failed updating user');
            fileName = newFileName;
        }
        if(data.password) data.password = await hashPassword(data.password);
        if(fileName !== "") {
            await db.users.update({ ...data, profile_image: fileName }, { where: { id: userId }});
        }else{
            await db.users.update(data, { where: { id: userId }});
        }
        const [user] = await db.users.findAll({ where: { id: userId }});
        return user;
    },
    async deleteUser(parent, args, { db, req }, info){
        const userId = getUserId(req);
        const [user] = await db.users.findAll({ where: { id: userId }});
        if(!user) throw new Error('User not found');
        const profileRemoved = removeProfileImage(user.profile_image);
        if(!profileRemoved) throw new Error('Failed removing user');
        await db.users.destroy({ where: { id: userId }});
        return user;
    },
    //For admin use only need to add authorization
    async deleteUserById(parent, args, { db, req }, info){
        const [user] = await db.users.findAll({ where: { id: args.id }});
        if(!user) throw new Error('User not found');
        const profileRemoved = removeProfileImage(user.profile_image);
        if(!profileRemoved) throw new Error('Failed removing user');
        await db.users.destroy({ where: { id: args.id }});
        return user;
    },
    async updateProductView(parent, { id }, { db, req }, info){
        // const userId = getUserId(req);
        const [originalProduct] = await db.products.findAll({ where: { id } });
        if(!originalProduct) throw new Error('Product not found');
        const newView = originalProduct.views + 1;
        await db.products.update({views: newView}, { where: { id }});
        const [updatedProduct] = await db.products.findAll({ where: { id } });
        return updatedProduct;
    },
    async deleteProduct(parent, args, { db, req}, info){
        const userId = getUserId(req);
        const [product] = await db.products.findAll({ where: { id: args.id }});
        if(!product) throw new Error('Product not found');
        if(product.posterId !== userId) throw new Error('User not authorized to delete post');
        await db.products.destroy({ where: { id: args.id }});
        return product;
    },
    async createProduct(parent, { data, files }, { db, req }, info){
        const userId = getUserId(req);
        const { uploadedFileNames , isUploaded } = await uploadProductImages(files);
        if(!isUploaded) throw new Error('Invalid image format');        
        const product = await db.products.create({ ...data, image: uploadedFileNames[0], posterId: userId});
        //* images.bulkCreate([{ /*  record one */ }, { /* record two */ }.. ])
        const listOfImageObjects =  uploadedFileNames.map((fileName)=> { return { id: Number(product.id), url: fileName } });
        await db.images.bulkCreate(listOfImageObjects);
        if(!product) throw new Error('Failed posting product');
        return product;
    },
    async updateProduct(parent, { data }, { db, req }, info){
        const userId = getUserId(req);
        const [originalProduct] = await db.products.findAll({ where: { id: data.id }});
        if(!originalProduct) throw new Error('Product not found');
        if(originalProduct.posterId !== userId) throw new Error('User not authorized to update product');
        let {id, ...newData} = data;
        await db.products.update(newData, { where: { id: data.id }});
        const [updatedProduct] = await db.products.findAll({ where: { id: data.id }});
        return updatedProduct;
    },
    async addWishList(parent, { data }, { db }, info){
        const wishlists = await db.wishlist.findAll({ where: { userId: data.userId } });
        for(let i = 0; i < wishlists.length; i++){
            if(wishlists[i].productId == data.productId) throw new Error('Wishlist already added');
        }
        const wishlist = await db.wishlist.create({ ...data });
        return wishlist;
    },  
    async deleteWishList(parent, { id }, { db, req}, info){
        const [wishlist] = await db.wishlist.findAll({ where: { id } });
        if(!wishlist) throw new Error('Wishlist not found');
        await db.wishlist.destroy({ where: { id }});
        return wishlist;
    },
    async addMessage(parent, { data }, { db }, info){
        const message = await db.messages.create({ ...data });
        const convUpdateData = {
            lastMessage: message.messageText,
            lastMessageTimeSent: message.timeSent,
            lastMessageSenderId: message.senderId
        };
        await db.conversations.update(convUpdateData, {where: { id: message.conversationId }});
        return message;
    },    
    async addConversation(parent, { data }, { db }, info){
        const conversation = await db.conversations.create({ ...data });
        return conversation;
    },
    async findProductsByName(parent, { name }, { db }, info){
        const products = await db.products.findAll({ where: { name } });
        if(!products) throw new Error('Nothing found');
        return products;
    }
};

module.exports = Mutation;
