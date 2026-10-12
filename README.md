# SportSphere Hub

SportSphere Hub je veb aplikacija koja povezuje sportiste i sportske organizacije. Omogućava pretragu sportskih objekata, rezervaciju termina, prijavu na treninge, pronalaženje saigrača i poručivanje sportske opreme. Zaposleni upravljaju ponudom svojih organizacija, dok administrator obrađuje zahteve i upravlja korisnicima.

Projekat je razvijen u okviru predmeta Programiranje internet aplikacija (PIA).

## Funkcionalnosti

| Uloga | Mogućnosti |
| --- | --- |
| Sportista | Pretraga objekata, pregled raspoloživih termina, rezervacije i otkazivanje, reakcije i komentari na objekte, prijava na treninge, oglasi za saigrače, poručivanje opreme i uređivanje profila. |
| Zaposleni | Dodavanje i uređivanje objekata, pregled rasporeda, evidencija dolazaka i izostanaka, upravljanje promocijama, opremom i porudžbinama, preuzimanje mesečnih PDF izveštaja o popunjenosti i opremi. |
| Administrator | Odobravanje i odbijanje registracija i objekata, pregled i uređivanje korisnika, brisanje korisnika, deaktivacija trenera i dodavanje sportova. |

Registracija podržava profilne slike i generisanje avatara. Novi korisnici čekaju odobrenje administratora. Dostupni su i zahtev za resetovanje lozinke i postavljanje nove lozinke putem vremenski ograničenog linka.

## Tehnologije

- **Frontend:** Angular 20, TypeScript, RxJS, HTML i CSS.
- **Backend:** Node.js, Express 5 i TypeScript.
- **Baza podataka:** MongoDB i Mongoose.
- **Dodatne biblioteke:** bcryptjs za heširanje lozinki, Multer za upload slika, PDFKit za izveštaje i DiceBear za avatare.

Frontend komunicira sa backendom preko HTTP API-ja. Backend je organizovan u rutere, kontrolere, servise, modele i validatore.

## Struktura projekta

```text
SportSphere Hub/
├── frontend/
│   ├── src/app/             # Angular komponente, servisi i modeli
│   ├── public/              # Statički fajlovi frontenda
│   └── package.json
├── backend_Node/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── uploads/         # Konfiguracija za upload
│   │   └── validators/
│   ├── uploads/             # Profilne slike i slike opreme
│   └── package.json
├── database/
│   ├── collections/         # Demo podaci u MongoDB Extended JSON formatu
│   └── indexes.js           # Indeksi baze podataka
├── docs/                   # Dodatne beleške o projektu
├── jsonFiles/              # Pomoćni JSON fajlovi
├── .gitignore
└── README.md
```

## Preduslovi

- Node.js **22.12.0 ili noviji iz grane 22.x**, sa npm-om. Ova grana odgovara zahtevima Angulara i MongoDB drajvera iz projekta.
- Lokalno instaliran i pokrenut MongoDB server na portu `27017`.
- MongoDB Database Tools, koji sadrži komandu `mongoimport`.
- MongoDB Shell (`mongosh`) za kreiranje indeksa.

Komande `node`, `npm`, `mongoimport` i `mongosh` treba da budu dostupne u terminalu. Uputstvo ispod koristi PowerShell, koji možeš otvoriti u VS Code-u.

## Lokalno pokretanje

Preuzmi ili kloniraj repozitorijum, otvori glavni folder projekta u VS Code-u i pokreni terminal iz tog foldera.

### 1. Instalacija zavisnosti

```powershell
cd frontend
npm ci

cd ../backend_Node
npm ci
npm install --save-dev typescript@~5.9.2

cd ..
```

Backend koristi komandu `tsc` za build, ali TypeScript trenutno nije naveden u njegovom `package.json`. Zato je dodatna instalacija kompajlera uključena u ovaj korak; ona ažurira backendove `package.json` i `package-lock.json`. Globalna instalacija Angular CLI-ja nije potrebna.

### 2. Priprema demo baze

Pokreni lokalni MongoDB server. Backend se trenutno povezuje na:

```text
mongodb://localhost:27017/baza
```

**Komande u ovom README-u koriste bazu `baza`, u skladu sa `backend_Node/src/server.ts`.** U starijem uputstvu `database/README.md` navodi se naziv `sportsphere_hub`. Ako izabereš taj naziv, moraš da promeniš i konekciju u backendu.

Iz glavnog foldera projekta pokreni sledeći PowerShell blok. Opcija `--drop` briše postojeću kolekciju pre uvoza, pa ga koristi samo za pripremu ili resetovanje lokalne demo baze.

```powershell
$collections = @(
    "sports",
    "organizations",
    "users",
    "facilities",
    "resources",
    "reservations",
    "promotions",
    "trainers",
    "trainingSessions",
    "equipment",
    "orders",
    "teammateAds",
    "reactions",
    "facilityReviews",
    "passwordResetTokens"
)

foreach ($collection in $collections) {
    mongoimport --uri "mongodb://localhost:27017/baza" --collection $collection --file "database/collections/$collection.json" --jsonArray --drop
    if ($LASTEXITCODE -ne 0) {
        throw "Uvoz kolekcije $collection nije uspeo."
    }
}

mongosh "mongodb://localhost:27017/baza" --file database/indexes.js
```

Opcionalno, dodatne rezervacije za demonstraciju kalendara i izveštaja možeš uvesti u istu kolekciju `reservations`:

```powershell
mongoimport --uri "mongodb://localhost:27017/baza" --collection reservations --file database/collections/additional-reservations.json --jsonArray --mode=upsert
```

Demo podaci sadrže fiksne datume. Za pregled postojećih rezervacija i izveštaja izaberi period koji odgovara datumima u JSON fajlovima. Za buduće termine možeš kreirati nove rezervacije kroz aplikaciju ili prilagoditi demo podatke.

### 3. Pokretanje backenda

U terminalu iz glavnog foldera projekta:

```powershell
cd backend_Node
New-Item -ItemType Directory -Force -Path uploads, uploads/equipment | Out-Null
npm run build
npm start
```

Backend sluša na `http://localhost:4000`. Pri uspešnom povezivanju sa bazom ispisuje `DB connected`.

Backend pokreći iz foldera `backend_Node`, jer su putanje za upload slika relativne u odnosu na radni folder. Nakon izmena backend koda ponovo izvrši `npm run build` i restartuj server.

### 4. Pokretanje frontenda

Otvori drugi terminal u glavnom folderu projekta:

```powershell
cd frontend
npm start
```

Otvori aplikaciju na [http://localhost:4200](http://localhost:4200). Backend i MongoDB treba da ostanu pokrenuti tokom korišćenja aplikacije.

## Demo nalozi

Posle uvoza `database/collections/users.json`, možeš koristiti sledeće odobrene naloge:

| Uloga | Korisničko ime | Lozinka | Stranica za prijavu |
| --- | --- | --- | --- |
| Administrator | `admin` | `Demopass1!` | `/admin-login` |
| Sportista | `marko` | `Demopass1!` | `/login` |
| Sportista | `ana` | `Demopass1!` | `/login` |
| Zaposleni | `milos` | `Demopass1!` | `/login` |
| Zaposleni | `jelena` | `Demopass1!` | `/login` |

Nalozi `ivana_pending` i `dejan_pending` služe za demonstraciju odobravanja registracije i ne mogu da se prijave pre odobrenja administratora. Demo kredencijali namenjeni su lokalnom isprobavanju aplikacije.

U demo toku resetovanja lozinke link se prikazuje u aplikaciji, umesto slanja email poruke.

## Slike za demo

Profilne slike i slike opreme nalaze se u `backend_Node/uploads/`, a backend ih servira preko putanje `/uploads`.

- Sačuvaj `backend_Node/uploads/default-avatar.png`, koji koriste demo korisnici i nalozi bez otpremljene slike.
- Sačuvaj slike na koje upućuju polja `avatarUrl` i `imageUrl` u demo podacima.
- Za nove slike opreme potreban je folder `backend_Node/uploads/equipment/`; komanda u uputstvu za pokretanje kreira ga i kada je prazan.

## API celine

| Osnovna putanja | Namena |
| --- | --- |
| `/api/auth` | Registracija, prijava i resetovanje lozinke. |
| `/api/sports` | Podaci o sportovima. |
| `/api/facilities` | Pregled sportskih objekata. |
| `/api/athlete` | Profil sportiste, pretraga, rezervacije, recenzije, saigrači, treninzi i porudžbine. |
| `/api/employee` | Objekti organizacije, raspored, promocije, oprema, porudžbine i PDF izveštaji. |
| `/api/admin` | Korisnici, zahtevi, treneri i sportovi. |

API adresa `http://localhost:4000` trenutno je definisana direktno u Angular servisima u `frontend/src/app/services/`. Za drugi host ili port potrebno je uskladiti te adrese sa backendom. Konekcija sa bazom i port backenda podešeni su u `backend_Node/src/server.ts`.

## Build i testovi

| Folder | Komanda | Namena |
| --- | --- | --- |
| `frontend` | `npm run build` | Generiše frontend build u folderu `dist/`. |
| `frontend` | `npm test` | Pokreće postojeće Angular testove kroz Karma/Jasmine; potreban je Chrome. |
| `backend_Node` | `npm run build` | Kompajlira TypeScript u folder `dist/`. |
| `backend_Node` | `npm start` | Pokreće prethodno kompajliran backend. |

Backend trenutno nema definisanu `npm test` skriptu. Build frontenda i backenda izvršava se zasebno, iz odgovarajućih foldera.
