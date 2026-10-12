import { Facility } from "./facility"

export class Promotions{
  _id: string = ""
  facilityId: Facility = new Facility()
  sportId: string = ""
  title: string = ""
  validFrom: Date = new Date()
  validTo: Date = new Date()
  discountType: string = ""
  discountValue: number = 0
  active: boolean = true
}
