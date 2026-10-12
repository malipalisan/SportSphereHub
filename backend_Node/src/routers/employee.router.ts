import express from 'express'
import { EmployeeController } from '../controllers/employee.controller'
import upload from '../uploads/uploads'
import equipmentUpload from '../uploads/uploadEquipment'

const employeeRouter = express.Router()

employeeRouter.put(
    "/profile/:id",
    upload.single("avatar"),
    (req, res) => new EmployeeController().updateEmployeeProfile(req, res)
)

employeeRouter.get(
    "/facilities/:organizationId",
    (req, res) => new EmployeeController().getEmployeeFacilities(req, res)
)

employeeRouter.post(
    "/facilities",
    (req, res) => new EmployeeController().createFacility(req, res)
)

employeeRouter.put(
    "/facilities/:id",
    (req, res) => new EmployeeController().updateFacility(req, res)
)

employeeRouter.get(
    "/schedule/:organizationId",
    (req, res) => new EmployeeController().getEmployeeSchedule(req, res)
)

employeeRouter.put(
    "/reservations/:id/attended",
    (req, res) => new EmployeeController().markReservationAttended(req, res)
)

employeeRouter.put(
    "/reservations/:id/no-show",
    (req, res) => new EmployeeController().markReservationNoShow(req, res)
)

employeeRouter.put(
    "/trainings/:id/attended",
    (req, res) => new EmployeeController().markTrainingAttended(req, res)
)

employeeRouter.put(
    "/trainings/:id/no-show",
    (req, res) => new EmployeeController().markTrainingNoShow(req, res)
)

employeeRouter.get(
    "/promotions/:facilityId",
    (req, res) => new EmployeeController().getPromotionsForFacility(req, res)
)

employeeRouter.post(
    "/promotions",
    (req, res) => new EmployeeController().createPromotion(req, res)
)

employeeRouter.put(
    "/promotions/:id",
    (req, res) => new EmployeeController().updatePromotion(req, res)
)

employeeRouter.get(
    "/equipment/:facilityId",
    (req, res) => new EmployeeController().getEquipmentForFacility(req, res)
)

employeeRouter.post(
    "/equipment",
    equipmentUpload.single("image"),
    (req, res) => new EmployeeController().createEquipment(req, res)
)

employeeRouter.put(
    "/equipment/:id",
    equipmentUpload.single("image"),
    (req, res) => new EmployeeController().updateEquipment(req, res)
)

employeeRouter.get(
    "/orders/:facilityId",
    (req, res) => new EmployeeController().getOrdersForFacility(req, res)
)

employeeRouter.put(
    "/orders/:id/status",
    (req, res) => new EmployeeController().updateOrderStatus(req, res)
)

employeeRouter.get(
  "/reports/occupancy/:facilityId/:year/:month",
  (req, res) => new EmployeeController().generateOccupancyReport(req, res)
)

employeeRouter.get(
  "/reports/equipment/:facilityId/:year/:month",
  (req, res) => new EmployeeController().generateEquipmentReport(req, res)
)

employeeRouter.get(
    "/calendar/:resourceId/:startDate/:endDate",
    (req, res) => new EmployeeController().getCalendarEvents(req, res)
)
export default employeeRouter