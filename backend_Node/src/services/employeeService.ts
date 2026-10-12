import { AuthValidators } from '../validators/authValidators'
import UserModel from '../models/User'
import ResourceModel from '../models/Resource'
import FacilityModel from '../models/Facility'
import SportModel from '../models/Sport'
import TrainingSessionModel from '../models/TrainingSession'
import ReservationModel from '../models/Reservation'
import PromotionModel from '../models/Promotions'
import EquipmentModel from '../models/Equipment'
import OrderModel from '../models/Order'
import PDFDocument from 'pdfkit'
import { resolve } from 'node:dns'
import { rejects } from 'node:assert'

export class EmployeeService{
    // Izmena profila zaposlenog, ukljucujuci opcioni upload nove profilne slike.
    async updateUserProfile(id: string, data: any, file: any){
        try{
            const {
                firstName,
                lastName,
                email,
                phone
            } = data

            if(!AuthValidators.validateEmail(email)){
                return {status: 400, message: "Neispravan email."}
            }   
            
            let avatarUrl = "/uploads/default-avatar.png"

            if(file){
                // Multer je snimio fajl u uploads folder; u korisniku cuvamo putanju koju frontend moze da prikaze.
                avatarUrl = "/uploads/" + file.filename
            }

            data.avatarUrl = avatarUrl

            await UserModel.updateOne({_id: id}, data)

            const user = await UserModel.findOne({_id: id}).select("-passwordHash").lean()
            
            return {
                status:200,
                message: "Profil je azuriran",
                user: this.normalizeUser(user)
            }
        } catch(err){
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Zaposleni vidi objekte svoje organizacije zajedno sa resursima i sportovima za svaki objekat.
    async getEmployeeFacilities(organizationId: string){
        try{
            const facilities = await FacilityModel.find({organizationId: organizationId})

            const result = []

            for(const facility of facilities){
                const resources = await ResourceModel.find({facilityId: facility._id})
                const sports = await SportModel.find({_id: {$in: facility.sportIds}})
                result.push({
                    facility: facility,
                    resources: resources,
                    sports: sports
                })
            }

            return {
                status: 200,
                facilities: result
            }
        } catch(err){
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Kreiranje objekta validira osnovne podatke i resurse, pa objekat salje adminu na odobrenje.
    async createFacility(data: any){
        try{
            const {
                organizationId,
                name,
                city,
                address,
                location,
                description,
                images,
                sportIds,
                workingHours,
                defaultHourlyPrice,
                allowedNoShows,
                resources
            } = data

            if(!organizationId || !name || !city || !address){
                return {
                    status: 400,
                    message: "Nisu uneti svi podaci o objektu"
                }
            }

            if(!defaultHourlyPrice || defaultHourlyPrice < 0){
                return {
                    status: 400,
                    message: "Cena rezervacije po satu mora biti veca od 0"
                }
            }

            if(!allowedNoShows || allowedNoShows < 1){
                return {
                    status: 400,
                    message: "Broj dozvoljenih kaznenih nepojavljivanja mora biti najmanje 1"
                }
            }

            if(!workingHours || !workingHours.from || !workingHours.to){
                return {
                    status: 400,
                    message: "Radno vreme mora biti uneto"
                }
            }

            if(!Array.isArray(sportIds) || sportIds.length === 0){
                return {
                    status: 400,
                    message: "Objekat mora imati bar jednu vrstu sporta"
                }
            }

            const validation = await this.validateResources(resources)

            if(validation.status !== 200){
                return validation
            }

            const facility = new FacilityModel({
                organizationId,
                name,
                city,
                address,
                location: {
                    lat: 0,
                    lng: 0
                },
                description,
                images: images || [],
                sportIds,
                status: "pending",
                workingHours,
                defaultHourlyPrice,
                allowedNoShows,
                likesCount: 0,
                dislikesCount: 0
            })

            const savedFacility = await facility.save()

            for(const resource of resources){
                const newResource = new ResourceModel({
                    facilityId: savedFacility._id,
                    name: resource.name,
                    type: resource.type,
                    capacity: resource.capacity,
                    sportIds: resource.sportIds,
                    equipmentDescription: resource.equipmentDescription,
                    active: true
                })

                await newResource.save()
            }

            return {
                status: 200,
                message: "Objekat je dodat i ceka odobrenje administratora"
            }
        } catch(err){
            console.log(err)
            return {
                status:500,
                message: "Greska na serveru"
            }
        }
    }


    // Svaki objekat mora imati bar jedan resurs, a nazivi resursa u istom objektu moraju biti jedinstveni.
    async validateResources(resources: any[]){
        if(!Array.isArray(resources) || resources.length === 0){
            return {
                status: 400,
                message: "Objekat mora imati bar jedan teren, halu ili dvoranu"
            }
        }

        const names = new Set<string>()

        for(const resource of resources){
            if(!resource.name || resource.name.trim() === ""){
                return {
                    status: 400,
                    message: "Svaki teren/hala/dvorana mora imati naziv"
                }
            }

            const normalizedName = resource.name.trim().toLowerCase()

            if(names.has(normalizedName)){
                return {
                    status:400,
                    message: "Svaki teren/hala/dvorana mora imati jedinstveno ime"
                }
            }

            names.add(normalizedName)

            if(!["outdoor", "indoor", "arena"].includes(resource.type)){
                return {
                    status: 400,
                    message: "Neispravan tip elementa objekta"
                }
            }

            if(!resource.capacity || resource.capacity === 0){
                return {
                    status: 400,
                    message: "Kapacitet mora biti veci od 0"
                }
            }

            if(resource.equipmentDescription && resource.equipmentDescription.length > 300){
                return {
                    status: 400,
                    message: "Opis opreme moze imati najvise 300 karaktera"
                }
            }

            
        }

        return {
                status: 200,
                message: "Validacija uspesna"
        }
    }

    // Izmena objekta ponovo postavlja status na pending, jer admin treba da odobri nove podatke.
    async updateFacility(id: string, data: any){
        try {
            const facility = await FacilityModel.findById(id)

            if(!facility){
                return {
                    status: 404,
                    message: "Objekat nije pronadjen"
                }
            }

            const {
                name,
                city,
                address,
                description,
                sportIds,
                workingHours,
                defaultHourlyPrice,
                allowedNoShows,
                resources
            } = data

            if (!name || !city || !address) {
                return {
                    status: 400,
                    message: "Naziv, grad i adresa su obavezni"
                };
            }

            if (!defaultHourlyPrice || defaultHourlyPrice <= 0) {
                return {
                    status: 400,
                    message: "Cena rezervacije po satu mora biti veća od 0"
                };
            }

            if (!allowedNoShows || allowedNoShows < 1) {
                return {
                    status: 400,
                    message: "Broj dozvoljenih nepojavljivanja mora biti najmanje 1"
                };
            }

            if (!workingHours || !workingHours.from || !workingHours.to) {
                return {
                    status: 400,
                    message: "Radno vreme je obavezno"
                };
            }

            if (!Array.isArray(sportIds) || sportIds.length === 0) {
                return {
                    status: 400,
                    message: "Objekat mora imati bar jedan sport"
                };
            }

            const validation = await this.validateResources(resources);

            if (validation.status !== 200) {
                return validation;
            }

            await FacilityModel.updateOne(
                {_id: id},
                {
                    name: name,
                    city: city,
                    address: address,
                    description: description,
                    sportIds: sportIds,
                    workingHours: workingHours,
                    defaultHourlyPrice: defaultHourlyPrice,
                    allowedNoShows: allowedNoShows,
                    status: "pending"
                }
            )

            // Najjednostavniji tok izmene resursa: stari skup se brise, pa se upisuje novi skup iz forme.
            await ResourceModel.deleteMany({facilityId: id})

            for (const resource of resources){
                await new ResourceModel({
                    facilityId: id,
                    name: resource.name,
                    type: resource.type,
                    capacity: resource.capacity,
                    sportIds: resource.sportIds,
                    equipmentDescription: resource.equipmentDescription,
                    active: true
                }).save()
            }

            return {
                status: 200,
                message: "Objekat je azuriran i ceka odobrenje administratora"
            }

        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Pregled rasporeda zaposlenog obuhvata sve rezervacije i treninge u objektima njegove organizacije.
    async getEmployeeSchedule(organizationId: string){
        try {
            const facilities = await FacilityModel.find({organizationId: organizationId})

            const facilityIds = facilities.map(f => f._id)

            const reservations = await ReservationModel.find({
                facilityId: {$in: facilityIds}
            }).populate("facilityId", "name").populate("resourceId", "name").populate("sportId", "name").sort({startAt: 1})

            const trainings = await TrainingSessionModel.find({
                facilityId: {$in: facilityIds}
            }).populate("facilityId", "name").populate("sportId", "name").populate("trainerId", "firstName lastName").sort({startAt: 1})

            return {
                status: 200,
                reservations: reservations,
                trainings: trainings
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Potvrda dolaska cuva i zaposlenog koji je evidentirao prisustvo.
    async markReservationAttended(id: string, employeeId: string){
        try{
            await ReservationModel.updateOne(
                {_id: id},
                {
                    status: "attended",
                    attendanceMarkedBy: employeeId
                }
            )

            return {
                status: 200,
                message: "Dolazak je potvrdjen"
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // No-show rezervacije osim statusa pokrece i kazneni mehanizam za sportistu u tom objektu.
    async markReservationNoShow(id: string, employeeId: string){
        try{
            const reservation = await ReservationModel.findById(id)
            
            if(!reservation){
                return {
                    status: 404,
                    message: "Rezervacija nije pronadjena"
                }
            }

            await ReservationModel.updateOne(
                {_id: id},
                {
                    status: "no_show",
                    attendanceMarkedBy: employeeId
                }
            )

            await this.registerNoShow(
                reservation.athleteId.toString(),
                reservation.facilityId.toString()
            )

            return {
                status: 200,
                message: "Korisnik se nije pojavio"
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Kazna je vezana za par sportista-objekat, jer svaki objekat ima svoje allowedNoShows pravilo.
    async registerNoShow(athleteId: string, facilityId: string){

        const facility = await FacilityModel.findById(facilityId)

        if(!facility){ return }

        const user: any = await UserModel.findById(athleteId)

        if(!user) { return }

        const penalites = user.penalties || []

        const existingPenalty = penalites.find(
            (p:any)=>String(p.facility) === facilityId
        )

        if(existingPenalty){
            existingPenalty.noShows = existingPenalty.noShows + 1

            if(existingPenalty.noShows >= facility.allowedNoShows){
                existingPenalty.blockedUntil = new Date("2099-12-31")
            }
        } else {
            penalites.push({
                facilityId: facilityId,
                noShows: 1,
                blockedUntil: facility.allowedNoShows <= 1 ? new Date("2099-12-31") : undefined
            })
        }

        await UserModel.updateOne(
            {_id: athleteId},
            {penalties: penalites}
        )
    }

    // Isto pravilo prisustva postoji i za individualne treninge.
    async markTrainingAttended(id: string){
        try{
            await TrainingSessionModel.updateOne(
                {_id: id},
                {
                    status: "attended"
                }
            )

            return {
                status: 200,
                message: "Dolazak na trening je potvrdjen"
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Ako sportista ne dodje na trening, upisuje se no_show i racuna se kazna za taj objekat.
    async markTrainingNoShow(id: string){
        try{
            const trainig = await TrainingSessionModel.findById(id)
            
            if(!trainig){
                return {
                    status: 404,
                    message: "Trening nije pronadjen"
                }
            }

            await TrainingSessionModel.updateOne(
                {_id: id},
                {
                    status: "no_show"
                }
            )

            await this.registerNoShow(
                trainig.athleteId.toString(),
                trainig.facilityId.toString()
            )

            return {
                status: 200,
                message: "Korisnik nije dosao na trening"
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Pre citanja promocija deaktiviramo one kojima je istekao period vazenja.
    async getPromotionsForFacility(facilityId: string){
        try{
            const now = new Date()

            await PromotionModel.updateMany(
                {facilityId: facilityId,
                    validTo: {$lt: now}
                },
                {
                    active: false
                }
            )

            const promotions = await PromotionModel.find({facilityId: facilityId}).sort({validFrom: -1})

            return {
                status: 200,
                promotions: promotions
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Kreiranje promocije proverava obavezna polja, period vazenja i tip popusta.
    async createPromotion(data: any){
        try{
            if (!data.title || !data.facilityId || !data.sportId) {
                return {
                    status: 400,
                    message: "Nisu uneti svi obavezni podaci za promociju"
                }
            }

            if (!data.validFrom || !data.validTo) {
                return {
                    status: 400,
                    message: "Period promocije je obavezan"
                }
            }

            if (new Date(data.validFrom) > new Date(data.validTo)) {
                return {
                    status: 400,
                    message: "Datum početka ne može biti posle datuma kraja"
                }
            }

            if (!["percent", "fixed"].includes(data.discountType)) {
                return {
                    status: 400,
                    message: "Neispravan tip popusta"
                }
            }

            if (!data.discountValue || data.discountValue <= 0) {
                return {
                    status: 400,
                    message: "Vrednost popusta mora biti veća od 0"
                }
            }

            const promotion = new PromotionModel({
                facilityId: data.facilityId,
                sportId: data.sportId,
                title: data.title,
                validFrom: data.validFrom,
                validTo: data.validTo,
                discountType: data.discountType,
                discountValue: data.discountValue,
                active: true
            })

            await promotion.save();

            return {
                status: 200,
                message: "Promocija je kreirana"
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Izmena promocije ostavlja zaposlenom kontrolu i nad aktivnim/neaktivnim statusom.
    async updatePromotion(id: string, data: any){
        try{ 
            await PromotionModel.updateOne(
                {_id: id},
                {
                    title: data.title,
                    sportId: data.sportId,
                    validFrom: data.validFrom,
                    validTo: data.validTo,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    active: data.active
                }
            )

            return {
                status: 200,
                message: "Promocija je azurirana"
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Katalog opreme koji zaposleni uredjuje za jedan objekat.
    async getEquipmentForFacility(facilityId: string){
        try{
            const equipment = await EquipmentModel.find({facilityId: facilityId})

            return {
                status: 200,
                equipment: equipment
            }
        } catch(err){
            console.log(err)
            return {
                status: 500,
                message: "Greska na serveru"
            }
        }
    }

    // Slika opreme se formira u controlleru iz req.file, a servis validira poslovna polja i cuva zapis.
    async createEquipment(data: any) {
        try {
            if (!data.facilityId || !data.sportId || !data.name) {
                return {
                    status: 400,
                    message: "Nisu uneti svi obavezni podaci za opremu"
                }
            }

            if (!data.price || data.price <= 0) {
                return {
                    status: 400,
                    message: "Cena mora biti veća od 0"
                }
            }

            if (data.stock === undefined || data.stock < 0) {
                return {
                    status: 400,
                    message: "Zalihe ne mogu biti negativne"
                }
            }

            const equipment = new EquipmentModel({
                facilityId: data.facilityId,
                sportId: data.sportId,
                name: data.name,
                imageUrl: data.imageUrl || "",
                price: data.price,
                stock: data.stock,
                active: true
            })

            await equipment.save()

            return {
                status: 200,
                message: "Oprema je dodata"
            }

        } catch (err) {
            console.log(err);
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    // Ako controller posalje novi imageUrl, update ce zameniti staru sliku opreme.
    async updateEquipment(id: string, data: any) {
        try {
            if (!data.price || data.price <= 0) {
                return {
                    status: 400,
                    message: "Cena mora biti veća od 0"
                }
            }

            if (data.stock === undefined || data.stock < 0) {
                return {
                    status: 400,
                    message: "Zalihe ne mogu biti negativne"
                }
            }

            const updateData: any = {
                name: data.name,
                sportId: data.sportId,
                imageUrl: data.imageUrl,
                price: data.price,
                stock: data.stock,
                active: data.active 
            }

            if(data.imageUrl){
                updateData.imageUrl = data.imageUrl
            }

            await EquipmentModel.updateOne(
                { _id: id },
                updateData
            )

            return {
                status: 200,
                message: "Oprema je ažurirana"
            }

        } catch (err) {
            console.log(err)
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    // Zaposleni prati porudzbine koje pripadaju njegovom objektu.
    async getOrdersForFacility(facilityId: string) {
        try {
            const orders = await OrderModel.find({
                facilityId: facilityId
            }).sort({ createdAt: -1 })

            return {
                status: 200,
                orders: orders
            }

        } catch (err) {
            console.log(err)
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    // Status narudzbine se ogranicava na vrednosti koje front i baza ocekuju.
    async updateOrderStatus(id: string, status: string) {
        try {
            if (!["accepted", "picked_up", "cancelled"].includes(status)) {
                return {
                    status: 400,
                    message: "Neispravan status narudžbine"
                }
            }

            await OrderModel.updateOne(
                { _id: id },
                {
                    status: status
                }
            )

            return {
                status: 200,
                message: "Status narudžbine je ažuriran"
            }

        } catch (err) {
            console.log(err);
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    // PDFKit emituje podatke u chunk-ovima; ovde ih skupljamo u jedan Buffer za Express response.
    private createPDFBuffer(doc: PDFKit.PDFDocument) {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = []

            doc.on("data", chunk=>chunks.push(chunk))
            doc.on("end", () => resolve(Buffer.concat(chunks)))
            doc.on("error", reject)

            doc.end()
        })
    }

    // Izvestaj popunjenosti racuna zauzete sate po resursu u odnosu na radno vreme objekta za dati mesec.
    async generateOccupancyReport(facilityId: string, year: number, month: number){
        try {
            const facility = await FacilityModel.findById(facilityId)

            if(!facility){
                return {
                    status: 404,
                    message: "Objekat nije pronadjen"
                }
            }

            const resources = await ResourceModel.find({
                facilityId: facilityId,
                active: true
                
            })

            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 1)

            const daysInMonth = new Date(year, month, 0).getDate()

            if(!facility.workingHours){
                return {
                    status: 404,
                    message: "Objekat nema definisano radno vreme"
                }
            }

            const [fromHour, fromMinute] = facility.workingHours.from.split(":").map(Number)
            const [toHour, toMinute] = facility.workingHours.to.split(":").map(Number)

            // Radno vreme pretvaramo u broj sati dnevno da bismo dobili ukupne dostupne sate po resursu.
            const workingHoursPerDay = (toHour + toMinute / 60) - (fromHour + fromMinute / 60)

            const totalAvailableHours = daysInMonth * workingHoursPerDay

            const doc = new PDFDocument({ margin: 40 })

            doc.fontSize(18).text("Mesecni izvestaj o popunjenosti terena", {
                align: 'center'
            })

            doc.moveDown()
            doc.fontSize(12).text(`Objekat: ${facility.name}`)
            doc.text(`Period: ${month}/${year}`)
            doc.text(`Radno vreme: ${facility.workingHours.from}-${facility.workingHours.to}`)
            doc.moveDown()

            doc.fontSize(12).text("Resurs | Zauzeti sati | Dostupni sati | Popunjenost")
            doc.moveDown(0.5)

            for (const resource of resources){
                const reservations = await ReservationModel.find({
                    resourceId: resource._id,
                    startAt: {$gte: startDate, $lt: endDate},
                    status: {$in: ["confirmed", "attended"]}
                })

                let reservedHours = 0
                for(const res of reservations){
                    const start = new Date(res.startAt)
                    const end = new Date(res.endAt)

                    reservedHours += (end.getTime() - start.getTime()) / (1000*60*60)
                }

                const occupancy = totalAvailableHours > 0 ? (reservedHours / totalAvailableHours) * 100 : 0

                doc.text(`${resource.name} | ${reservedHours.toFixed(2)} | ${totalAvailableHours.toFixed(2)} | ${occupancy.toFixed(2)}`)
            }

            const pdfBuffer = await this.createPDFBuffer(doc)

            return {
                status: 200,
                pdfBuffer: pdfBuffer
            }

        } catch (err) {
            console.log(err);
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    // Izvestaj opreme sabira prodate kolicine i promet po artiklu za izabrani mesec.
    async generateEquipmentReport(facilityId: string, year: number, month: number) {
        try {
            const facility = await FacilityModel.findById(facilityId)

            if (!facility) {
            return {
                status: 404,
                message: "Objekat nije pronađen"
            }
            }

            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 1)

            const orders = await OrderModel.find({
            facilityId: facilityId,
            createdAt: { $gte: startDate, $lt: endDate },
            status: { $in: ["accepted", "picked_up"] }
            })

            const equipmentMap = new Map<string, {
                    name: string
                    quantity: number
                    revenue: number
            }>();

            let totalRevenue = 0

            for (const order of orders) {
            for (const item of order.items) {
                const key = item.equipmentId.toString()

                if (!equipmentMap.has(key)) {
                    equipmentMap.set(key, {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    })
                }

                const entry = equipmentMap.get(key)!

                entry.quantity += item.quantity
                entry.revenue += item.quantity * item.unitPrice

                totalRevenue += item.quantity * item.unitPrice
                }
            }

            const doc = new PDFDocument({ margin: 40 })

            doc.fontSize(18).text("Mesecni izvestaj o prometu opreme", {
            align: "center"
            })

            doc.moveDown()
            doc.fontSize(12).text(`Objekat: ${facility.name}`)
            doc.text(`Period: ${month}/${year}`)
            doc.text(`Broj narudzbina: ${orders.length}`)
            doc.text(`Ukupan promet: ${totalRevenue} RSD`)
            doc.moveDown()

            doc.text("Oprema | Kolicina | Promet")
            doc.moveDown(0.5)

            equipmentMap.forEach(value => {
            doc.text(
                `${value.name} | ${value.quantity} | ${value.revenue} RSD`
                )
            })

            const pdfBuffer = await this.createPDFBuffer(doc)

            return {
            status: 200,
            pdfBuffer: pdfBuffer
            }

        } catch (err) {
            console.log(err);
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    // Kalendar zaposlenog za jedan resurs vraca rezervacije i treninge u istom nizu dogadjaja.
    // Front tako moze da ih iscrta u istoj mrezi, a razlikuje ih preko polja type.
    async getCalendarEvents(resourceId: string, from: string, to: string){
        try{
            const start = new Date(from)
            const end = new Date(to)

            // Uzimaju se dogadjaji koji pocinju u trazenom periodu prikaza kalendara.
            const reservations = await ReservationModel.find({
                resourceId: resourceId,
                startAt: {$gte: start, $lt: end}
                }
            )

            const trainings = await TrainingSessionModel.find({
                resourceId: resourceId,
                startAt: {$gte: start, $lt: end}
            })

            // Rezervacije i treninzi imaju slicna polja, pa ih normalizujemo u zajednicki event format.
            const events = [
                ...reservations.map(r => ({
                    _id: r._id,
                    type: "reservation",
                    title: "Rezervacija",
                    startAt: r.startAt,
                    endAt: r.endAt,
                    status: r.status,
                    facilityId: r.facilityId,
                    resourceId: r.resourceId,
                    sportId: r.sportId
                })),

                ...trainings.map(t => ({
                    _id: t._id,
                    type: "training",
                    title: "Trening",
                    startAt: t.startAt,
                    endAt: t.endAt,
                    status: t.status,
                    facilityId: t.facilityId,
                    resourceId: t.resourceId,
                    sportId: t.sportId
                }))
            ]

            return {
                status: 200,
                events: events
            }
        } catch (err) {
            console.log(err);
            return {
                status: 500,
                message: "Greška na serveru"
            }
        }
    }

    private normalizeUser(user: any){
        return {
            ...user,
            _id: user._id.toString(),
            favoriteSportIds: (user.favoriteSportIds || []).map((sportId: any) => sportId.toString())
        }
    }
}
