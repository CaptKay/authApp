import { model, Schema } from "mongoose"



const RoleSchema = new Schema({
    name: {
        type: String, unique: true, required: true, trim: true
    },
    description: {type: String},
    permissions: [{type: Schema.Types.ObjectId, ref: 'Permission'}]
}, {
    timestamps: true
})

export default model('Role',  RoleSchema) 