import express from 'express'
import { AdminController } from '../controllers/admin.controller'

const adminRouter = express.Router()

adminRouter.get(
    "/users",
    (req, res) => new AdminController().getAllUsers(req, res)
)

adminRouter.put(
    "/users/:id",
    (req, res) => new AdminController().updateUser(req, res)
)

adminRouter.delete(
    "/users/:id",
    (req, res) => new AdminController().deleteUser(req, res)
)

adminRouter.get(
    "/users/:id",
    (req, res) => new AdminController().getUserById(req, res)
)

adminRouter.get(
    "/registration-requests",
    (req, res) => new AdminController().getRegistrationRequests(req, res)
)

adminRouter.put(
    "/registration-requests/:id/approve",
    (req, res) => new AdminController().approveRegistrationRequest(req, res)
)

adminRouter.put(
    "/registration-requests/:id/reject",
    (req, res) => new AdminController().rejectRegistrationRequest(req, res)
)

adminRouter.get(
    "/facility-requests",
    (req, res) => new AdminController().getFacilityRequests(req, res)
)

adminRouter.put(
    "/facility-requests/:id/approve",
    (req, res) => new AdminController().approveFacility(req, res)
)

adminRouter.put(
    "/facility-requests/:id/reject",
    (req, res) => new AdminController().rejectFacility(req, res)
)

adminRouter.get(
  "/trainers",
  (req, res) => new AdminController().getAllTrainers(req, res)
);
adminRouter.put(
  "/trainers/:id/deactivate",
  (req, res) => new AdminController().deactivateTrainer(req, res)
)

adminRouter.post(
  "/sports",
  (req, res) => new AdminController().addSport(req, res)
)


export default adminRouter