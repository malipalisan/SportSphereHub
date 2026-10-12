export class Order {
    _id: string = "";
    athleteId: string = "";
    facilityId: string = "";

    items: {
        equipmentId: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }[] = [];

    totalPrice: number = 0;
    status: "ordered" | "accepted" | "picked_up" | "cancelled" = "ordered";

    createdAt: string = "";
    updatedAt: string = "";
}
