const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conversations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastMessage: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastMessageTimeSent: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    lastMessageSenderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'conversations',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
