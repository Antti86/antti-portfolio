# Sivukartta

**Status:** Draft
**Alkuperäinen lähde:** [sitemap.odg](./sitemap.odg)

**Hyväksytty V1-rajaus:** [v1-scope.md](./v1-scope.md). Tämä Draft-dokumentti säilyttää alkuperäisen sivukartan; V1-toteutuksessa Approved-dokumentti on ensisijainen.

## Tarkoitus

Tämä dokumentti on ihmiselle ja tekstipohjaisille työkaluille luettava rinnakkaisversio alkuperäisestä Portfolio Sivukartta -kaaviosta. Se säilyttää kaavion informaatiosisällön, mutta ei lisää päätöksiä sivujen URL-osoitteista, navigointijärjestyksestä tai toteutustavasta.

## Suunniteltu sivustorakenne

Kaavion keskuksena on **Etusivu**. Siinä esitetään seuraavat muut sivuston osat:

- Projektit
- CV
- Taidot
- Tietoa minusta
- Kontaktit
- Oppimispäiväkirjat
- Statistiikka

Alkuperäisessä kaaviossa osat on sijoitettu visuaalisesti Etusivun ympärille, mutta niiden välille ei ole piirretty yhteysviivoja. Kaavio ei siksi yksiselitteisesti määritä, ovatko kaikki osat erillisiä sivuja, etusivun osioita vai näiden yhdistelmä.

## Suunnitelma ja nykyinen toteutus

### Suunnitelma

Sivukartta kuvaa portfolioon suunnitellut sisältöalueet. Se ei määritä reittejä, komponentteja, tietolähteitä tai ominaisuuksien toteutusjärjestystä.

### Nykyinen toteutus

- React-frontendia ei ole vielä toteutettu; `frontend/` sisältää tällä hetkellä vain README-tiedoston.
- Backend tarjoaa API-resursseja projekteille, kursseille, teknologioille, oppilaitoksille ja oppimispäiväkirjojen metatiedoille.
- Backendin olemassaolo ei tarkoita, että sivukartan vastaavat käyttöliittymäsivut olisi toteutettu.
- CV-, Tietoa minusta-, Kontaktit- ja Statistiikka-näkymiä ei ole nykyisessä frontendissä toteutettu.

## Suhde sivustosuunnitelmaan

[Sivustosuunnitelma](./site-plan.md) sisältää osiot Etusivu/Esittely, CV, Projektit, Opintopolku/Kurssit, Skillit/Teknologiat ja Kontaktit. Sivukartta ja sivustosuunnitelma ovat pääosin samansuuntaisia, mutta eivät täysin samoja:

- Sivukartassa on erilliset Tietoa minusta-, Oppimispäiväkirjat- ja Statistiikka-kohdat.
- Sivustosuunnitelmassa on erillinen Opintopolku/Kurssit-osio, jota sivukartassa ei ole nimetty.
- Sivustosuunnitelmassa oppimispäiväkirja mainitaan mahdollisena kurssiin liittyvänä sisältönä, ei yksiselitteisesti omana pääsivunaan.

## Avoimet kysymykset

- Ovatko kaavion kohdat erillisiä sivuja, yhden sivun osioita vai molempia?
- Lisätäänkö Opintopolku/Kurssit sivukarttaan omaksi kohteekseen?
- Onko Tietoa minusta erillinen sivu vai osa Etusivu/Esittely-osiota?
- Onko Oppimispäiväkirjat oma näkymä vai avataanko päiväkirjat kurssien ja projektien yhteydestä?
- Mitä Statistiikka tarkoittaa ja mistä sen tiedot tulevat?
- Mikä on navigaation järjestys ja mitkä osat kuuluvat päänavigaatioon?
