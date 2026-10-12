import UserModel from "../models/User";
import FacilityModel from "../models/Facility";
import TrainerModel from "../models/Trainer";
import SportModel from "../models/Sport";

export class AdminService {
  async getAllUsers() {
    try {
      const users = await UserModel.find({});

      return {
        status: 200,
        users: users,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async updateUser(id: string, data: any) {
    try {
      const updatedUser = {
        role: data.role,
        status: data.status,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        favoriteSportIds: data.favoriteSportIds,
        organizationId: data.organizationId,
        penalties: data.penalties,
      };

      await UserModel.updateOne({ _id: id }, updatedUser);

      return {
        status: 200,
        message: "Korisnik je izmenjen",
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async deleteUser(id: string) {
    try {
      await UserModel.deleteOne({ _id: id });

      return {
        status: 200,
        message: "Korisnik je obrisan",
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async getUserById(id: string) {
    try {
      let user = await UserModel.findOne({ _id: id });

      if (!user) {
        return {
          status: 404,
          message: "Korisnik nije pronadjen",
        };
      }

      return {
        status: 200,
        user: user,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greska na serveru",
      };
    }
  }

  async getRegistrationRequests() {
    try {
      const users = await UserModel.find({
        status: "pending",
        role: { $in: ["athlete", "employee"] },
      });

      return {
        status: 200,
        users: users,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async approveRegistrationRequest(id: string) {
    try {
      await UserModel.updateOne({ _id: id }, { status: "approved" });

      return {
        status: 200,
        message: "Zahtev za registraciju je odobren",
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async rejectRegistrationRequest(id: string) {
    try {
      await UserModel.updateOne({ _id: id }, { status: "rejected" });

      return {
        status: 200,
        message: "Zahtev za registraciju je odbijen",
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async getFacilityRequests() {
    try {
      const facilities = await FacilityModel.find({
        status: "pending",
      });

      return {
        status: 200,
        facilities: facilities,
      };
    } catch (err) {
      console.log(err);

      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async approveFacility(id: string) {
    try {
      await FacilityModel.updateOne(
        { _id: id },
        {
          status: "approved",
        },
      );

      return {
        status: 200,
        message: "Objekat je odobren",
      };
    } catch (err) {
      console.log(err);

      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async rejectFacility(id: string) {
    try {
      await FacilityModel.updateOne(
        { _id: id },
        {
          status: "rejected",
        },
      );

      return {
        status: 200,
        message: "Objekat je odbijen",
      };
    } catch (err) {
      console.log(err);

      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async getAllTrainers() {
    try {
      const trainers = await TrainerModel.find({});

      return {
        status: 200,
        trainers: trainers,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async deactivateTrainer(id: string) {
    try {
      await TrainerModel.updateOne({ _id: id }, { active: false });

      return {
        status: 200,
        message: "Trener je deaktiviran",
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }

  async addSport(name: string) {
    try {
      if (!name || name.trim() === "") {
        return {
          status: 400,
          message: "Naziv sporta je obavezan",
        };
      }

      const existingSport = await SportModel.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
      });

      if (existingSport) {
        return {
          status: 400,
          message: "Sport već postoji",
        };
      }

      const sport = new SportModel({
        name: name.trim(),
        active: true,
      });

      await sport.save();

      return {
        status: 200,
        message: "Sport je dodat",
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: "Greška na serveru",
      };
    }
  }
}
