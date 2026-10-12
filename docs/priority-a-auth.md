# Prioritet A.1 - Auth, registracija i admin odobrenja

Ovo je prva celina koju treba da kucas. Ne diraj jos rezervacije i ostale module osim koliko treba za registraciju zaposlenog.

## Backend struktura

Predlozeni folderi u `backend_Node/src`:

- `models`: Mongoose modeli `User`, `Organization`, `PasswordResetToken`, `Sport`.
- `controllers`: tanki sloj koji cita `req`, poziva service i vraca JSON.
- `services`: poslovna logika za registraciju, login, approve/reject i reset password-a.
- `routes`: Express ruteri za `/api/auth`, `/api/admin`, `/api/sports`.
- `middleware`: `authMiddleware`, `roleGuard`, `errorHandler`.
- `validators`: funkcije za password, email, MB, PIB, required polja.
- `uploads`: `multer` konfiguracija za profilne slike.

## Modeli za ovu celinu

`User`:

- `role`: `athlete | employee | admin`
- `status`: `pending | approved | rejected | blocked`
- `username`, `email`, `passwordHash`, `firstName`, `lastName`, `phone`
- `avatarUrl`, `favoriteSportIds`
- `organizationId` samo za employee
- `penalties`: niz `{ facilityId, noShows, blockedUntil? }`

`Organization`:

- `name`, `headquartersAddress`, `registrationNumber`, `taxId`
- `employeeIds`
- validacija: MB tacno 8 cifara, PIB tacno 9 cifara i ne pocinje nulom

`PasswordResetToken`:

- `userId`, `tokenHash`, `expiresAt`, `usedAt`

`Sport`:

- `name`, `active`

## Auth rute

`POST /api/auth/register`

- Prima `multipart/form-data` zbog profilne slike.
- Za sportistu cuva osnovne podatke i `favoriteSportIds`.
- Za zaposlenog dodatno kreira ili povezuje `Organization`.
- Novi korisnik dobija `status: "pending"`.
- Ako slika nije poslata, koristi default avatar URL.

`POST /api/auth/login`

- Prima `usernameOrEmail`, `password`.
- Dozvoli login samo za `status: "approved"` i role `athlete | employee`.
- Vraca JWT i osnovne podatke korisnika.

`POST /api/auth/admin-login`

- Isto kao login, ali prihvata samo `role: "admin"`.
- Ruta nije linkovana sa javne pocetne strane.

`POST /api/auth/forgot-password`

- Prima `usernameOrEmail`.
- Kreira random token, u bazu upisuje hash tokena i `expiresAt = now + 30min`.
- Za odbranu mozes vratiti `resetLink` u JSON odgovoru umesto slanja maila.

`POST /api/auth/reset-password`

- Prima `token`, `newPassword`.
- Proverava regex za password, token hash, rok trajanja i `usedAt`.
- Upisuje novi `passwordHash` i oznacava token kao iskoriscen.

## Admin rute za odobrenja

Sve admin rute koriste `authMiddleware` + `roleGuard("admin")`.

- `GET /api/admin/registration-requests`
- `PATCH /api/admin/users/:id/approve`
- `PATCH /api/admin/users/:id/reject`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

Kod approve zaposlenog proveri da organizacija nema vise od 2 odobrena zaposlena. Ako bi odobrenje napravilo treceg zaposlenog za isti objekat/organizaciju, vrati 400.

## Minimalni frontend za ovu celinu

Stranice:

- `LoginPage`: sportista/zaposleni login.
- `AdminLoginPage`: skrivena ruta, npr. `/hidden-admin-login`.
- `RegisterPage`: role switch `athlete/employee`, upload slike, avatar generator, izbor do 5 sportova.
- `ForgotPasswordPage` i `ResetPasswordPage`.
- `AdminRequestsPage`: tabela pending zahteva sa approve/reject.

Servisi:

- `AuthService`: login, adminLogin, register, forgot/reset, logout, currentUser.
- `AdminService`: pending requests, approve/reject.
- `SportsService`: lista aktivnih sportova za dropdown.

Guard-ovi:

- `authGuard`: proverava token.
- `roleGuard`: proverava role iz sacuvanog user payload-a.

## Validacije koje odmah pokrivaju poene

- username i email unique.
- password regex: 8-12 karaktera, pocinje slovom, bar jedno veliko slovo, broj i specijalni karakter.
- employee: MB tacno 8 cifara, PIB tacno 9 cifara i ne pocinje nulom.
- max 5 omiljenih sportova.
- profilna slika samo upload/avatar, bez eksternog linka.
- admin mora odobriti nalog pre login-a.

