import { Create, Id, Update } from "@/core/interface";
import baseController from "@core/controller";
import categorySchema from "./schema";
import categoryService from "./service";

class controller extends baseController {
  /**
   * constructor function for controller.
   *
   * @remarks
   * This method is part of the categoryController class extended of the main parent class baseController.
   *
   * @param service - categoryService
   *categoryCtrl
   * @beta
   */
  constructor(service: any) {
    super(service);
  }

  standardizationFilters(filters: any): any {
    if (typeof filters != "object") return {};
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value != "string") continue;

      // for string values
      if (key == "name") filters[key] = { $regex: new RegExp(value, "i") };

      // for mix fields
      if (key == "name") {
        filters.$expr = {
          $regexMatch: {
            input: {
              $concat: ["$name", "$description"],
            },
            regex: filters.name,
            options: "i",
          },
        };
        delete filters.name;
      }

      if (key == "orderBy" && value == "name") {
        filters.orderBy = "name";
      }
    }
    return filters;
  }

  async create(payload: Create) {
    payload.params.parentId == "null" ? "" : payload.params.parentId;
    return super.create(payload);
  }

  async findOneAndUpdate(payload: Update) {
    payload.params.parentId =
      payload.params.parentId == "null" ? null : payload.params.parentId;

    console.log("payload:", payload);
    return super.findOneAndUpdate(payload);
  }
}

const categoryCtrl = new controller(new categoryService(categorySchema));
export default categoryCtrl;
