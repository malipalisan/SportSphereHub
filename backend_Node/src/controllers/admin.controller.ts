import express from 'express'
import UserModel from '../models/User'
import FacilityModel from '../models/Facility'
import TrainerModel from '../models/Trainer'
import SportModel from '../models/Sport'
import { AdminService } from '../services/adminService'

export class AdminController {

    // Admin pregled svih korisnika za administratorsku tabelu.
    async getAllUsers(req: express.Request, res: express.Response){
        const result = await new AdminService().getAllUsers()

        res.json(result)
    }

    // Azuriranje korisnika iz admin panela preuzima samo polja koja admin sme da menja.
    async updateUser(req: express.Request, res: express.Response){
        const id = req.params.id as string

        const result = await new AdminService().updateUser(id, req.body)

        res.json(result)
    }

    // Brisanje korisnika po id-ju iz URL parametra.
    async deleteUser(req: express.Request, res: express.Response){
        const id = req.params.id as string

        const result = await new AdminService().deleteUser(id)
    }

    // Ucitavanje jednog korisnika za formu za izmenu.
    async getUserById(req: express.Request, res: express.Response){
        const id = req.params.id as string

        const result = await new AdminService().getUserById(id)

        res.json(result)
    }

    // Admin vidi samo korisnike koji jos cekaju odobrenje registracije.
    async getRegistrationRequests(req: express.Request, res: express.Response) {
        const result = await new AdminService().getRegistrationRequests()

        res.json(result)
    }

    // Odobrenje samo menja status naloga u approved.
    async approveRegistrationRequest(req: express.Request, res: express.Response) {
        const id = req.params.id as string

        const result = await new AdminService().approveRegistrationRequest(id)
        
        res.json(result)
    }

    // Odbijanje cuva korisnika u bazi, ali ga oznacava kao rejected.
    async rejectRegistrationRequest(req: express.Request, res: express.Response) {
        const id = req.params.id as string

        const result = await new AdminService().rejectRegistrationRequest(id)
        
        res.json(result)
    }

    // Objekti koje su zaposleni dodali prvo cekaju administratorsku proveru.
    async getFacilityRequests(req: express.Request, res: express.Response) {
        const result = await new AdminService().getFacilityRequests()

        res.json(result)
    }

    // Odobren objekat postaje vidljiv u pretrazi i sportistima.
    async approveFacility(req: express.Request, res: express.Response) {
        const id = req.params.id as string
        const result = await new AdminService().approveFacility(id)
        res.json(result)
    }

    // Odbijen objekat ostaje evidentiran, ali nije aktivan za korisnike.
    async rejectFacility(req: express.Request, res: express.Response) {
        const id = req.params.id as string
        const result = await new AdminService().rejectFacility(id)
        res.json(result)
    }

    // Pregled trenera za administraciju.
    async getAllTrainers(req: express.Request, res: express.Response) {
        const result = await new AdminService().getAllTrainers()
        res.json(result)
    }

    // Trener se ne brise fizicki, vec se deaktivira da istorija treninga ostane sacuvana.
    async deactivateTrainer(req: express.Request, res: express.Response) {
        const id = req.params.id as string
        const result = await new AdminService().deactivateTrainer(id)
        res.json(result)
    }

    // Dodavanje sporta proverava da naziv nije prazan i da vec ne postoji pod istim imenom.
    async addSport(req: express.Request, res: express.Response) {
        const name = req.body.name
        const result = await new AdminService().addSport(name)
        res.json(result)
    }   

}
