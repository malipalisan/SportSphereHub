import { AuthValidators } from "../validators/authValidators";
import UserModel from "../models/User"
import OrganizationModel from "../models/Organization"
import PasswordResetTokenModel from "../models/PasswordResetToken"
import { OrganizationValidators } from "../validators/organizationValidators";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export class AuthService{

    // Registracija pokriva dve uloge: sportistu i zaposlenog.
    // Zaposleni dodatno mora imati podatke organizacije.
    async register(data: any, file: any){
        const {
            role,
            username,
            email, 
            password,
            firstName,
            lastName,
            phone,
            favoriteSportIds,
            organizationName,
            headquartersAddress,
            registrationNumber,
            taxId
        } = data;

        if(!role || !username || !email || !password || !firstName || !lastName || !phone){
            return {status: 400, message: "Sva osnovna polja su obavezna"}
        }

        if(role != "athlete" && role != "employee"){
            return {status: 400, message: "Neispravna uloga korisnika"}
        }

        if(!AuthValidators.validatePassword(password)){
            return {status: 400, message: "Neispravna lozinka."}
        }

        if(!AuthValidators.validateEmail(email)){
            return {status: 400, message: "Neispravan email."}
        }

        if(role === "athlete"){
            if(organizationName || headquartersAddress || registrationNumber || taxId){
                return {status:400, message: "Sportista ne sme imati podatke o organizaciji."}
            }
        }

        if(role === "employee"){
            if(!organizationName || !headquartersAddress || !registrationNumber || !taxId){
                return {status:400, message: "Zaposleni mora uneti podatke o organizaciji."}
            }

            if(!OrganizationValidators.validateRegistrationNumber(registrationNumber)){
                return {status: 400, message: "Maticni broj firme mora imati 8 cifara."}
            }

            if(!OrganizationValidators.validateTaxId(taxId)){
                return {status: 400, message: "PIB mora imati 9 cifara i ne sme pocinjati nulom."}
            }
        }

        const existingUsername = await UserModel.findOne({username: username})
        if(existingUsername){
            return {status:400, message: "Username vec postoji."}
        }

        const existingEmail = await UserModel.findOne({email: email})
        if(existingEmail){
            return {status:400, message: "Email vec postoji"}
        }

        let organizationId = null

        if(role === "employee"){
            // Za zaposlenog prvo pronalazimo ili kreiramo organizaciju,
            // pa proveravamo ogranicenje broja zaposlenih.
            let organization = await OrganizationModel.findOne({registrationNumber: registrationNumber})

            if(organization && organization.taxId != taxId){
                return {
                    status: 400,
                    message: "Organizacija sa tim maticnim brojem vec postoji sa drugim PIB-om."
                }
            }

            if(!organization){
                organization = new OrganizationModel({
                    name: organizationName,
                    headquartersAddress: headquartersAddress,
                    registrationNumber: registrationNumber,
                    taxId: taxId,
                    employeeIds: []
                });
                
                await organization.save()
            }

            const employeeCount = await UserModel.countDocuments({
            role: "employee",
            organizationId: organization._id,
            status: {$in: ["pending", "approved"]}
            });

            if(employeeCount >= 2){
                return {
                    status: 400,
                    message: "Jedan objekat moze imati najvise dva zaposlena"
                }
            }

            organizationId = organization._id
        }

        

        const passwordHash = await bcrypt.hash(password, 12)

        // favoriteSportIds moze doci kao jedan string ili kao niz,
        // zavisno od forme i broja izabranih checkboxova.
        let favoriteSports = []
        
        if(favoriteSportIds){
            favoriteSports = Array.isArray(favoriteSportIds) ? favoriteSportIds : [favoriteSportIds]
        }

        if(!AuthValidators.validateFavoriteSports(favoriteSports)){
            return {status: 400, message: "Maksimalno 5 omiljenih sportova ."}
        }

        let avatarUrl = "/uploads/default-avatar.png"

        if(file){
            // Multer je vec snimio fajl na disk; u bazi cuvamo samo javnu putanju do avatara.
            avatarUrl = "/uploads/" + file.filename
        }

        const user = new UserModel({
            role: role,
            status: "pending",
            username: username,
            email: email,
            passwordHash: passwordHash,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            avatarUrl: avatarUrl,
            favoriteSportIds: favoriteSports,
            organizationId: organizationId,
            penalties: []
        });

        await user.save()
        if(role === "employee" && organizationId){
            await OrganizationModel.updateOne(
                {_id: organizationId},
                {$push: {employeeIds: user._id}}
            );
        }

        return {
            status: 200,
            message: "Registracija uspesna. Nalog ceka odobrenje administratora."
        }

    }

    // Login ne vraca detalj zasto je pao username/password, da se ne otkriva koji nalog postoji.
    async login(username: string, password: string){
        const user = await UserModel.findOne({username: username}).lean()

        if(!user){
            return {
                status: 400,
                message: "Pogresno uneto korisnicko ime ili lozinka"
            }
        }

        const passwordOK = await bcrypt.compare(password, user.passwordHash)

        if(!passwordOK){
            return {
                status: 400,
                message: "Pogresno uneto korisnicko ime ili lozinka"
            }
        }

        if(user.status !== "approved"){
            return {
                status: 403,
                message: "Nalog nije odobren"
            }
        }

        return {
            status: 200,
            message: "Uspesno prijavljivanje",
            user: user
        }

    }

    // Admin login koristi obican login, ali posle toga zahteva rolu admin.
    async adminLogin(username: string, password: string){
        const result = await this.login(username, password)

        if(result.status !== 200 || !result.user){
            return result
        }

        if(result.user.role !== "admin"){
            return {
                status: 403,
                message: "Nemate administratorska prava"
            }
        }

        return {
            status: 200,
            message: "Uspesno prijavljivanje administratora",
            user: result.user
        }
    }

    // Generise reset token koji vazi 30 minuta. U bazu se cuva samo hash tokena, ne sirovi token iz linka.
    async requestPasswordReset(identifier: string, clientUrl: string){
        if(!identifier || identifier.trim() === ""){
            return {status: 400, message: "Unesite korisnicko ime ili email adresu"}
        }

        const user = await UserModel.findOne({
            $or: [
                {username: identifier.trim()},
                {email: identifier.trim()}
            ]
        })

        if(!user){
            return {status: 404, message: "Korisnik nije pronadjen"}
        }

        const now = new Date()
        const token = crypto.randomBytes(32).toString("hex")
        const tokenHash = this.hashResetToken(token)
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000)
        const baseClientUrl = clientUrl && clientUrl.trim() !== "" ? clientUrl.trim() : "http://localhost:4200"

        // Stariji neiskorisceni linkovi za istog korisnika se ponistavaju cim se napravi novi link.
        await PasswordResetTokenModel.updateMany(
            {userId: user._id, usedAt: null},
            {usedAt: now}
        )

        await new PasswordResetTokenModel({
            userId: user._id,
            tokenHash: tokenHash,
            expiresAt: expiresAt,
            usedAt: null
        }).save()

        const resetLink = `${baseClientUrl}/reset-password/${token}`

        return {
            status: 200,
            message: "Privremeni link za promenu lozinke je generisan",
            resetLink: resetLink,
            expiresAt: expiresAt
        }
    }

    // Reset lozinke proverava token, rok trajanja i potvrdu lozinke pre upisa novog passwordHash-a.
    async resetPassword(token: string, password: string, confirmPassword: string){
        if(!token || token.trim() === ""){
            return {status: 400, message: "Neispravan link za promenu lozinke"}
        }

        if(!password || !confirmPassword){
            return {status: 400, message: "Unesite novu lozinku i potvrdu lozinke"}
        }

        if(password !== confirmPassword){
            return {status: 400, message: "Lozinke se ne poklapaju"}
        }

        if(!AuthValidators.validatePassword(password)){
            return {status: 400, message: "Neispravna lozinka."}
        }

        const tokenHash = this.hashResetToken(token.trim())
        const resetToken = await PasswordResetTokenModel.findOne({
            tokenHash: tokenHash,
            usedAt: null
        })

        if(!resetToken){
            return {status: 400, message: "Link za promenu lozinke nije vazeci"}
        }

        if(resetToken.expiresAt.getTime() < Date.now()){
            return {status: 400, message: "Link za promenu lozinke je istekao"}
        }

        const passwordHash = await bcrypt.hash(password, 12)

        await UserModel.updateOne(
            {_id: resetToken.userId},
            {passwordHash: passwordHash}
        )

        resetToken.usedAt = new Date()
        await resetToken.save()

        return {status: 200, message: "Lozinka je uspesno promenjena"}
    }

    // Hash tokena omogucava da u bazi ne cuvamo link koji direktno menja lozinku.
    private hashResetToken(token: string){
        return crypto.createHash("sha256").update(token).digest("hex")
    }
}
