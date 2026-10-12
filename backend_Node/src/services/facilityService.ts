import FacilityModel from "../models/Facility";
import PromotionsModel from "../models/Promotions";
import SportModel from "../models/Sport";
import ResourceModel from "../models/Resource";

export class FacilityService {
  async getHomePageStats() {
    try {
      let today = new Date();

      const activeFacilitiesCount = await FacilityModel.countDocuments({
        status: "approved",
      });
      const topFacilities = await FacilityModel.find({ status: "approved" })
        .sort({ likes: -1 })
        .limit(3);
      const promotions = await PromotionsModel.find({
        active: true,
        validFrom: { $lte: today },
        validTo: { $gte: today },
      })
        .populate("facilityId", "name city address")
        .sort({ validTo: 1 })
        .limit(3);

      return {
        status: 200,
        activeFacilitiesCount: activeFacilitiesCount,
        topFacilities: topFacilities,
        promotions: promotions,
      };
    } catch (err) {
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async getSearchFormData() {
    try {
      const cities = await FacilityModel.distinct("city", {
        status: "approved",
      });

      const sports = await SportModel.find({ active: true });

      const resourceTypes = await ResourceModel.distinct("type", {
        active: true,
      });

      return {
        status: 200,
        cities: cities,
        sports: sports,
        resourceTypes: resourceTypes,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async searchFacilities(
    name: string,
    cities: string[],
    sportId: string,
    resourceType: string,
  ) {
    try {
      let query: any = {
        status: "approved",
      };

      if (name && name.trim() !== "") {
        query.name = { $regex: name, $options: "i" };
      }

      if (cities && cities.length > 0) {
        query.city = { $in: cities };
      }

      if (sportId && sportId !== "") {
        query.sportIds = sportId;
      }

      if (resourceType && resourceType !== "") {
        const resources = await ResourceModel.find({
          active: true,
          type: resourceType,
        });
        const facilityIds = resources.map((r) => r.facilityId);
        query._id = { $in: facilityIds };
      }

      const facilities = await FacilityModel.find(query);

      return {
        status: 200,
        facilities: facilities,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async getFacilityDetails(id: string) {
    try {
      const facility = await FacilityModel.findById(id);

      if (!facility) {
        return {
          status: 404,
          message: "Objekat nije pronadjen",
        };
      }

      const resources = await ResourceModel.find({
        facilityId: id,
        active: true,
      });

      return {
        status: 200,
        facility: facility,
        resources: resources,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }
}
