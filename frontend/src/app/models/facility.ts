export class Facility{
    _id: string = "";

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

    status: string = "";

    workingHours = {
        from: "",
        to: ""
    };

    defaultHourlyPrice: number = 0;

    allowedNoShows: number = 0;

    likesCount: number = 0;

    dislikesCount: number = 0;

    createdAt: Date = new Date();

    updatedAt: Date = new Date();
}
