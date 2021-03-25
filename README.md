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

## Reliiside koostamine
  1. Loo master haru pealt reliis haru uue reliis tag'iga (e.g hp-release-2.5.0) / eelnev reliis leitav siin: https://github.com/hariduspilv/haridusportaal/releases
  2. Kogu kõik tehtud tööd, mis on READY FOR PRELIVE või kaugemal tulbas ning mis on code review läbinud ja develop harusse mergetud (kuid pole veel reliisi jõudnud) kokku ja merge'i reliis harusse:
    * Reliisi jõudmist kontrolli feature-branch labeli järgi, peaks olema uuem label kui viimane reliis reliiside all:
      * Reliisid: 
        https://github.com/hariduspilv/haridusportaal/releases
      * Vastavad jira tahvlid piletite vaatamiseks:
        https://jira.twn.ee/secure/RapidBoard.jspa?rapidView=189&projectKey=HP&quickFilter=592
        https://jira.twn.ee/secure/RapidBoard.jspa?rapidView=173
      * Suletud pull-requestid, kus vaadata feature/branche, mis mergetud developi:
        https://github.com/hariduspilv/haridusportaal/pulls?q=is%3Apr+is%3Aclosed
    1. Loo uus pull-request oma reliis harul suunaga master
    2. Iga pilet, mis on liikunud READY FOR PRELIVE tulpa või kaugemale ja on samuti leitav suletud feature-branchina pull-requestide all merge'i reliis harusse (e.g git merge HP-579)
    3. Paralleelselt loo uus reliis ka jira's https://jira.twn.ee/projects/HP?selectedItem=com.atlassian.jira.jira-projects-plugin:release-page ja lisa piletitele külge too loodud "Lahendusversioon"
    4. Kui kõik reliisi minevad piletid lisatud merge'i oma reliis haru (e.g hp-release-2.5.0) masterisse ja seejärel master omakorda develop harusse
  3. Loo uus reliis https://github.com/hariduspilv/haridusportaal/releases master haru pealt uue vastava release tag'iga (e.g 2.5.0)
  4. Seejärel mine koodis /angular-fe ja ehita uus angulari docker image
    1. docker build . --build-arg BUILD_VERSION=2.5.0 -f Dockerfile.prod -t hub.wiseman.ee/htm/angular:prod
    2. docker push hub.wiseman.ee/htm/angular:prod
  5. Edasta alljärgnev paigaldusjuhend paigaldajatele meilie admin@eenet.ee

### Paigaldusjuhend paigaldajatele
  1. Muuta BUILD_VERSION keskkonna muutuja containers.env failis vastavaks reliisi verisooni sildiga (e.g tag 2.5.0)
  2. docker-compose pull
  3. docker-compose down
  4. docker-compose up -d
  5. docker image prune -a -f (eemaldab üleliigsed mitte-kasutusel image'id)
