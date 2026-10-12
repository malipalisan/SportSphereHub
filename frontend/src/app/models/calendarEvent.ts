export class CalendarEvent {
  _id: string = ""
  type: "reservation" | "training" = "reservation"
  title: "Rezervacija" | "Trening" = "Rezervacija"
  startAt: string = ""
  endAt: string = ""
  status: string = ""
  facilityId: string = ""
  resourceId: string = ""
  sportId: string =  ""
}
