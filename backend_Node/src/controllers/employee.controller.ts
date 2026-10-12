import express from 'express'
import SportModel from '../models/Sport'
import FacilityModel from '../models/Facility'
import ResourceModel from '../models/Resource'
import { EmployeeService } from '../services/employeeService'

export class EmployeeController{

    // Zaposleni menja osnovne podatke, a nova profilna slika dolazi kroz multer kao req.file.
    async updateEmployeeProfile(req: express.Request, res: express.Response){
        const id = req.params.id as string
            
        const updateData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone
        }
            

        const result = await new EmployeeService().updateUserProfile(id, updateData, req.file)

        res.json(result)
        
    }

    async getEmployeeFacilities(req: express.Request, res: express.Response){
        
        const organizationId = req.params.organizationId as string

        const result = await new EmployeeService().getEmployeeFacilities(organizationId)

        res.json(result)
        
    }

    async createFacility(req: express.Request, res: express.Response){
       
        const data = req.body

        const result = await new EmployeeService().createFacility(data)

        res.json(result)
        
    }

    async updateFacility(req: express.Request, res: express.Response){
        
        const id = req.params.id as string
        const result = await new EmployeeService().updateFacility(id, req.body)

        res.json(result)
        
    }

    async getEmployeeSchedule(req: express.Request, res: express.Response){
       
        const organizationId = req.params.organizationId as string

        const result = await new EmployeeService().getEmployeeSchedule(organizationId)

        res.json(result)
        
    }

    async markReservationAttended(req: express.Request, res: express.Response){
      
        const id = req.params.id as string
        const employeeId = req.body.employeeId

        const result = await new EmployeeService().markReservationAttended(id, employeeId)

        res.json(result)
        
    }

    async markReservationNoShow(req: express.Request, res: express.Response){
    
        const id = req.params.id as string
        const employeeId = req.body.employeeId

        const result = await new EmployeeService().markReservationNoShow(id, employeeId)

        res.json(result)
        
    }

    async markTrainingAttended(req: express.Request, res: express.Response){
        
        const id = req.params.id as string

        const result = await new EmployeeService().markTrainingAttended(id)

        res.json(result)
        
    }

    async markTrainingNoShow(req: express.Request, res: express.Response){
        
        const id = req.params.id as string

        const result = await new EmployeeService().markTrainingNoShow(id)

        res.json(result)
    }

    async getPromotionsForFacility(req: express.Request, res: express.Response){
        const id = req.params.facilityId as string

        const result = await new EmployeeService().getPromotionsForFacility(id)
        res.json(result)
    }

    async createPromotion(req: express.Request, res: express.Response){
        const result = await new EmployeeService().createPromotion(req.body)
        res.json(result)
    }

    async updatePromotion(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new EmployeeService().updatePromotion(id, req.body)
        res.json(result)
    }

    async getEquipmentForFacility(req: express.Request, res: express.Response){
        const id = req.params.facilityId as string
        const result = await new EmployeeService().getEquipmentForFacility(id)
        res.json(result)
    }

    async createEquipment(req: express.Request, res: express.Response){
        // Slika opreme se uploaduje pre ulaska u controller, pa se ovde formira URL koji ide u bazu.
        const data = {
            ...req.body,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            active: req.body.active === "true",
            imageUrl: req.file ? "/uploads/equipment" + req.file.fieldname : ""
        }

        const result = await new EmployeeService().createEquipment(data)
        res.json(result)
    }

    async updateEquipment(req: express.Request, res: express.Response){
        const id = req.params.id as string
        
        const data = {
            ...req.body,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            active: req.body.active === "true"
        }

        if(req.file){
            // Ako je poslata nova slika, prepisujemo postojeci imageUrl novim uploadovanim fajlom.
            data.imageUrl = "uploads/equipment" + req.file.fieldname
        }
        const result = await new EmployeeService().updateEquipment(id, data)
        res.json(result)
    }

    async getOrdersForFacility(req: express.Request, res: express.Response){
        const id = req.params.facilityId as string
        const result = await new EmployeeService().getOrdersForFacility(id)
        res.json(result)
    }

    async updateOrderStatus(req: express.Request, res: express.Response){
        const id = req.params.id as string
        const result = await new EmployeeService().updateOrderStatus(id, req.body.status)
        res.json(result)
    }

    async generateOccupancyReport(req: express.Request, res: express.Response){
        const id = req.params.facilityId as string
        
        const result = await new EmployeeService().generateOccupancyReport(id, Number(req.params.year), Number(req.params.month))

        if(result.status !== 200 || !result.pdfBuffer){
            return res.json(result)
        }

        // Za PDF odgovore controller ne vraca JSON, nego postavlja header-e za preuzimanje fajla.
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=occupancy-report-${req.params.year}-${req.params.month}.pdf`
        )

        res.send(result.pdfBuffer)
    }

    async generateEquipmentReport(req: express.Request, res: express.Response) {
        const id = req.params.facilityId as string
        
        const result = await new EmployeeService().generateEquipmentReport(
            id,
            Number(req.params.year),
            Number(req.params.month)
        )

        if (result.status !== 200 || !result.pdfBuffer) {
            return res.json(result)
        }

        // Isti princip kao kod izvestaja popunjenosti: browser dobija PDF attachment.
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=equipment-report-${req.params.year}-${req.params.month}.pdf`
        )

        res.send(result.pdfBuffer)
    }

    async getCalendarEvents(req: express.Request, res: express.Response){
        // Front salje resurs i opseg datuma, a servis spaja rezervacije i treninge u jedan kalendar.
        const id = req.params.resourceId as string
        const from = req.params.startDate as string
        const to = req.params.endDate as string

        const result = await new EmployeeService().getCalendarEvents(id, from, to)

        res.json(result)
    }

}
