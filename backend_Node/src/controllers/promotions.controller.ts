import express from 'express'
import PromotionsModel from '../models/Promotions'

export class PromotionsController{

    // Pomocna ruta za dohvatanje promocije po id-ju.
    async getNameById(req:express.Request, res: express.Response){
        try{
            let id = req.body._id

            const promoName = await PromotionsModel.findOne({_id: id})

            res.json({
                status: 200,
                promoName: promoName
            })
        } catch(err){
            console.log(err)
            res.json({
                status: 500,
                message: "Greska na serveru"
            })
        }
    }
}
