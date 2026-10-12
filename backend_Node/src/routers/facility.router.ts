import express from 'express'
import { FacilityController } from '../controllers/facility.controller'

const facilityRouter = express.Router()

facilityRouter.get("/getHomePageStats",
    (req, res) => new FacilityController().getHomePageStats(req, res)
)

facilityRouter.get(
    "/searchFormData",
    (req, res) => new FacilityController().getSearchFormData(req, res)
)

facilityRouter.post(
    "/search",
    (req, res) => new FacilityController().searchFacilities(req, res)
)

facilityRouter.get(
    "/details/:id",
    (req, res) => new FacilityController().getFacilityDetails(req, res)
)

export default facilityRouter