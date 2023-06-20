import { Create, Id } from "@/core/interface";
import baseController from "@core/controller";
import tabelSchema from "./schema";
import tabelService from "./service";

class controller extends baseController {
  /**
   * constructor function for controller.
   *
   * @remarks
   * This method is part of the tabelController class extended of the main parent class baseController.
   *
   * @param service - tabelService
   *tabelCtrl
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

  async newTabelNumber(shopId: Id) {
    const count = await this.countAll({ shopId });
    return count + 1;
  }

  async newTabelCode() {
    const count = await this.countAll();
    return count + 1;
  }

  async create(payload: Create): Promise<any> {
    const shopId = payload.params.shopId;
    const _params = {
      shopId,
      number: await this.newTabelNumber(shopId),
      code: await this.newTabelCode(),
    };
    return super.create({ ...payload, params: _params });
  }
}

const tabelCtrl = new controller(new tabelService(tabelSchema));
export default tabelCtrl;
