import { model, Schema } from "mongoose"



const UserSchema = new Schema({
    email: {
        type: String, required: true, unique: true, lowercase: true, trim: true
    },
    passwordHash: {type: String, required: true},
    name: {type: String, trim: true},
    roles: [{type: Schema.Types.ObjectId, ref: 'Role'}],
    isActive: {type: Boolean, default: true},
    refreshTokens: [{type: String}]
}, {
    timestamps: true
})

export default model('User',  UserSchema)