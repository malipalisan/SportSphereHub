import express from 'express'
import { AuthService } from '../services/authService'

export class AuthController {

    // Registracija cita polja forme iz body-ja, a avatar stize kroz multer u req.file.
    register = async(req: express.Request, res: express.Response)=>{
        try{
            const result = await new AuthService().register(req.body, req.file);

            res.json(result)
        } catch(err){
            console.log(err)
            return res.json({
                status: 500,
                message: "Greska na serveru"
            })
        }
    }

    // Login prosledjuje servisnom sloju samo kredencijale; servis radi proveru lozinke i statusa naloga.
    login = async(req: express.Request, res: express.Response) => {
        try{
            const username = req.body.username
            const password = req.body.password

            const result = await new AuthService().login(username, password)

            res.json(result)
        } catch(err){
            console.log(err)
            res.json({
                status: 500,
                message: "Greska na serveru"
            })
        }
    }

    // Admin login koristi isti login tok, pa dodatno proverava da li prijavljeni korisnik ima admin rolu.
    adminLogin = async(req: express.Request, res: express.Response) => {
        try{
            const username = req.body.username
            const password = req.body.password

            const result = await new AuthService().adminLogin(username, password)

            res.json(result)
        } catch(err){
            console.log(err)
            res.json({
                status:500,
                message: "Greska na serveru"
            })
        }
    }

    // Korisnik salje username ili email, a servis generise privremeni reset link.
    requestPasswordReset = async(req: express.Request, res: express.Response) => {
        try{
            const identifier = req.body.identifier
            const clientUrl = req.body.clientUrl

            const result = await new AuthService().requestPasswordReset(identifier, clientUrl)

            res.json(result)
        } catch(err){
            console.log(err)
            res.json({
                status: 500,
                message: "Greska na serveru"
            })
        }
    }

    // Token dolazi sa frontend linka, a nova lozinka iz forme za reset.
    resetPassword = async(req: express.Request, res: express.Response) => {
        try{
            const token = req.body.token
            const password = req.body.password
            const confirmPassword = req.body.confirmPassword

            const result = await new AuthService().resetPassword(token, password, confirmPassword)

            res.json(result)
        } catch(err){
            console.log(err)
            res.json({
                status: 500,
                message: "Greska na serveru"
            })
        }
    }
}
