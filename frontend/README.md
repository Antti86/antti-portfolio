# Portfolio frontend

Portfolio V1:n frontend on Reactilla, Vitellä ja React Routerilla toteutettu
single-page application.

## Käyttöönotto

Asenna riippuvuudet `frontend/`-hakemistossa:

```bash
npm install
```

Käynnistä kehityspalvelin:

```bash
npm run dev
```

Luo tuotantobuild:

```bash
npm run build
```

Build tallennetaan `frontend/dist/`-hakemistoon. Buildin voi tarkistaa paikallisesti
komennolla `npm run preview`.

Lint-tarkistus suoritetaan komennolla:

```bash
npm run lint
```

## API-ympäristömuuttuja

Backendin base URL määritetään Viten ympäristömuuttujalla
`VITE_API_BASE_URL`. Kopioi tarvittaessa `.env.example` paikalliseksi
`.env.local`-tiedostoksi ja muuta arvo omaan ympäristöösi sopivaksi.

```dotenv
VITE_API_BASE_URL=http://localhost:3001/api
```

Jos muuttujaa ei aseteta, frontend käyttää tyhjää base URLia eli saman originin
osoitteita. Oikeita ympäristötiedostoja tai salaisuuksia ei tallenneta versionhallintaan.

## V1-reitit

- `/` — Home
- `/about` — About
- `/projects` — Projects
- `/education` — Education
- `/contact` — Contact
- muut reitit — Not Found

Projektikohtaista details-reittiä tai API-datan hakua ei ole vielä toteutettu.
