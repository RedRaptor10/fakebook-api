var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: { type: String, minLength: 1, maxLength: 100, required: true },
    username: { type: String, minLength: 1, maxLength: 20, required: true },
    password: { type: String, minLength: 5, required: true },
    firstName: { type: String, minLength: 1, maxLength: 100, required: true },
    lastName: { type: String, minLength: 1, maxLength: 100, required: true },
    pic: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    requests: {
        sent: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        received: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
    public: { type: Boolean, required: true },
    admin: { type: Boolean, default: false, required: true }
});

module.exports = mongoose.model('User', UserSchema);