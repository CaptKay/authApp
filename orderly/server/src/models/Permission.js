import { model, Schema } from "mongoose"



const PermissionSchema = new Schema({
    name: {
        type: String, unique: true, required: true, trim: true
    },
    description: {type: String}
}, {
    timestamps: true
})

export default model('Permission',  PermissionSchema)