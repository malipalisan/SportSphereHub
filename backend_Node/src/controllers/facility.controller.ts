import express from 'express'
import FacilityModel from '../models/Facility'
import PromotionsModel from '../models/Promotions'
import SportModel from '../models/Sport'
import ResourceModel from '../models/Resource'
import { FacilityService } from '../services/facilityService'

export class FacilityController{

    // Pocetna strana prikazuje broj aktivnih objekata, najpopularnije objekte i trenutno vazece promocije.
    async getHomePageStats(req: express.Request, res: express.Response){
        const result = await new FacilityService().getHomePageStats()
        res.json(result)
    }

    // Podaci za search formu: gradovi, sportovi i tipovi terena/hala.
    async getSearchFormData(req:express.Request, res: express.Response){
        const result = await new FacilityService().getSearchFormData()
        res.json(result)
    }

    // Pretraga postepeno gradi Mongo query samo od filtera koje je korisnik stvarno izabrao.
    async searchFacilities(req: express.Request, res: express.Response){
        const name = req.body.name
        const cities = req.body.cities
        const sportId = req.body.sportId
        const resourceType = req.body.resourceType

        const result = await new FacilityService().searchFacilities(name, cities, sportId, resourceType)

        res.json(result)
    }

    // Detalji objekta uvek vracaju i njegove aktivne resurse, jer front iz toga crta kartice/raspored.
    async getFacilityDetails(req:express.Request, res:express.Response){
        const id = req.params.id as string
        const result = await new FacilityService().getFacilityDetails(id)
        res.json(result)
    }
}
