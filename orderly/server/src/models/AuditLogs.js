import { Schema, model } from "mongoose";


const AuditLogSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    event: {type: String, required: true},
    ip: {type: String},
    ua: {type: String},
    meta: {type: Schema.Types.Mixed}
},{
    timestamps: true
})

export default model('AuditLog', AuditLogSchema)