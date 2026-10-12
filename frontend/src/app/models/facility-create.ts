import { Resources } from "./resources";

export class FacilityCreate {
    organizationId: string = "";

    name: string = "";
    city: string = "";
    address: string = "";

    location = {
        lat: 0,
        lng: 0
    };

    description: string = "";
    images: string[] = [];

    sportIds: string[] = [];

    workingHours = {
        from: "",
        to: ""
    };

    defaultHourlyPrice: number = 0;
    allowedNoShows: number = 2;

    resources: Resources[] = [];
}
