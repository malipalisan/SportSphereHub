import { Facility } from "./facility"
import { Resources } from "./resources"
import { Sport } from "./sport"
import { Trainer } from "./trainer"

export class TrainingSession {
    _id: string = ""

    athleteId: string = ""
    trainerId: Trainer = new Trainer()
    facilityId: Facility = new Facility()
    resourceId: Resources = new Resources()
    sportId: Sport = new Sport()

    startAt: Date = new Date()
    endAt: Date = new Date()

    totalPrice: number = 0

    status: "scheduled" | "attended" | "no_show" | "cancelled" = "scheduled"

}
