import express from 'express'
import { SportsController } from '../controllers/sports.controller'

const sportsRouter = express.Router()

sportsRouter.get(
    "/",
    (req, res) => new SportsController().getActiveSports(req, res)
)

export default sportsRouter