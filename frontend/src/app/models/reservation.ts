import { Facility } from "./facility"
import { Resources } from "./resources"
import { Sport } from "./sport"

export class Reservation {
    _id: string = ""

    athleteId: string = ""
    facilityId: Facility = new Facility()
    resourceId: Resources = new Resources()
    sportId: Sport = new Sport()

    startAt: Date = new Date()
    endAt: Date = new Date()

    totalPrice: number = 0

    status: "reserved" | "attended" | "no_show" | "cancelled" = "reserved"

    attendanceMarkedBy?: string

    createdAt?: Date
    updatedAt?: Date
}
