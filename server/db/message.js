var S = require('sequelize');
module.exports = function(sequelize){
	var Message = sequelize.define('message', {
		id: {
			type: S.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		chat_uuid: {
			type: S.STRING,
			allowNull: false
		},
		timestamp: {
			type: S.DATE,
			defaultValue: S.NOW
		},
		body: {
			type: S.STRING
		},
		image_url: {
			type: S.STRING
		},
		sender_username: {
			type: S.STRING
		}
	});
	return Message;
};