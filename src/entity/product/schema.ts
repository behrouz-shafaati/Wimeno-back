import { model, Schema } from "mongoose";
import { Product } from "./interface";

const productSchema = new Schema<Product>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    shopId: { type: Schema.Types.ObjectId, ref: "shop" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceSale: { type: Number, default: 0 },
    images: [{ type: Schema.Types.ObjectId, ref: "file" }],
    category: { type: Schema.Types.ObjectId, ref: "category" },
    inStock: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema
  .pre("findOne", function (next: any) {
    this.populate("images category");
    next();
  })
  .pre("find", function (next: any) {
    this.populate("images category");
    next();
  });

productSchema.set("toObject", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
  },
});

productSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
    delete ret.deleted;
  },
});
export default model<Product>("product", productSchema);
