import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRouter from './routers/auth.router'
import sportsRouter from './routers/sports.router'
import facilityRouter from './routers/facility.router'
import adminRouter from './routers/admin.router'
import employeeRouter from './routers/employee.router'
import athleteRouter from './routers/athlete.router'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://localhost:27017/baza")
const conn = mongoose.connection
conn.once('open', ()=>{
    console.log("DB connected")
})

const router = express.Router()
app.use("/uploads", express.static("uploads"))
app.use("/api/auth", authRouter)
app.use("/api/sports", sportsRouter)
app.use("/api/facilities", facilityRouter)
app.use("/api/admin", adminRouter)
app.use("/api/employee", employeeRouter)
app.use("/api/athlete", athleteRouter)

//app.get('/', (req, res)=> {res.send("Hello world!")})
app.listen(4000, ()=>console.log("Express running on port 4000!"))