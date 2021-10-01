const mongoose = require("mongoose");
const dotenv = require('dotenv');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate')

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

		googleId: {
			type: String,
		}
	
	},
	{ timestamps: true },
);

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)
const User = mongoose.model("user", userSchema);

module.exports = User; 