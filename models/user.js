var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, minLength: 1, maxLength: 20, required: true },
    password: { type: String, minLength: 5, required: true },
    firstName: { type: String, minLength: 1, maxLength: 100, required: true },
    lastName: { type: String, minLength: 1, maxLength: 100, required: true },
    contact: [{
        info: { type: String, minLength: 1, maxLength: 100 },
        type: { type: String },
        primary: { type: Boolean }
    }],
    pic: { type: String },
    bio: { type: String, maxLength: 100 },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    public: { type: Boolean, required: true },
    admin: { type: Boolean, default: false }
});

UserSchema
.virtual('url')
.get(function() {
    return '/user/' + this._id;
});

UserSchema
.virtual('name')
.get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName + ' ' + this.lastName;
    } else {
        return '';
    }
});

module.exports = mongoose.model('User', UserSchema);