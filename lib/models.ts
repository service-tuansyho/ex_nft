import mongoose, { Schema, Document } from "mongoose";

// User Schema
export interface IUser extends Document {
  address: string;
  username?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    address: { type: String, required: true, unique: true },
    username: { type: String },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

// NFT Schema
export interface INFT extends Document {
  tokenId: string;
  contractAddress: string;
  owner: string;
  name: string;
  description?: string;
  image: string;
  attributes?: object;
  price?: number;
  listed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NFTSchema: Schema = new Schema(
  {
    tokenId: { type: String, required: true },
    contractAddress: { type: String, required: true },
    owner: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    attributes: { type: Object },
    price: { type: Number },
    listed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Transaction Schema
export interface ITransaction extends Document {
  txHash: string;
  from: string;
  to: string;
  nftId: mongoose.Types.ObjectId;
  price: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    txHash: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    nftId: { type: mongoose.Types.ObjectId, ref: "NFT", required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Export models
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const NFT =
  mongoose.models.NFT || mongoose.model<INFT>("NFT", NFTSchema);
export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
