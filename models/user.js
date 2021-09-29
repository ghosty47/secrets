const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
const dotenv = require('dotenv');

dotenv.config();

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		email: {
			type: String,
		},
		password: {
			type: String,
		},
	
	},
	{ timestamps: true },
);

//database encrption
const secret = process.env.MY_SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model("user", userSchema);

module.exports = User; 