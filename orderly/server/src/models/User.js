import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    isActive: { type: Boolean, default: true },
    refreshTokens: [{ type: String }],

    emailVerified: { type: Boolean, default: false },

    //email verification
    emailVerifyTokenHash: { type: String },
    emailVerifyTokenExpiresAt: { type: Date },

    //Password Reset
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },

    //2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    backupCodesHash: { type: [String] },
  },
  {
    timestamps: true,
  }
);

export default model("User", UserSchema);
