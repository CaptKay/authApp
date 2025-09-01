import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Role from '../models/Role.js';

await mongoose.connect(process.env.MONGODB_URI);

const USERS = [
  { email: 'admin@example.com',    name: 'Admin User',    password: 'Admin123!',    role: 'admin' },
  { email: 'accounts@example.com', name: 'Accounts User', password: 'Accounts123!', role: 'accounts' },
  { email: 'sales@example.com',    name: 'Sales User',    password: 'Sales123!',    role: 'sales' },
  { email: 'user@example.com',     name: 'Normal User',   password: 'User123!',     role: 'user' },
];

for (const u of USERS) {
  const role = await Role.findOne({ name: u.role });
  if (!role) {
    console.warn(`⚠️ Role ${u.role} not found, skipping ${u.email}`);
    continue;
  }

  const passwordHash = await bcrypt.hash(u.password, 10);

  const user = await User.findOneAndUpdate(
    { email: u.email },
    {
      email: u.email,
      name: u.name,
      passwordHash,
      roles: [role._id],
      emailVerified: true,   // 👈 verified so login works immediately
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Seeded ${u.role}: ${u.email} / ${u.password}`);
}

await mongoose.disconnect();
