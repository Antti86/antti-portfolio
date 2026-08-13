# Projektidokumentaatio

**Status:** Implemented

Tämä hakemisto kokoaa projektin tuote- ja tietokantasuunnittelun alkuperäiset lähteet sekä niiden tekstimuotoiset Markdown-rinnakkaisversiot. Markdown-versiot helpottavat sisällön lukemista, hakemista, katselmointia ja hyödyntämistä Codexilla.

## Dokumenttihakemisto

| Dokumentti | Status | Rooli |
|---|---|---|
| [product/sitemap.md](./product/sitemap.md) | Draft | Sivukartan tekstimuotoinen rinnakkaisversio sekä nykytilan vertailu. |
| [product/sitemap.odg](./product/sitemap.odg) | Draft | Alkuperäinen visuaalinen sivukartta. Hyväksyntätilaa ei ole ilmoitettu. |
| [product/site-plan.md](./product/site-plan.md) | Draft | Sivuston sisältösuunnitelman tekstimuotoinen rinnakkaisversio. |
| [product/site-plan.odt](./product/site-plan.odt) | Draft | Alkuperäinen sivustosuunnitelma. Hyväksyntätilaa ei ole ilmoitettu. |
| [product/v1-scope.md](./product/v1-scope.md) | Approved | Hyväksytty V1-frontendin rajaus ja informaatioarkkitehtuuri. |
| [database/database-design.md](./database/database-design.md) | Draft | Tietokantakaavion tekstikuvaus ja vertailu nykyiseen SQL-skeemaan. |
| [database/database-diagram.png](./database/database-diagram.png) | Draft | Alkuperäinen visuaalinen tietokantasuunnitelma. Hyväksyntätilaa ei ole ilmoitettu. |
| [README.md](./README.md) | Implemented | Nykyinen dokumenttihakemisto, statukset ja source-of-truth-säännöt. |

## Statusmääritelmät

- **Draft:** suunnitelma voi muuttua.
- **Approved:** hyväksytty kehityssuunta.
- **Implemented:** kuvaa nykyistä toteutusta.
- **Deprecated:** ei enää ohjaa kehitystä.

Status ilmaisee dokumentin aseman, ei ominaisuuden valmistumisastetta. Draft-dokumentissa kuvattu ominaisuus ei ole automaattisesti vaatimus. Mitään dokumenttia ei merkitä Approved-tilaan ilman projektin omistajan nimenomaista päätöstä.

## Source-of-truth-säännöt

1. **Nykyinen sovellustoteutus:** nykyistä käyttäytymistä koskevissa ristiriidoissa repositorion lähdekoodi on source of truth. Dokumentoitu suunnitelma ei osoita ominaisuutta toteutetuksi.
2. **Nykyinen tietokantaskeema:** nykyistä tietokantarakennetta koskevissa ristiriidoissa [`infra/sql/schema.sql`](../infra/sql/schema.sql) on taulujen, kenttien ja rajoitteiden source of truth. Suunnittelukaavio ei ohita SQL-skeemaa.
3. **Tavoiteltu toteutus:** tavoiteltua toteutusta koskevissa päätöksissä Approved-dokumentit ovat ensisijaisia Draft-dokumentteihin nähden. Approved-status ei kuitenkaan tarkoita, että ominaisuus olisi jo toteutettu.
4. **Alkuperäinen suunnittelutarkoitus:** alkuperäinen ODG-, ODT- tai PNG-lähdetiedosto on ensisijainen siitä tehtyyn Markdown-rinnakkaisversioon nähden, kun tulkitaan alkuperäisen materiaalin sisältöä.
5. **Draft-dokumenttien ristiriidat:** kahden Draft-dokumentin ristiriitaa ei ratkaista automaattisesti. Se raportoidaan avoimena kysymyksenä, ellei Approved-dokumentti ratkaise tavoiteltua toteutusta.
6. **Status:** Approved-status vaatii projektin omistajan päätöksen. Epäselvä status on Draft.
7. **Päivitykset:** toteutusta muuttavan tehtävän yhteydessä arvioidaan, pitääkö Implemented-dokumentteja päivittää. Suunnitelmadokumentin muuttaminen ei itsessään muuta sovellusta tai skeemaa.

## Nykyinen kokonaiskuva

- Tuote- ja sivukarttadokumentit ovat Draft-suunnitelmia.
- [V1-rajaus](./product/v1-scope.md) on Approved ja ohjaa V1-frontendin tavoiteltua toteutusta Draft-suunnitelmien sijasta.
- Frontend on vielä toteuttamatta.
- Backend ja PostgreSQL-skeema ovat osittain toteutettuja.
- Projektikohtaisen GitHub-linkin tietokanta- ja API-tuki on toteutettu nullable `github_url`-kentällä. Frontend-käyttö puuttuu vielä.
- Tietokantakaavion ja SQL-skeeman erot on kirjattu [tietokantasuunnitelmaan](./database/database-design.md), mutta niitä ei ole ratkaistu tässä dokumentointitehtävässä.
