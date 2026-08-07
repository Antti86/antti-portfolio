# Tietokantasuunnitelma

**Status:** Draft
**Alkuperäinen suunnitelma:** [database-diagram.png](./database-diagram.png)
**Nykyisen skeeman lähde:** [`infra/sql/schema.sql`](../../infra/sql/schema.sql)

**Hyväksytty V1-rajaus:** [V1-rajaus](../product/v1-scope.md)

## Tarkoitus ja rajaus

Tämä dokumentti tekee alkuperäisestä tietokantakaaviosta tekstimuotoisen ja vertaa sitä nykyiseen PostgreSQL-skeemaan. Kaavio kuvaa alkuperäistä suunnitelmaa. `infra/sql/schema.sql` kuvaa repositorion nykyistä toteutettavaa skeemaa ja on skeeman source of truth.

Vertailu on staattinen: tietokantaa ei ole käynnistetty eikä skeemaa ole tässä tehtävässä muutettu.

## Alkuperäisen kaavion tietomalli

Kaaviossa on viisi ydintaulua ja kolme monesta moneen -liitostaulua:

- **School:** oppilaitos sekä alku- ja loppupäivä, tila ja keskiarvo.
- **Course:** kurssi, päivämäärät, oppilaitos, tila, arvosana ja mahdollinen päiväkirja.
- **Project:** projekti, päivämäärät, mahdollinen oppilaitos, tila, kuvaus ja mahdollinen päiväkirja.
- **Diary:** oppimispäiväkirjan nimi, otsikko, yksilöllinen slug ja luontipäivä.
- **Tech:** yksilöllisesti nimetty teknologia.
- **Course_Project:** kurssin ja projektin liitos sekä suhteen tyyppi ja muistiinpano.
- **Kurssi_Tech:** kurssin ja teknologian liitos sekä painotus ja muistiinpano.
- **Project_Tech:** projektin ja teknologian liitos sekä käyttöalue ja muistiinpano.

Kaavion liitostaulujen kahden vierasavaimen yhdistelmä toimii yhdistelmäavaimena. Course liittyy pakolliseen School-tietueeseen. Course ja Project voivat liittyä Diary-tietueeseen, ja Project voi liittyä School-tietueeseen.

## Nykyinen SQL-skeema

Nykyisessä skeemassa ovat taulut:

- `school`
- `diary`
- `tech`
- `course`
- `project`
- `course_projects`
- `project_tech`
- `course_tech`

Rakenne vastaa kaavion ydinsuhteita. SQL-skeema määrittää lisäksi identity-pääavaimet, viite-eheyden poistokäyttäytymisen, tarkistusrajoitteita, yksilöllisyysrajoitteita ja indeksejä.

## Kaavion ja SQL-skeeman erot

### Nimeäminen

| Kaavio | SQL-skeema | Havainto |
|---|---|---|
| `Course_Project` | `course_projects` | SQL käyttää lowercase-monikkoa. |
| `Kurssi_Tech` | `course_tech` | SQL käyttää englanninkielistä lowercase-nimeä. |
| `Project_Tech` | `project_tech` | Ero on kirjainkoossa ja nimeämistyylissä. |
| `Created` | `created_at` | SQL ilmaisee myös aikaleiman luonteen nimessä. |

### Kenttätyypit ja pituudet

| Kohde | Kaavio | SQL-skeema |
|---|---|---|
| School.name | `VARCHAR(30)` | `VARCHAR(100)` |
| Course.name | `VARCHAR(30)` | `VARCHAR(120)` |
| Project.name | `VARCHAR(30)` | `VARCHAR(120)` |
| Project.description | `VARCHAR(100)` | `TEXT` |
| Diary.name | `VARCHAR(30)` | `VARCHAR(100)` |
| Diary.title | `VARCHAR(30)` | `VARCHAR(200)` |
| Diary.slug | `VARCHAR(50)` | `VARCHAR(120)` |
| Diary.Created / created_at | `DATE` | `TIMESTAMP` |
| Tech.name | `VARCHAR(30)` | `VARCHAR(60)` |
| Course_Project.note | `VARCHAR(100)` | `TEXT` |
| Kurssi_Tech.emphasis | `VARCHAR(50)` | `VARCHAR(30)` |
| Kurssi_Tech.note | `VARCHAR(100)` | `TEXT` |
| Project_Tech.note | `VARCHAR(100)` | `TEXT` |
| School.avg_grade | `DECIMAL` ilman tarkkuutta | `NUMERIC(3,2)` |

### Null-arvot ja oletusarvot

- Kaaviossa `School.start_date` ja `School.status` on merkitty pakollisiksi; SQL-skeemassa ne sallivat `NULL`-arvon.
- Kaaviossa `Course.start_date` ei ole merkitty pakolliseksi; SQL-skeemassa se on `NOT NULL`.
- Kaaviossa `Diary.title` ja `Diary.Created` eivät ole merkitty pakollisiksi; SQL-skeemassa `title` ja `created_at` ovat `NOT NULL`.
- SQL-skeema antaa `diary.created_at`-kentälle oletusarvon `NOW()`; kaavio ei määritä oletusarvoa.
- Projectin vapaaehtoiset `school_id`- ja `diary_id`-suhteet sekä Coursen vapaaehtoinen `diary_id` vastaavat kaaviota.
- Coursen pakollinen `school_id` vastaa kaaviota.

### SQL-skeemassa olevat lisärajoitteet

Kaavio ei esitä seuraavia SQL-skeeman yksityiskohtia:

- identity-generointi pääavaimille
- `school.name`- ja `diary.name`-kenttien yksilöllisyys
- päivämäärien järjestyksen tarkistus School-, Course- ja Project-tauluissa
- `school.avg_grade`-arvon rajaaminen välille 0–5
- Course- ja Project-statusarvojen rajaaminen arvoihin `planned`, `in_progress` ja `completed`
- `project_tech.usage_area`-arvojen sallittu joukko
- `course_tech.emphasis`-arvojen sallittu joukko
- vierasavainten `ON DELETE CASCADE`, `SET NULL` ja `RESTRICT` -käyttäytyminen
- vierasavainhakujen lisäindeksit

Nämä ovat havaittuja eroja, eivät tämän dokumentointitehtävän muutosehdotuksia.

## Suunnitelma ja nykyinen toteutus

### Alkuperäinen suunnitelma

PNG-kaavio ilmaisee taulujen perusrakenteen, pää- ja vierasavaimet sekä keskeiset kentät. Sen status on Draft, koska hyväksyntätilaa ei ole ilmoitettu ja se poikkeaa nykyisestä skeemasta.

### Nykyinen toteutus

`infra/sql/schema.sql` on nykyinen koneellisesti suoritettava skeema. Backendin SQL-kyselyt käyttävät sen lowercase-taulu- ja sarakenimiä. Skeeman toimivuutta ei varmennettu tässä tehtävässä käynnissä olevaa PostgreSQL-instanssia vasten.

## Tuotesuunnitelman ja tietomallin väliset avoimet kohdat

- Sivustosuunnitelma mainitsee kurssien opintopisteet, mutta kaaviossa ja SQL-skeemassa ei ole niitä vastaavaa kenttää.
- GitHub-linkki on Approved V1 -vaatimus, mutta kaaviossa ja SQL-skeemassa ei ole sitä vastaavaa kenttää. Backend- ja tietokantatuki on erillinen tuleva tehtävä. Live demo -linkit eivät kuulu V1:een.
- Mahdollisille projektitageille tai suodatuksen kategorioille ei ole kuvattu tietomallia.
- Kaavio ja SQL tallentavat vain oppimispäiväkirjan metatietoja; varsinaisen sisällön sijainti ja yhteys metatietoon eivät ilmene näistä lähteistä.
- CV:lle, yhteydenotoille ja statistiikalle ei ole kuvattu tietokantatauluja. Dokumentit eivät ratkaise, tarvitsevatko nämä tietokantaa.

## Avoimet kysymykset

- Onko tarkoitus päivittää visuaalinen kaavio vastaamaan SQL-skeemaa vai säilyttää se historiallisena suunnitelmana?
- Ovatko SQL-skeeman nykyiset null-säännöt ja kenttäpituudet tarkoituksellisia lopullisia valintoja?
- Yhtenäistetäänkö liitostaulujen nimet dokumentaatiossa SQL-skeeman nimien mukaisiksi?
- Tarvitaanko opintopisteille tai projektitageille V1:n jälkeen tietomalli, vai hallitaanko ne muualla?
- Mikä on GitHub-linkin lopullinen tietokanta- ja API-sopimus tulevassa backend-tehtävässä?
- Missä oppimispäiväkirjan varsinainen sisältö säilytetään?
