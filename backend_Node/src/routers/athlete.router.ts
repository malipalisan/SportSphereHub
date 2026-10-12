import express from 'express'
import { AthleteController } from '../controllers/athlete.controller'
import upload from '../uploads/uploads'

const athleteRouter = express.Router()

athleteRouter.get(
    "/profile/:id",
    (req, res) => new AthleteController().getProfileData(req, res)
)

athleteRouter.put(
    "/profile/:id",
    upload.single("avatar"),
    (req, res) => new AthleteController().updateProfile(req, res)
)

athleteRouter.put(
    "/reservations/:id/cancel",
    (req, res) => new AthleteController().cancelReservation(req, res)
)

athleteRouter.put(
    "/reservations/:id/confirm",
    (req, res) => new AthleteController().confirmReservation(req, res)
)

athleteRouter.get(
    "/search-data",
    (req, res) => new AthleteController().getSearchData(req, res)
)

athleteRouter.post(
    "/search",
    (req, res) => new AthleteController().searchFacilities(req, res)
)

athleteRouter.get(
    "/facilities/:id",
    (req, res) => new AthleteController().getFacilityDetails(req, res)
)

athleteRouter.post(
    "/facilities/:id/reviews",
    (req, res) => new AthleteController().createFacilityReview(req, res)
)

athleteRouter.get(
    "/calendar/:resourceId/:from/:to",
    (req, res) => new AthleteController().getResourceEvents(req, res)
)

athleteRouter.post(
    "/reservations",
    (req, res) => new AthleteController().createReservation(req, res)
)

athleteRouter.get(
    "/teammates/:athleteId",
    (req, res) => new AthleteController().getTeammateAds(req, res)
)

athleteRouter.post(
    "/teammates",
    (req, res) => new AthleteController().createTeammateAd(req, res)
)

athleteRouter.put(
    "/teammates/:id/join",
    (req, res) => new AthleteController().requestJoinAd(req, res)
)

athleteRouter.put(
    "/teammates/:id/request",
    (req, res) => new AthleteController().updateJoinRequest(req, res)
)

athleteRouter.put(
    "/teammates/:id/close",
    (req, res) => new AthleteController().closeTeammateAd(req, res)
)

athleteRouter.get(
    "/training",
    (req, res) => new AthleteController().getTrainingData(req, res)
)

athleteRouter.post(
    "/training",
    (req, res) => new AthleteController().bookTraining(req, res)
)

athleteRouter.get(
    "/shop",
    (req, res) => new AthleteController().getShopData(req, res)
)

athleteRouter.post(
    "/orders",
    (req, res) => new AthleteController().createOrder(req, res)
)

athleteRouter.put(
    "/orders/:id/cancel",
    (req, res) => new AthleteController().cancelOrder(req, res)
)

export default athleteRouter
