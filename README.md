# AniMap

AniMap is an anime location pinboard application. It allows users to register, authenticate, and create geo-tagged pins that combine real-world locations with anime references and images.

## Projekti eesmärk

Eesmärk on pakkuda animehuvilistele veebipõhist rakendust, kus saab salvestada ja jagada anime-teemalisi asukohapunkte ning vaadata populaarsemaid animeid ja piirkondi.

## Kasutatud tehnoloogiad

- Backend: Node.js, Express
- Andmebaas: MySQL (development/prod), SQLite testimiseks
- ORM: Sequelize
- Autentimine: JWT + küpsised
- Failihaldus: `multer`, Base64-pildi salvestus serverisse
- Dokumentatsioon: Swagger / OpenAPI
- Testimine: Jest, Supertest
- Keskkonna muutujad: dotenv
- Frontend: Vite, React
- Täiendavad paketid: `bcryptjs`, `cookie-parser`, `cors`, `country-reverse-geocoding`, `countries-list`, `iso-3166-1`

## Arhitektuur: MVC projekti kontekstis

AniMap backend järgib MVC printsiipi:

- **Model**: `backend/models/` sisaldab Sequelize andmemudeleid (`User`, `Pin`, `Region`). Need kirjeldavad andmebaasi tabelite struktuuri ja assotsiatsioone.
- **View**: API vastused JSON-formaadis ning frontend rakenduse komponendid (`frontend/src/...`) kuvavad need andmed kasutajale.
- **Controller**: `backend/controllers/` tegelevad sissetulevate päringute loogikaga, valideerivad andmed ja loovad vastuseid.

`backend/routes/` kaardistab URL-id controller-funktsioonidele, seega vastab see vahel autotee (route) ja kontrollija vahelisele kihistusele.

## ORM-i kasutus ja andmemudel

Sequelize ORM haldab andmebaasi struktuuri ja päringuid JavaScripti tasandil. Mudelid on defineeritud `backend/models/` kaustas.

Peamised mudelid:

- `User`:
  - `id`, `username`, `email`, `password_hash`, `createdAt`, `updatedAt`
- `Pin`:
  - `id`, `title`, `description`, `realImageUrl`, `animeImageUrl`, `animeName`, `latitude`, `longitude`, `userId`, `regionId`, `createdAt`, `updatedAt`
- `Region`:
  - `id`, `name`, `createdAt`, `updatedAt`

### Andmemudeli diagramm

```mermaid
classDiagram
    User <|-- Pin : owns
    Region <|-- Pin : contains

    class User {
      int id
      string username
      string email
      string password_hash
      datetime createdAt
      datetime updatedAt
    }

    class Pin {
      int id
      string title
      string description
      string realImageUrl
      string animeImageUrl
      string animeName
      float latitude
      float longitude
      int userId
      int regionId
      datetime createdAt
      datetime updatedAt
    }

    class Region {
      int id
      string name
      datetime createdAt
      datetime updatedAt
    }
```

## Käivitusjuhend

### Eeldused

- Node.js
- npm
- MySQL või Docker Compose
- Frontend: Vite

### Backend käivitamine

```bash
cd backend
npm install
cp .env.example .env
npm run test
node server.js
```

Kui kasutate Docker Compose'i, siis root-kataloogist:

```bash
sudo docker compose up -d
```

### Frontend käivitamine

```bash
cd frontend
npm install
npm run dev
```

### Andmebaasi migratsioonid ja seederid

```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed
```

## .env.example selgitus

Backendis asub `.env.example` fail `backend/.env.example`. See näitab vajalikke keskkonnamuutujaid:

- `DB_USER`: andmebaasi kasutajanimi
- `DB_PASS`: andmebaasi parool
- `DB_NAME`: andmebaasi nimi
- `JWT_SECRET`: JSON Web Tokeni saladus

Frontendis on `frontend/.env.example`, mis näitab vajalikku Mapboxi tokeni kujul `VITE_MAPBOX_TOKEN`.

## Swagger / API dokumentatsioon

Swagger UI on saadaval pärast backendi käivitamist aadressil:

- http://animapbackend.eu-north-1.elasticbeanstalk.com/api-docs/

See dokumentatsioon kirjeldab peamised endpointid, HTTP meetodid, päringu keha näited, vastuste näited ja veakoodid.

## Testide käivitamise juhend

Backend testimiseks:

```bash
cd backend
npm run test
```

### Unit testid

Unit-testid kontrollivad erapooletult backendkontrollerite ja äriloogika õigsust. Need kasutavad Jest-i ja asendavad välised sõltuvused päris implementatsioonidega mockidega, mistõttu nad ei sõltu andmebaasist, võrgust ega autentimiskomponentidest.

Näited ja põhimõtted:

- `backend/tests/auth/auth.unit.test.js`
  - kontrollib `auth.controller` register-, login- ja logout-loogikat
  - testib paroolide kokkulangevust, duplikaatkasutaja tuvastamist ja JWT tokeni loomist
  - mockib `User` Sequelize mudelit, `bcryptjs`-i ja `jsonwebtoken`-i
- `backend/tests/pin/pin.unit.test.js`
  - kontrollib `pin.controller` pin`i loomise, päringute ja uuenduste äriloogikat
  - testib eelduste valideerimist, pildi salvestamise ja geograafilise regiooni määramist
  - mockib `Pin`, `Region`, failisüsteemi ja kolmandate osapoolte abiteenuseid

### Integratsioonitestid

Integratsioonitestid käivitavad tegeliku Expressi rakenduse ning teevad selle vastu päringuid `supertest`-iga. Need testid kinnitavad, et kogu rakenduse virn töötab koos: route'id, keskkonnamuutujad, middleware'id, auth-kupsised ja andmebaasiread.

Näited ja kontrollpunktid:

- `backend/tests/auth/auth.integration.test.js`
  - testib kasutaja registreerimise, sisselogimise, autentimise ja väljalogimise voogu
  - kontrollib, et JWT token salvestatakse küpsisesse ja et autentitud endpointid (/api/auth/me, /api/auth/health) töötavad
  - testib, et väljalogimine eemaldab juurdepääsu ja tagab 401 vastuse ilma tokenita
- `backend/tests/pin/pin.integration.test.js`
  - testib pin`ide loomise ja pärimise terviklikku voogu
  - kontrollib, et pins luuakse andmebaasi, et tagasiside on õige ja et vigu käsitletakse sobivate staatusekoodidega

## Meeskonnaliikmed ja tööjaotus

- **Olha** - projekti arendus, backend API, testid, React kasutajaliidese arendus, README, Swagger.
- **Sander** - projekti arendus, backend API, testid, ORM mudelid, auth-lahendus.

## Lisainfo

- Backend API asub `backend/`
- Frontend rakendus asub `frontend/`
- Swagger dokumentatsioon on integreeritud backendi failis `backend/app.js`
- Andmebaasi mudelid asuvad `backend/models/`