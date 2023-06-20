import { model, Schema } from "mongoose";
import { Category } from "./interface";

const categorySchema = new Schema<Category>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    avatar: { type: Schema.Types.ObjectId, ref: "file" },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

var autoPopulateLead = function (next: any) {
  this.populate("avatar parentId");
  next();
};

categorySchema.pre("findOne", autoPopulateLead).pre("find", autoPopulateLead);

categorySchema.set("toObject", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    delete ret._id;
    delete ret.__v;
  },
});

categorySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id.toHexString();
    ret.parent = ret.parentId;
    delete ret.parentId;
    delete ret._id;
    delete ret.__v;
    delete ret.deleted;
  },
});
export default model<Category>("category", categorySchema);
