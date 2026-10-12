import express from 'express'
import SportModel from '../models/Sport'
export class SportsController{
    
    // Front koristi samo aktivne sportove u padajucim listama i filterima.
    getActiveSports = async(req: express.Request, res: express.Response) => {
        try {
            const sports = await SportModel.find({active: true});

            return res.json({
                status: 200,
                sports: sports
            })
        } catch(err){
            console.log(err)
            return res.status(500).json({
                message: "Greska na serveru"
            })
        }
    }
}
