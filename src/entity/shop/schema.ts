import { model, Schema } from "mongoose";
import { Shop } from "./interface";

const shopSchema = new Schema<Shop>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    title: { type: String, required: true },
    shopStringId: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    about: { type: String, required: false },
    country: String,
    state: String,
    city: String,
    address: { type: String, required: false },
    logo: { type: Schema.Types.ObjectId, ref: "file" },
    cover: { type: Schema.Types.ObjectId, ref: "file" },
    facebookLink: { type: String },
    instagramLink: { type: String },
    twitterLink: { type: String },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

var autoPopulateLead = function (next: any) {
  this.populate("logo cover");
  next();
};

shopSchema.pre("findOne", autoPopulateLead).pre("find", autoPopulateLead);

shopSchema.set("toObject", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
  },
});

shopSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
    delete ret.deleted;
  },
});
export default model<Shop>("shop", shopSchema);
