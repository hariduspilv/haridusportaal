# Haridusportaal

[![Greenkeeper badge](https://badges.greenkeeper.io/hariduspilv/haridusportaal.svg)](https://greenkeeper.io/)

<a href="https://www.zenhub.com/extension"><img src="https://github.com/hariduspilv/haridusportaal/blob/master/docs/zenhub.svg"></a>

Noortevaldkonna, hariduse, õppe- ja karjäärinõustamise ning tööturgu õppega seostavate valdkondade:
- Info
- Teenused
- Statistika

## Rakendus ja seotud konteinerid:
  * paigalduse ülevaade kaustas /docker/README.md
  * seotud failide kirjeldus /docker/root/data/README.md

## Tarned
  * https://wiki.twn.ee/display/HP/Tarned

### Paigaldusjuhend paigaldajatele
  * https://wiki.twn.ee/pages/viewpage.action?pageId=64028804
  1. Muuta BUILD_VERSION keskkonna muutuja containers.env failis vastavaks reliisi verisooni sildiga (e.g tag 2.5.0)
  2. docker-compose pull
  3. docker-compose down
  4. docker-compose up -d
  5. docker image prune -a -f (eemaldab üleliigsed mitte-kasutusel image'id)
