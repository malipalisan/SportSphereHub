import { Facility } from "./facility";
import { Resources } from "./resources";
import { Sport } from "./sport";

export class EmployeeFacilityRow{
  facility: Facility = new Facility()
  resources: Resources[] = []
  sports: Sport[] = []
}
