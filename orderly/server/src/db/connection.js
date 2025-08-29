import mongoose from 'mongoose'

export default async function connectDB(){
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log("connected to db: ", conn.connections[0].name);
    } catch (error) {
        console.error('Database connection failed', error)
    }
}