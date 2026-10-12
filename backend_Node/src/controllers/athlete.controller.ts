import express from 'express'
import { AthleteService } from '../services/athleteService'

export class AthleteController{

    // Profil sportiste vraca licne podatke, rezervacije, treninge i porudzbine za prikaz na frontu.
    async getProfileData(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new AthleteService().getProfileData(id)
        res.json(result)
    }

    // Kod izmene profila avatar dolazi kroz multer u req.file, a ostala polja kroz req.body.
    async updateProfile(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new AthleteService().updateProfile(id, req.body, req.file)
        res.json(result)
    }

    // Sportista moze da otkaze samo svoju rezervaciju, pa se id korisnika salje u body-ju.
    async cancelReservation(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const athleteId = req.body.athleteId
        const result = await new AthleteService().cancelReservation(id, athleteId)
        res.json(result)
    }

    // Sportista moze da potvrdi samo svoju rezervaciju, pa se id korisnika salje u body-ju.
    async confirmReservation(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const athleteId = req.body.athleteId
        const result = await new AthleteService().confirmReservation(id, athleteId)
        res.json(result)
    }

    async getSearchData(req: express.Request, res: express.Response){
        const result = await new AthleteService().getSearchData()
        res.json(result)
    }

    async searchFacilities(req: express.Request, res: express.Response){
        const result = await new AthleteService().searchFacilities(req.body)
        res.json(result)
    }

    async getFacilityDetails(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const athleteId = req.query.athleteId as string
        const result = await new AthleteService().getFacilityDetails(id, athleteId)
        res.json(result)
    }

    // Sportista salje reakciju i komentar za objekat; servis proverava broj potvrdjenih rezervacija.
    async createFacilityReview(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new AthleteService().createFacilityReview(id, req.body)
        res.json(result)
    }

    // Kalendar trazi dogadjaje za jedan konkretan teren/halu u zadatom rasponu datuma.
    async getResourceEvents(req: express.Request, res: express.Response){
        const resourceId = req.params.resourceId as string
        const from = req.params.from as string
        const to = req.params.to as string
        const result = await new AthleteService().getResourceEvents(resourceId, from, to)
        res.json(result)
    }

    // Rezervacija moze doci iz forme ili klikom na kalendar; servis proverava radno vreme i zauzetost.
    async createReservation(req: express.Request, res: express.Response){
        const result = await new AthleteService().createReservation(req.body)
        res.json(result)
    }

    async getTeammateAds(req: express.Request, res: express.Response){
        const athleteId = req.params.athleteId as string
        const result = await new AthleteService().getTeammateAds(athleteId)
        res.json(result)
    }

    async createTeammateAd(req: express.Request, res: express.Response){
        const result = await new AthleteService().createTeammateAd(req.body)
        res.json(result)
    }

    async requestJoinAd(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const athleteId = req.body.athleteId
        const result = await new AthleteService().requestJoinAd(id, athleteId)
        res.json(result)
    }

    async updateJoinRequest(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new AthleteService().updateJoinRequest(
            id,
            req.body.athleteId,
            req.body.requestAthleteId,
            req.body.status
        )
        res.json(result)
    }

    async closeTeammateAd(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new AthleteService().closeTeammateAd(id, req.body.athleteId)
        res.json(result)
    }

    async getTrainingData(req: express.Request, res: express.Response){
        const facilityId = req.query.facilityId as string
        const sportId = req.query.sportId as string
        const result = await new AthleteService().getTrainingData(facilityId, sportId)
        res.json(result)
    }

    async bookTraining(req: express.Request, res: express.Response){
        const result = await new AthleteService().bookTraining(req.body)
        res.json(result)
    }

    async getShopData(req: express.Request, res: express.Response){
        const sportId = req.query.sportId as string
        const result = await new AthleteService().getShopData(sportId)
        res.json(result)
    }

    async createOrder(req: express.Request, res: express.Response){
        const result = await new AthleteService().createOrder(req.body)
        res.json(result)
    }

    async cancelOrder(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new AthleteService().cancelOrder(id, req.body.athleteId)
        res.json(result)
    }
}
