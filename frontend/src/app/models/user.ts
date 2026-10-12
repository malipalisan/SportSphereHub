export class User{
  _id: string = ""
  role: "athlete" | "employee" | "admin" = "athlete"
  status: "pending" | "approved" | "rejected" | "blocked" = "pending"

  username: string = ""
  email: string = ""
  firstName: string = ""
  lastName: string = ""
  phone: string = ""

  avatarUrl: string = ""
  favoriteSportIds: string[] = []

  organizationId?: string
}
