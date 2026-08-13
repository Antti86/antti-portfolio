# V1-rajaus

**Status:** Approved

## Tarkoitus

Tämä dokumentti määrittää ensimmäisen frontend-version hyväksytyn rajauksen ja informaatioarkkitehtuurin. Se on tavoiteltua V1-toteutusta koskevissa ristiriidoissa ensisijainen Draft-tuotedokumentteihin nähden. Dokumentti ei tarkoita, että frontend tai sen tarvitsemat backend-muutokset olisi jo toteutettu.

## Sovellusrakenne

V1 toteutetaan Reactilla reititettynä single-page applicationina (SPA).

Päänavigaatio sisältää:

- Home
- About
- Projects
- Education
- Contact

Reittien URL-polkuja tai muita reitityksen yksityiskohtia ei ole vielä päätetty.

## Home

Home sisältää:

- lyhyen esittelyn
- featured projects -osion
- skills-yhteenvedon
- education-yhteenvedon
- CV-linkin tai -painikkeen

## About

About sisältää:

- tarkemman henkilöesittelyn
- alanvaihdon ja taustan
- työkokemuksen
- osaamisen

Web-muotoinen CV-sisältö voidaan näyttää About-sivulla. PDF-CV voidaan linkittää, kun tiedosto on saatavilla. PDF:n puuttuminen ei estä frontend-rungon rakentamista.

## Projects

Projects sisältää:

- projektien listauksen
- projektien technologies-tiedot
- GitHub-linkin

Projektikohtainen details-näkymä toteutetaan myöhemmin. Sen reittiä ja tarkkaa sisältöä ei ole vielä päätetty.

GitHub-linkki on V1-vaatimus. Sen tietokanta- ja API-tuki on toteutettu `github_url`-kentällä. Kenttä voi olla `null`; muussa tapauksessa backend hyväksyy kanonisen GitHub-repository-URL:n muodossa `https://github.com/<owner>/<repository>` ja normalisoi mahdollisen loppukauttaviivan pois. Kenttä palautetaan projektien listaus-, yksittäis- ja details-vastauksissa sekä POST- ja PUT-vastauksissa. Frontend näyttää linkin vain, kun `github_url` ei ole `null`.

Frontendia ja Projects-näkymän GitHub-linkin käyttöä ei ole vielä toteutettu.

## Education

Education sisältää:

- opinnot ja kurssit
- ryhmittelyn oppilaitoksen mukaan
- kurssien tilan

V1 käyttää yksinkertaista listaa tai kortteja. Tarkka esitystapa voidaan valita frontend-toteutuksen yhteydessä. Opintopisteiden puuttuminen nykyisestä tietomallista ei estä V1:tä, eivätkä opintopisteet ole V1-näkymän vaatimus.

## Skills

Skills ei ole oma pääreitti. Osaamista näytetään:

- yhteenvetona Homessa
- tarkemmin Aboutissa
- projektien yhteydessä

## Contact

Contact sisältää V1:ssä:

- sähköpostin
- GitHub-linkin

## V1:n ulkopuolella

Seuraavat eivät kuulu V1:een:

- yhteydenottolomake
- LinkedIn
- Statistiikka
- erillinen Oppimispäiväkirjat-näkymä
- projektitagit ja suodatus
- live demo -linkit
- lopullinen logosuunnittelu
- lopullinen värisuunnittelu
- lopullinen fonttisuunnittelu
- lopullinen footer-suunnittelu

## Riippuvuudet ja jatkotehtävät

- Projektin GitHub-URL:n tietokanta- ja API-tuki on toteutettu. Projects-näkymän pitää vielä käyttää `github_url`-kenttää edellä kuvatulla tavalla.
- About- ja Contact-näkymät tarvitsevat julkaistavan henkilö-, työ- ja yhteystietosisällön.
- PDF-CV on valinnainen ja voidaan lisätä tiedoston valmistuttua.

## Jäljellä olevat avoimet kysymykset

- Mitä URL-polkuja viisi hyväksyttyä pääreittiä käyttävät?
- Mitkä projektit nostetaan Home-sivulle ja miten ne valitaan?
- Esitetäänkö Education listana vai kortteina?
- Missä henkilö-, työhistoria- ja yhteystietosisältöä ylläpidetään?
- Mikä on myöhemmin toteutettavan projektikohtaisen details-näkymän reitti ja tarkka sisältö?
