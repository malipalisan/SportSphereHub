import UserModel from "../models/User"
import ReservationModel from "../models/Reservation"
import SportModel from "../models/Sport"
import FacilityModel from "../models/Facility"
import ResourceModel from "../models/Resource"
import TrainingSessionModel from "../models/TrainingSession"
import TrainerModel from "../models/Trainer"
import EquipmentModel from "../models/Equipment"
import OrderModel from "../models/Order"
import TeammateAdModel from "../models/TeammateAd"
import FacilityReviewModel from "../models/FacilityReview"

export class AthleteService{

    // Profil objedinjuje sve sto sportista vidi na jednoj strani: podatke, sportove, rezervacije, treninge i porudzbine.
    async getProfileData(id: string){
        try{
            const user: any = await UserModel.findById(id).select("-passwordHash").lean()

            if(!user){
                return {status: 404, message: "Korisnik nije pronadjen"}
            }

            const sports = await SportModel.find({active: true}).sort({name: 1}).lean()

            const reservations = await ReservationModel.find({athleteId: id})
                .populate("facilityId", "name city")
                .populate("resourceId", "name")
                .populate("sportId", "name")
                .sort({startAt: -1})
                .lean()

            const trainings = await TrainingSessionModel.find({athleteId: id})
                .populate("facilityId", "name city")
                .populate("resourceId", "name")
                .populate("sportId", "name")
                .populate("trainerId", "firstName lastName specialization")
                .sort({startAt: -1})
                .lean()

            const orders = await OrderModel.find({athleteId: id})
                .populate("facilityId", "name city")
                .sort({createdAt: -1})
                .lean()

            return {
                status: 200,
                user: this.normalizeUser(user),
                sports: sports,
                reservations: reservations,
                trainings: trainings,
                orders: orders
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Izmena profila menja osnovne podatke, omiljene sportove i po potrebi profilnu sliku.
    async updateProfile(id: string, data: any, file: any){
        try{
            const user = await UserModel.findById(id)

            if(!user){
                return {status: 404, message: "Korisnik nije pronadjen"}
            }

            const favoriteSportIds = 
            data.favoriteSportIds ? Array.isArray(data.favoriteSportIds) ? data.favoriteSportIds : [data.favoriteSportIds] : []

            const updateData: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                favoriteSportIds: favoriteSportIds
            }

            if(file){
                // Multer je vec snimio fajl; ovde samo cuvamo javnu putanju do nove slike.
                updateData.avatarUrl = "/uploads/" + file.filename
            }

            await UserModel.updateOne({_id: id}, updateData)

            const updatedUser: any = await UserModel.findById(id).select("-passwordHash").lean()

            return {
                status: 200,
                message: "Profil je azuriran",
                user: this.normalizeUser(updatedUser)
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Otkazivanje je dozvoljeno samo vlasniku rezervacije i samo ako termin pocinje za 12 ili vise sati.
    async cancelReservation(id: string, athleteId: string){
        try{
            const reservation = await ReservationModel.findById(id)

            if(!reservation){
                return {status: 404, message: "Rezervacija nije pronadjena"}
            }

            if(reservation.athleteId.toString() !== athleteId){
                return {status: 403, message: "Nemate pravo da otkazete ovu rezervaciju"}
            }

            if(reservation.status === "cancelled"){
                return {status: 400, message: "Rezervacija je vec otkazana"}
            }

            const twelveHoursMs = 12 * 60 * 60 * 1000
            const startsInMs = reservation.startAt.getTime() - Date.now()

            if(startsInMs < twelveHoursMs){
                return {status: 400, message: "Rezervaciju nije moguce otkazati manje od 12 sati pre pocetka"}
            }

            await ReservationModel.updateOne({_id: id}, {status: "cancelled"})

            return {status: 200, message: "Rezervacija je otkazana"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Potvrdjivanje je dozvoljeno samo vlasniku rezervacije i samo ako termin pocinje za 12 ili vise sati.
    async confirmReservation(id: string, athleteId: string){
        try{
            const reservation = await ReservationModel.findById(id)

            if(!reservation){
                return {status: 404, message: "Rezervacija nije pronadjena"}
            }

            if(reservation.athleteId.toString() !== athleteId){
                return {status: 403, message: "Nemate pravo da otkazete ovu rezervaciju"}
            }

            if(reservation.status === "confirmed"){
                return {status: 400, message: "Rezervacija je vec potvrdjena"}
            }

            const twelveHoursMs = 12 * 60 * 60 * 1000
            const startsInMs = reservation.startAt.getTime() - Date.now()

            if(startsInMs < twelveHoursMs){
                return {status: 400, message: "Rezervaciju nije moguce otkazati manje od 12 sati pre pocetka"}
            }

            await ReservationModel.updateOne({_id: id}, {status: "confirmed"})

            return {status: 200, message: "Rezervacija je potvrdjena"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Podaci za formu pretrage: gradovi, sportovi i tipovi resursa.
    async getSearchData(){
        try{
            const cities = await FacilityModel.distinct("city", {status: "approved"})
            const sports = await SportModel.find({active: true}).sort({name: 1}).lean()
            const resourceTypes = await ResourceModel.distinct("type", {active: true})

            return {
                status: 200,
                cities: cities,
                sports: sports,
                resourceTypes: resourceTypes
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Pretraga prvo filtrira objekte, pa za svaki objekat dodatno filtrira njegove aktivne resurse.
    async searchFacilities(data: any){
        try{
            const query: any = {status: "approved"}

            if(data.name && data.name.trim() !== ""){
                query.name = {$regex: data.name, $options: "i"}
            }

            if(data.cities && data.cities.length > 0){
                query.city = {$in: data.cities}
            }

            if(data.sportId && data.sportId !== ""){
                query.sportIds = data.sportId
            }

            const facilities = await FacilityModel.find(query).lean()
            const results = []

            for(const facility of facilities){
                const resourceQuery: any = {
                    facilityId: facility._id,
                    active: true
                }

                if(data.resourceType && data.resourceType !== ""){
                    resourceQuery.type = data.resourceType
                }

                if(data.sportId && data.sportId !== ""){
                    resourceQuery.sportIds = data.sportId
                }

                let resources = await ResourceModel.find(resourceQuery).lean()

                if(data.onlyFreeToday === true || data.onlyFreeToday === "true"){
                    resources = await this.filterFreeToday(resources)
                }

                if(resources.length > 0){
                    results.push({
                        facility: facility,
                        resources: resources
                    })
                }
            }

            return {status: 200, results: results}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Detalji objekta za sportistu vracaju aktivne resurse, poslednje komentare i pravo korisnika da oceni objekat.
    async getFacilityDetails(id: string, athleteId?: string){
        try{
            const facility = await FacilityModel.findById(id).lean()

            if(!facility){
                return {status: 404, message: "Objekat nije pronadjen"}
            }

            const resources = await ResourceModel.find({facilityId: id, active: true}).lean()
            const comments = await this.getLatestFacilityComments(id, athleteId)
            const reviewInfo = athleteId ? await this.getFacilityReviewInfo(id, athleteId) : {
                confirmedReservationsCount: 0,
                reviewsCount: 0,
                remainingReviews: 0,
                canReview: false
            }

            return {
                status: 200,
                facility: facility,
                resources: resources,
                comments: comments,
                reviewInfo: reviewInfo
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Sportista sme da ostavi reakciju i komentar samo ako ima potvrdene rezervacije u tom objektu.
    // Broj njegovih ocena ne sme preci broj tih potvrdenih rezervacija.
    async createFacilityReview(facilityId: string, data: any){
        try{
            const athleteId = data.athleteId
            const reaction = data.reaction
            const comment = data.comment ? data.comment.trim() : ""

            if(!athleteId){
                return {status: 400, message: "Korisnik nije prosledjen"}
            }

            if(reaction !== "like" && reaction !== "dislike"){
                return {status: 400, message: "Izaberite svidjanje ili nesvidjanje"}
            }

            if(comment === ""){
                return {status: 400, message: "Komentar je obavezan"}
            }

            if(comment.length > 500){
                return {status: 400, message: "Komentar moze imati najvise 500 karaktera"}
            }

            const facility = await FacilityModel.findById(facilityId)

            if(!facility){
                return {status: 404, message: "Objekat nije pronadjen"}
            }

            const reviewInfo = await this.getFacilityReviewInfo(facilityId, athleteId)

            if(!reviewInfo.canReview){
                return {
                    status: 400,
                    message: "Komentar i ocenu mozete ostaviti samo za broj potvrdjenih rezervacija u ovom objektu"
                }
            }

            await new FacilityReviewModel({
                facilityId: facilityId,
                athleteId: athleteId,
                reaction: reaction,
                comment: comment
            }).save()

            await FacilityModel.updateOne(
                {_id: facilityId},
                reaction === "like" ? {$inc: {likesCount: 1}} : {$inc: {dislikesCount: 1}}
            )

            const updatedFacility = await FacilityModel.findById(facilityId).lean()
            const comments = await this.getLatestFacilityComments(facilityId, athleteId)
            const updatedReviewInfo = await this.getFacilityReviewInfo(facilityId, athleteId)

            return {
                status: 200,
                message: "Ocena je sacuvana",
                facility: updatedFacility,
                comments: comments,
                reviewInfo: updatedReviewInfo
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Kalendar za jedan resurs spaja rezervacije i treninge u isti format dogadjaja.
    // Uslov startAt < end && endAt > start hvata svako preklapanje sa trazenim periodom,
    // cak i kada dogadjaj pocne pre pocetka nedelje ili se zavrsi nakon kraja prikaza.
    async getResourceEvents(resourceId: string, from: string, to: string){
        try{
            const start = new Date(from)
            const end = new Date(to)

            const reservations = await ReservationModel.find({
                resourceId: resourceId,
                status: {$ne: "cancelled"},
                startAt: {$lt: end},
                endAt: {$gt: start}
            }).lean()

            const trainings = await TrainingSessionModel.find({
                resourceId: resourceId,
                status: {$ne: "cancelled"},
                startAt: {$lt: end},
                endAt: {$gt: start}
            }).lean()

            return {
                status: 200,
                events: [
                    ...reservations.map((reservation: any) => ({
                        _id: reservation._id,
                        type: "reservation",
                        title: "Rezervacija",
                        startAt: reservation.startAt,
                        endAt: reservation.endAt,
                        status: reservation.status
                    })),
                    ...trainings.map((training: any) => ({
                        _id: training._id,
                        type: "training",
                        title: "Trening",
                        startAt: training.startAt,
                        endAt: training.endAt,
                        status: training.status
                    }))
                ].sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Kreiranje rezervacije koristi isti endpoint i za formu i za klik na kalendar.
    // Zato ovde mora da ostane centralna validacija: pun sat, radno vreme i zauzetost resursa.
    async createReservation(data: any){
        try{
            const startAt = new Date(data.startAt)
            const endAt = new Date(data.endAt)
            const validation = this.validateTimeRange(startAt, endAt)
            if(validation){
                return validation
            }

            const resource = await ResourceModel.findById(data.resourceId)
            const facility = await FacilityModel.findById(data.facilityId)

            if(!resource || !facility){
                return {status: 404, message: "Objekat ili teren nije pronadjen"}
            }

            if(resource.facilityId.toString() !== data.facilityId){
                return {status: 400, message: "Teren ne pripada izabranom objektu"}
            }

            const workingHoursValidation = this.validateReservationWorkingHours(startAt, endAt, facility.workingHours)
            if(workingHoursValidation){
                return workingHoursValidation
            }

            const busy = await this.hasResourceOverlap(data.resourceId, startAt, endAt)
            if(busy){
                return {status: 400, message: "Izabrani termin nije slobodan"}
            }


            const reservation = new ReservationModel({
                athleteId: data.athleteId,
                facilityId: data.facilityId,
                resourceId: data.resourceId,
                sportId: data.sportId || resource.sportIds[0],
                startAt: startAt,
                endAt: endAt,
                status: "pending",
                price: facility.defaultHourlyPrice
            })

            await reservation.save()

            return {status: 200, message: "Rezervacija je poslata"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Vraca aktivne oglase drugih sportista i posebno oglase koje je trenutni sportista sam napravio.
    async getTeammateAds(athleteId: string){
        try{
            const ads = await TeammateAdModel.find({status: "active"})
                .populate("authorId", "username firstName lastName")
                .populate("sportId", "name")
                .populate("joinRequests.athleteId", "username firstName lastName")
                .sort({startAt: 1})
                .lean()

            const myAds = await TeammateAdModel.find({authorId: athleteId})
                .populate("sportId", "name")
                .populate("joinRequests.athleteId", "username firstName lastName")
                .sort({createdAt: -1})
                .lean()

            const sports = await SportModel.find({active: true}).sort({name: 1}).lean()
            const cities = await FacilityModel.distinct("city", {status: "approved"})

            return {
                status: 200,
                ads: ads,
                myAds: myAds,
                sports: sports,
                cities: cities
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Oglas za saigrace koristi isti vremenski validator kao rezervacije: pocetak na pun sat i trajanje u satima.
    async createTeammateAd(data: any){
        try{
            const startAt = new Date(data.startAt)
            const endAt = new Date(data.endAt)
            const missingPlayers = Number(data.missingPlayers)

            const validation = this.validateTimeRange(startAt, endAt)
            if(validation){
                return validation
            }

            if(!missingPlayers || missingPlayers < 1){
                return {status: 400, message: "Broj igraca mora biti najmanje 1"}
            }

            await new TeammateAdModel({
                authorId: data.authorId,
                sportId: data.sportId,
                city: data.city,
                startAt: startAt,
                endAt: endAt,
                missingPlayers: missingPlayers,
                status: "active",
                joinRequests: []
            }).save()

            return {status: 200, message: "Oglas je objavljen"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Zahtev za pridruzivanje se cuva u samom oglasu dok ga autor ne odobri ili odbije.
    async requestJoinAd(id: string, athleteId: string){
        try{
            const ad: any = await TeammateAdModel.findById(id)

            if(!ad){
                return {status: 404, message: "Oglas nije pronadjen"}
            }

            if(ad.authorId.toString() === athleteId){
                return {status: 400, message: "Ne mozete se prijaviti na svoj oglas"}
            }

            if(ad.status !== "active"){
                return {status: 400, message: "Oglas nije aktivan"}
            }

            const existingRequest = ad.joinRequests.find((request: any) => request.athleteId.toString() === athleteId)

            if(existingRequest){
                return {status: 400, message: "Zahtev vec postoji"}
            }

            ad.joinRequests.push({
                athleteId: athleteId,
                status: "pending",
                createdAt: new Date()
            })

            await ad.save()

            return {status: 200, message: "Zahtev je poslat"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Samo autor oglasa moze da odobri/odbije zahteve; kada se popuni broj igraca oglas se zatvara.
    async updateJoinRequest(id: string, athleteId: string, requestAthleteId: string, status: string){
        try{
            const ad: any = await TeammateAdModel.findById(id)

            if(!ad){
                return {status: 404, message: "Oglas nije pronadjen"}
            }

            if(ad.authorId.toString() !== athleteId){
                return {status: 403, message: "Samo autor moze da upravlja zahtevima"}
            }

            if(status !== "approved" && status !== "rejected"){
                return {status: 400, message: "Neispravan status"}
            }

            const request = ad.joinRequests.find((r: any) => r.athleteId.toString() === requestAthleteId)

            if(!request){
                return {status: 404, message: "Zahtev nije pronadjen"}
            }

            request.status = status

            const approvedCount = ad.joinRequests.filter((r: any) => r.status === "approved").length
            if(approvedCount >= ad.missingPlayers){
                ad.status = "closed"
            }

            await ad.save()

            return {status: 200, message: "Zahtev je azuriran"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Autor moze rucno da zatvori oglas i pre nego sto se ekipa popuni.
    async closeTeammateAd(id: string, athleteId: string){
        try{
            const ad: any = await TeammateAdModel.findById(id)

            if(!ad){
                return {status: 404, message: "Oglas nije pronadjen"}
            }

            if(ad.authorId.toString() !== athleteId){
                return {status: 403, message: "Samo autor moze da zatvori oglas"}
            }

            ad.status = "closed"
            await ad.save()

            return {status: 200, message: "Oglas je zatvoren"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Filter za individualne treninge vraca trenere i resurse po objektu i sportu.
    async getTrainingData(facilityId: string, sportId: string){
        try{
            const facilities = await FacilityModel.find({status: "approved"}).sort({name: 1}).lean()
            const sports = await SportModel.find({active: true}).sort({name: 1}).lean()
            const trainerQuery: any = {active: true}
            const resourceQuery: any = {active: true}

            if(facilityId){
                trainerQuery.facilityId = facilityId
                resourceQuery.facilityId = facilityId
            }

            if(sportId){
                trainerQuery.sportIds = sportId
                resourceQuery.sportIds = sportId
            }

            const trainers = await TrainerModel.find(trainerQuery)
                .populate("facilityId", "name city")
                .populate("sportIds", "name")
                .sort({firstName: 1})
                .lean()

            const resources = await ResourceModel.find(resourceQuery).sort({name: 1}).lean()

            return {
                status: 200,
                facilities: facilities,
                sports: sports,
                trainers: trainers,
                resources: resources
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Zakazivanje treninga proverava i zauzetost terena/hale i zauzetost izabranog trenera.
    async bookTraining(data: any){
        try{
            const startAt = new Date(data.startAt)
            const endAt = new Date(data.endAt)

            const validation = this.validateTimeRange(startAt, endAt)
            if(validation){
                return validation
            }

            const trainer: any = await TrainerModel.findById(data.trainerId)
            const resource = await ResourceModel.findById(data.resourceId)

            if(!trainer || !resource){
                return {status: 404, message: "Trener ili teren nije pronadjen"}
            }

            if(trainer.facilityId.toString() !== data.facilityId || resource.facilityId.toString() !== data.facilityId){
                return {status: 400, message: "Trener i teren moraju pripadati izabranom objektu"}
            }

            const resourceBusy = await this.hasResourceOverlap(data.resourceId, startAt, endAt)
            if(resourceBusy){
                return {status: 400, message: "Izabrani teren nije slobodan"}
            }

            const trainerBusy = await TrainingSessionModel.exists({
                trainerId: data.trainerId,
                status: {$ne: "cancelled"},
                startAt: {$lt: endAt},
                endAt: {$gt: startAt}
            })

            if(trainerBusy){
                return {status: 400, message: "Trener nije slobodan u izabranom terminu"}
            }

            await new TrainingSessionModel({
                athleteId: data.athleteId,
                trainerId: data.trainerId,
                facilityId: data.facilityId,
                resourceId: data.resourceId,
                sportId: data.sportId,
                startAt: startAt,
                endAt: endAt,
                status: "scheduled",
                price: trainer.hourlyPrice
            }).save()

            return {status: 200, message: "Trening je zakazan"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Katalog opreme moze biti filtriran po sportu, a rezultat nosi i podatke o objektu koji prodaje opremu.
    async getShopData(sportId: string){
        try{
            const sports = await SportModel.find({active: true}).sort({name: 1}).lean()
            const query: any = {active: true}

            if(sportId){
                query.sportId = sportId
            }

            const equipment = await EquipmentModel.find(query)
                .populate("sportId", "name")
                .populate("facilityId", "name city")
                .sort({name: 1})
                .lean()

            return {
                status: 200,
                sports: sports,
                equipment: equipment
            }
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Jedna korpa se deli na vise porudzbina ako artikli pripadaju razlicitim objektima.
    async createOrder(data: any){
        try{
            if(!data.items || !Array.isArray(data.items) || data.items.length === 0){
                return {status: 400, message: "Korpa je prazna"}
            }

            const groupedItems = new Map<string, any[]>()

            for(const item of data.items){
                const equipment: any = await EquipmentModel.findById(item.equipmentId)

                if(!equipment || !equipment.active){
                    return {status: 404, message: "Oprema nije pronadjena"}
                }

                const quantity = Number(item.quantity)

                if(!quantity || quantity < 1){
                    return {status: 400, message: "Kolicina mora biti veca od 0"}
                }

                if(equipment.stock < quantity){
                    return {status: 400, message: `Nema dovoljno zaliha za ${equipment.name}`}
                }

                const facilityId = equipment.facilityId.toString()
                const group = groupedItems.get(facilityId) || []

                group.push({
                    equipment: equipment,
                    quantity: quantity
                })

                groupedItems.set(facilityId, group)
            }

            for(const group of groupedItems.values()){
                for(const item of group){
                    await EquipmentModel.updateOne(
                        {_id: item.equipment._id},
                        {$inc: {stock: -item.quantity}}
                    )
                }
            }

            for(const [facilityId, group] of groupedItems.entries()){
                const orderItems = group.map((item) => ({
                    equipmentId: item.equipment._id,
                    name: item.equipment.name,
                    quantity: item.quantity,
                    unitPrice: item.equipment.price
                }))

                const totalPrice = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

                await new OrderModel({
                    athleteId: data.athleteId,
                    facilityId: facilityId,
                    items: orderItems,
                    totalPrice: totalPrice,
                    status: "ordered"
                }).save()
            }

            return {status: 200, message: "Porudzbina je kreirana"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // Otkazivanje porudzbine vraca zalihe u magacin i menja status samo za aktivne porudzbine.
    async cancelOrder(id: string, athleteId: string){
        try{
            const order: any = await OrderModel.findById(id)

            if(!order){
                return {status: 404, message: "Porudzbina nije pronadjena"}
            }

            if(order.athleteId.toString() !== athleteId){
                return {status: 403, message: "Nemate pravo da otkazete ovu porudzbinu"}
            }

            if(order.status !== "ordered"){
                return {status: 400, message: "Moguce je otkazati samo aktivne porudzbine"}
            }

            for(const item of order.items){
                await EquipmentModel.updateOne(
                    {_id: item.equipmentId},
                    {$inc: {stock: item.quantity}}
                )
            }

            order.status = "cancelled"
            await order.save()

            return {status: 200, message: "Porudzbina je otkazana"}
        } catch(err){
            console.log(err)
            return {status: 500, message: "Greska na serveru"}
        }
    }

    // ObjectId vrednosti se pretvaraju u stringove da Angular lakse radi binding i poredjenja.
    private normalizeUser(user: any){
        return {
            ...user,
            _id: user._id.toString(),
            favoriteSportIds: (user.favoriteSportIds || []).map((sportId: any) => sportId.toString())
        }
    }

    // Osnovno pravilo svih termina: datum mora biti validan, pocetak na pun sat, trajanje najmanje sat vremena.
    private validateTimeRange(startAt: Date, endAt: Date){
        if(Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())){
            return {status: 400, message: "Neispravan datum termina"}
        }

        if(startAt.getMinutes() !== 0 || startAt.getSeconds() !== 0 || startAt.getMilliseconds() !== 0){
            return {status: 400, message: "Termin mora poceti na pun sat"}
        }

        const durationMs = endAt.getTime() - startAt.getTime()
        const oneHourMs = 60 * 60 * 1000

        if(durationMs < oneHourMs || durationMs % oneHourMs !== 0){
            return {status: 400, message: "Termin mora trajati najmanje 1 sat i u celim satima"}
        }

        return null
    }

    // Dodatna provera za rezervacije: kraj termina ne sme da predje zatvaranje objekta.
    // Ako termin predje u sledeci dan, tretira se kao van radnog vremena.
    private validateReservationWorkingHours(startAt: Date, endAt: Date, workingHours: any){
        const closingMinutes = this.timeToMinutes(workingHours?.to)

        if(closingMinutes === null){
            return null
        }

        const startDay = new Date(startAt)
        startDay.setHours(0, 0, 0, 0)

        const endDay = new Date(endAt)
        endDay.setHours(0, 0, 0, 0)

        const endMinutes = endAt.getHours() * 60 + endAt.getMinutes()

        if(endDay.getTime() !== startDay.getTime() || endMinutes > closingMinutes){
            return {status: 400, message: "Objekat ne radi u periodu vase rezervacije"}
        }

        return null
    }

    // "HH:mm" pretvaramo u broj minuta od ponoci da poredjenje radnog vremena bude jednostavno.
    private timeToMinutes(time: string | undefined){
        if(!time){
            return null
        }

        const [hours, minutes] = time.split(":").map(Number)

        if(Number.isNaN(hours) || Number.isNaN(minutes)){
            return null
        }

        return hours * 60 + minutes
    }

    // Jedan resurs je zauzet ako postoji rezervacija ili trening koji se vremenski preklapa sa trazenim terminom.
    // Koristi se standardni intervalni uslov: postojeci start < novi kraj i postojeci kraj > novi start.
    private async hasResourceOverlap(resourceId: string, startAt: Date, endAt: Date){
        const reservationOverlap = await ReservationModel.exists({
            resourceId: resourceId,
            status: {$ne: "cancelled"},
            startAt: {$lt: endAt},
            endAt: {$gt: startAt}
        })


        const trainingOverlap = await TrainingSessionModel.exists({
            resourceId: resourceId,
            status: {$ne: "cancelled"},
            startAt: {$lt: endAt},
            endAt: {$gt: startAt}
        })


        return !!reservationOverlap || !!trainingOverlap
    }

    // Opcija "samo slobodni termini danas" zadrzava samo resurse bez ijednog dogadjaja u toku danasnjeg dana.
    private async filterFreeToday(resources: any[]){
        const now = new Date()
        const start = new Date(now)
        start.setHours(0, 0, 0, 0)

        const end = new Date(start)
        end.setDate(start.getDate() + 1)

        const freeResources = []

        for(const resource of resources){
            const busy = await this.hasResourceOverlap(resource._id.toString(), start, end)

            if(!busy){
                freeResources.push(resource)
            }
        }

        return freeResources
    }

    // Potvrdjena rezervacija za ocenjivanje je ona koju je zaposleni potvrdio ili evidentirao kao odrzanu.
    private async countConfirmedFacilityReservations(facilityId: string, athleteId: string){
        return ReservationModel.countDocuments({
            facilityId: facilityId,
            athleteId: athleteId,
            status: {$in: ["confirmed", "attended"]}
        })
    }

    // Broj ostavljenih ocena se poredi sa brojem potvrdjenih rezervacija za istog sportistu i objekat.
    private async getFacilityReviewInfo(facilityId: string, athleteId: string){
        const confirmedReservationsCount = await this.countConfirmedFacilityReservations(facilityId, athleteId)
        const reviewsCount = await FacilityReviewModel.countDocuments({
            facilityId: facilityId,
            athleteId: athleteId
        })
        const remainingReviews = Math.max(0, confirmedReservationsCount - reviewsCount)

        return {
            confirmedReservationsCount: confirmedReservationsCount,
            reviewsCount: reviewsCount,
            remainingReviews: remainingReviews,
            canReview: remainingReviews > 0
        }
    }

    // Na detaljima objekta prikazujemo samo poslednjih 5 komentara, uz oznaku koji pripadaju trenutnom sportisti.
    private async getLatestFacilityComments(facilityId: string, athleteId?: string){
        const comments = await FacilityReviewModel.find({facilityId: facilityId})
            .populate("athleteId", "username firstName lastName")
            .sort({createdAt: -1})
            .limit(5)
            .lean()

        return comments.map((comment: any) => ({
            ...comment,
            isOwn: athleteId ? comment.athleteId?._id?.toString() === athleteId : false
        }))
    }
}
