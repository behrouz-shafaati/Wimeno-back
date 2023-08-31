import { model, Schema } from "mongoose";
import { Tabel } from "./interface";

const tabelSchema = new Schema<Tabel>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "shop" },
    number: { type: Number, required: true },
    code: { type: Number, required: false },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tabelSchema
  .pre("findOne", function (next: any) {
    this.populate("shopId");
    next();
  })
  .pre("find", function (next: any) {
    this.populate("shopId");
    next();
  });

tabelSchema.set("toObject", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
  },
});

tabelSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    ret.shop = ret.shopId;
    delete ret.shopId;
    delete ret._id;
    delete ret.__v;
    delete ret.deleted;
  },
});
export default model<Tabel>("tabel", tabelSchema);
