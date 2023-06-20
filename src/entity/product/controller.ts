import { Create, Id } from "@/core/interface";
import baseController from "@core/controller";
import productSchema from "./schema";
import productService from "./service";

class controller extends baseController {
  /**
   * constructor function for controller.
   *
   * @remarks
   * This method is part of the productController class extended of the main parent class baseController.
   *
   * @param service - productService
   *productCtrl
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
}

const productCtrl = new controller(new productService(productSchema));
export default productCtrl;
