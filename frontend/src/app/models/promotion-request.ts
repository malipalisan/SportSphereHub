export class PromotionRequest {
  _id: string = "";
  facilityId: string = "";
  sportId: string = "";
  title: string = "";
  validFrom: string = "";
  validTo: string = "";
  discountType: "percent" | "fixed" = "percent";
  discountValue: number = 0;
  active: boolean = true;
}
