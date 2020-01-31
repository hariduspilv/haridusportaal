package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument.EeIsikukaartResponse;
import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;
import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class EeIsikukaartWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(EeIsikukaartWorker.class);

  @Resource
  private EhisXRoadService ehisXRoadService;

  public ObjectNode getEeIsikukaart(String personalCode, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();
    ObjectNode gdprNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - eeIsikukaart.v1");
    logForDrupal.setSeverity("notice");

    responseNode.put("request_timestamp", timestamp).put("response_timestamp", "")
        .put("key", "eeIsikukaart");
    gdprNode.put("request_timestamp", System.currentTimeMillis()).put("response_timestamp", "")
        .put("key", "eeIsikukaartGDPR");

    try {
      EeIsikukaartResponse response = ehisXRoadService
          .eeIsikukaart(personalCode, "xml", personalCode);

      ArrayNode gdprArrayNode = gdprNode.putObject("value").putArray("GDPR");
      response.getIsikukaart().getGdprlogList().forEach(item ->
          gdprArrayNode.addObject().put("id", item.getId())
              .put("personCode", item.getPersoncode())
              .put("logTime", ehisDateTimeFormat(item.getLogtime()))
              .put("action", item.getAction())
              .put("sender", item.getSender())
              .put("receiver", item.getReceiver()));

      ObjectNode valueNode = responseNode.putObject("value");

      ObjectNode isikukandmedNode = valueNode.putObject("isikuandmed");
      isikukandmedNode.put("isikukood", response.getIsikukaart().getIsikuandmed().getIsikukood());
      isikukandmedNode
          .put("synniKp", ehisDateFormat(response.getIsikukaart().getIsikuandmed().getSynniKp()));
      isikukandmedNode.put("eesnimi", response.getIsikukaart().getIsikuandmed().getEesnimi());
      isikukandmedNode.put("perenimi", response.getIsikukaart().getIsikuandmed().getPerenimi());
      isikukandmedNode.put("elukohamaa",
          response.getIsikukaart().getIsikuandmed().isSetElukohamaa() ? response.getIsikukaart()
              .getIsikuandmed().getElukohamaa() : null);
      isikukandmedNode.put("rrElukoht",
          response.getIsikukaart().getIsikuandmed().isSetRrElukoht() ? response.getIsikukaart()
              .getIsikuandmed().getRrElukoht() : null);
      isikukandmedNode.put("kodakondsus",
          response.getIsikukaart().getIsikuandmed().isSetKodakondsus() ? response.getIsikukaart()
              .getIsikuandmed().getKodakondsus() : null);
      isikukandmedNode.put("elamisluba",
          response.getIsikukaart().getIsikuandmed().isSetElamisluba() ? response.getIsikukaart()
              .getIsikuandmed().getElamisluba() : null);

      if (response.getIsikukaart().getIsikuandmed().isSetOppelaenOigus()) {
        ObjectNode oppeleanOigusNode = isikukandmedNode.putObject("oppelaenOigus");
        oppeleanOigusNode.put("oigus",
            response.getIsikukaart().getIsikuandmed().getOppelaenOigus().isSetOigus() ? response
                .getIsikukaart().getIsikuandmed().getOppelaenOigus().getOigus() : null);

        ArrayNode laenPohjus = oppeleanOigusNode.putArray("pohjus");
        response.getIsikukaart().getIsikuandmed().getOppelaenOigus().getPohjusList()
            .forEach(laenPohjus::add);
      } else {
        isikukandmedNode.putObject("oppelaenOigus");
      }

      ArrayNode opingArrayNode = valueNode.putArray("oping");
      response.getIsikukaart().getOpingList().forEach(oping -> {
        ObjectNode opingNode = opingArrayNode.addObject();
        opingNode.put("haridustase", oping.getHaridustase())
            .put("oppeasutus", oping.getOppeasutus())
            .put("oppAlgus", oping.isSetOppAlgus() ? oping.getOppAlgus() : null)
            .put("oppLopp", oping.isSetOppLopp() ? oping.getOppLopp() : null);

        ArrayNode oppekavaArrayNode = opingNode.putArray("oppekava");
        oping.getOppekavaList().forEach(oppekava -> oppekavaArrayNode.addObject()
            .put("klOppekava", oppekava.isSetKlOppekava() ? oppekava.getKlOppekava() : null)
            .put("oppekavaKood", oppekava.isSetOppekavaKood() ? oppekava.getOppekavaKood() : null)
            .put("oppekavaNimetus",
                oppekava.isSetOppekavaNimetus() ? oppekava.getOppekavaNimetus() : null));

        opingNode.put("oppekeel", oping.isSetOppekeel() ? oping.getOppekeel() : null)
            .put("opeklass", oping.isSetOpeKlass() ? oping.getOpeKlass() : null)
            .put("opeParallel", oping.isSetOpeParallel() ? oping.getOpeParallel() : null)
            .put("klassiLiik", oping.isSetKlassiLiik() ? oping.getKlassiLiik() : null)
            .put("klassAste", oping.isSetKlassAste() ? oping.getKlassAste() : null);

        ArrayNode oppevormArrayNode = opingNode.putArray("oppevorm");
        oping.getOppevormList().forEach(oppevorm -> oppevormArrayNode.addObject()
            .put("nimetus", oppevorm.getNimetus())
            .put("algusKp",
                oppevorm.isSetAlgusKp() ? ehisDateFormat(oppevorm.getAlgusKp()) : null)
            .put("loppKp",
                oppevorm.isSetLoppKp() ? ehisDateFormat(oppevorm.getLoppKp()) : null));

        ArrayNode koormusArrayNode = opingNode.putArray("koormus");
        oping.getKoormusList().forEach(koormus -> koormusArrayNode.addObject()
            .put("nimetus", koormus.getNimetus())
            .put("algusKp",
                koormus.isSetAlgusKp() ? ehisDateFormat(koormus.getAlgusKp()) : null)
            .put("loppKp",
                koormus.isSetLoppKp() ? ehisDateFormat(koormus.getLoppKp()) : null));

        opingNode.put("kestus", oping.isSetKestus() ? oping.getKestus() : null);

        if (oping.isSetOppekavataitmine()) {
          opingNode.putObject("oppekavataitine")
              .put("protsent",
                  oping.getOppekavataitmine().isSetProtsent() ? oping.getOppekavataitmine()
                      .getProtsent() : null)
              .put("otsusKp",
                  oping.getOppekavataitmine().isSetOtsusKp() ? oping.getOppekavataitmine()
                      .getOtsusKp() : null);
        } else {
          opingNode.putObject("oppekavataitine");
        }

        opingNode.put("ryhmaLiik", oping.isSetRyhmaLiik() ? oping.getRyhmaLiik() : null)
            .put("nimetus", oping.isSetNimetus() ? oping.getNimetus() : null)
            .put("koht", oping.isSetKoht() ? oping.getKoht() : null);

        ArrayNode finAllikasArrayNode = opingNode.putArray("finAllikas");
        oping.getFinAllikasList().forEach(finAllikas -> finAllikasArrayNode.addObject()
            .put("nimetus", finAllikas.getNimetus())
            .put("algusKp",
                finAllikas.isSetAlgusKp() ? ehisDateFormat(finAllikas.getAlgusKp()) : null)
            .put("loppKp",
                finAllikas.isSetLoppKp() ? ehisDateFormat(finAllikas.getLoppKp()) : null));

        ArrayNode akadPuhkusArrayNode = opingNode.putArray("akadPuhkus");
        oping.getAkadPuhkusList().forEach(akadPuhkus -> akadPuhkusArrayNode.addObject()
            .put("nimetus", akadPuhkus.getNimetus())
            .put("algusKp",
                akadPuhkus.isSetAlgusKp() ? ehisDateFormat(akadPuhkus.getAlgusKp()) : null)
            .put("loppKp",
                akadPuhkus.isSetLoppKp() ? ehisDateFormat(akadPuhkus.getLoppKp()) : null));

        ArrayNode ennistamineArrayNode = opingNode.putArray("ennistamine");
        oping.getEnnistamineList().forEach(ennistamine -> ennistamineArrayNode.addObject()
            .put("nimetus", ennistamine.getNimetus())
            .put("algusKp",
                ennistamine.isSetAlgusKp() ? ehisDateFormat(ennistamine.getAlgusKp()) : null)
            .put("loppKp",
                ennistamine.isSetLoppKp() ? ehisDateFormat(ennistamine.getLoppKp()) : null));

        opingNode.put("puudumised", oping.isSetPuudumised() ? oping.getPuudumised() : null)
            .put("staatus", oping.isSetStaatus() ? oping.getStaatus() : null)
            .put("tunnistusDiplom",
                oping.isSetTunnistusDiplom() ? oping.getTunnistusDiplom() : null);

        ArrayNode kutseKoolitusArrayNode = opingNode.putArray("kutseKoolitus");
        oping.getKutseKoolitusList().forEach(kutseKoolitus -> kutseKoolitusArrayNode.addObject()
            .put("oppeasutus", kutseKoolitus.getOppeasutus())
            .put("algusKp", ehisDateFormat(kutseKoolitus.getAlgusKp()))
            .putObject("oppekava")
            .put("klOppekava",
                kutseKoolitus.getOppekava().isSetKlOppekava() ? kutseKoolitus.getOppekava()
                    .getKlOppekava() : null)
            .put("oppekavaKood",
                kutseKoolitus.getOppekava().isSetOppekavaKood() ? kutseKoolitus.getOppekava()
                    .getOppekavaKood() : null)
            .put("oppekavaNimetus",
                kutseKoolitus.getOppekava().isSetOppekavaNimetus() ? kutseKoolitus.getOppekava()
                    .getOppekavaNimetus() : null));
      });

      ArrayNode tootamineArrayNode = valueNode.putArray("tootamine");
      response.getIsikukaart().getTootamineList().forEach(tootamine -> {
        ObjectNode tootamineNode = tootamineArrayNode.addObject();
        tootamineNode.put("liik", tootamine.getLiik())
            .put("oppeasutus", tootamine.getOppeasutus())
            .put("oppeasutusId", tootamine.getOppeasutusId().intValue())
            .put("ametikoht", tootamine.getAmetikoht())
            .put("ametikohtAlgus",
                tootamine.isSetAmetikohtAlgus() ? ehisDateFormat(tootamine.getAmetikohtAlgus())
                    : null)
            .put("ametikohtLopp",
                tootamine.isSetAmetikohtLopp() ? ehisDateFormat(tootamine.getAmetikohtLopp())
                    : null)
            .put("onTunniandja",
                tootamine.isSetOnTunniandja() ? tootamine.getOnTunniandja().intValue() : null)
            .put("onOppejoud",
                tootamine.isSetOnOppejoud() ? tootamine.getOnOppejoud().intValue() : null)
            .put("kehtiv", tootamine.getKehtiv().intValue())
            .put("taitmiseViis", tootamine.isSetTaitmiseViis() ? tootamine.getTaitmiseViis() : null)
            .put("amtikohtKoormus",
                tootamine.isSetAmetikohtKoormus() ? tootamine.getAmetikohtKoormus() : null)
            .put("tooleping", tootamine.isSetTooleping() ? tootamine.getTooleping() : null)
            .put("ametikohtKvalVastavus",
                tootamine.isSetAmetikohtKvalVastavus() ? tootamine.getAmetikohtKvalVastavus()
                    : null)
            .put("ametijark", tootamine.isSetAmetijark() ? tootamine.getAmetijark() : null);

        ArrayNode oppekavaArrayNode = tootamineNode.putArray("oppekava");
        tootamine.getOppekavaList().forEach(oppekava -> oppekavaArrayNode.addObject()
            .put("klOppekava", oppekava.isSetKlOppekava() ? oppekava.getKlOppekava() : null)
            .put("oppekavaKood", oppekava.isSetOppekavaKood() ? oppekava.getOppekavaKood() : null)
            .put("oppekavaNimetus",
                oppekava.isSetOppekavaNimetus() ? oppekava.getOppekavaNimetus() : null));

        ArrayNode oppeaineArrayNode = tootamineNode.putArray("oppeaine");
        tootamine.getOppeaineList().forEach(oppeaine -> oppeaineArrayNode.addObject()
            .put("oppeaine", oppeaine.isSetOppeaine() ? oppeaine.getOppeaine() : null)
            .put("kooliaste", oppeaine.isSetKooliaste() ? oppeaine.getKooliaste() : null)
            .put("maht", oppeaine.isSetMaht() ? oppeaine.getMaht() : null)
            .put("kvalVastavus", oppeaine.isSetKvalVastavus() ? oppeaine.getKvalVastavus() : null));

        tootamineNode
            .put("haridustase", tootamine.isSetHaridustase() ? tootamine.getHaridustase() : null)
            .put("lapsehooldusPuhkus",
                tootamine.isSetLapsehooldusPuhkus() ? tootamine.getLapsehooldusPuhkus() : null);
      });

      ArrayNode taiendkoolitusArrayNode = valueNode.putArray("taiendkoolitus");
      response.getIsikukaart().getTaiendkoolitusList()
          .forEach(taiendkoolitus -> taiendkoolitusArrayNode.addObject()
              .put("oppeasutus",
                  taiendkoolitus.isSetOppeasutus() ? taiendkoolitus.getOppeasutus() : null)
              .put("nimetus", taiendkoolitus.isSetNimetus() ? taiendkoolitus.getNimetus() : null)
              .put("liik", taiendkoolitus.isSetLiik() ? taiendkoolitus.getLiik() : null)
              .put("loppKp",
                  taiendkoolitus.isSetLoppKp() ? ehisDateFormat(taiendkoolitus.getLoppKp()) : null)
              .put("maht", taiendkoolitus.isSetMaht() ? taiendkoolitus.getMaht() : null));

      ArrayNode tasemeharidusArrayNode = valueNode.putArray("tasemeharidus");
      response.getIsikukaart().getTasemeharidusList()
          .forEach(tasemeharidus -> tasemeharidusArrayNode.addObject()
              .put("kvalDokument",
                  tasemeharidus.isSetKvalDokument() ? tasemeharidus.getKvalDokument() : null)
              .put("kvalVastavus",
                  tasemeharidus.isSetKvalVastavus() ? tasemeharidus.getKvalVastavus() : null)
              .put("oppeasutus",
                  tasemeharidus.isSetOppeasutus() ? tasemeharidus.getOppeasutus() : null)
              .put("erialaOppekava",
                  tasemeharidus.isSetErialaOppekava() ? tasemeharidus.getErialaOppekava() : null)
              .put("lopetanud",
                  tasemeharidus.isSetLopetanud() ? ehisDateFormat(tasemeharidus.getLopetanud())
                      : null)
              .put("dokument", tasemeharidus.isSetDokument() ? tasemeharidus.getDokument() : null));

      ArrayNode kvalifikatsioonArrayNode = valueNode.putArray("kvalifikatsioon");
      response.getIsikukaart().getKvalifikatsioonList()
          .forEach(kvalifikatsioon -> kvalifikatsioonArrayNode.addObject()
              .put("oppeasutus",
                  kvalifikatsioon.isSetOppeasutus() ? kvalifikatsioon.getOppeasutus() : null)
              .put("dokument",
                  kvalifikatsioon.isSetDokument() ? kvalifikatsioon.getDokument() : null)
              .put("nimetus", kvalifikatsioon.isSetNimetus() ? kvalifikatsioon.getNimetus() : null)
              .put("vastavus",
                  kvalifikatsioon.isSetVastavus() ? kvalifikatsioon.getVastavus() : null)
              .put("aasta",
                  kvalifikatsioon.isSetAasta() ? kvalifikatsioon.getAasta().intValue() : null)
              .put("riik", kvalifikatsioon.isSetRiik() ? kvalifikatsioon.getRiik() : null));

      logForDrupal.setMessage("EHIS - eeIsikukaart.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      if (e instanceof XRoadServiceConsumptionException
          && ((XRoadServiceConsumptionException) e).getFaultString() != null
          && (((XRoadServiceConsumptionException) e).getFaultString()
          .equalsIgnoreCase("Paring ei ole lubatud")
          || ((XRoadServiceConsumptionException) e).getFaultString()
          .equalsIgnoreCase("Isiku kohta andmeid ei leitud."))) {
        responseNode.putObject("error").put("message_type", "ERROR").putObject("message_text")
            .put("et", ((XRoadServiceConsumptionException) e).getFaultString());
        responseNode.remove("value");
      } else {
        setError(LOGGER, responseNode, e);
      }
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    LOGGER.info(logForDrupal);

    responseNode.put("response_timestamp", System.currentTimeMillis());
    gdprNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "eeIsikukaartGDPR", gdprNode);
    redisTemplate.opsForHash().put(personalCode, "eeIsikukaart", responseNode);
    redisTemplate.expire(personalCode, redisExpire, TimeUnit.MINUTES);

    return responseNode;
  }

  public ObjectNode getGDPRLog(String personalCode) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - eeIsikukaart.v1:GDPR");
    logForDrupal.setSeverity("notice");

    responseNode.put("request_timestamp", System.currentTimeMillis()).put("response_timestamp", "")
        .put("key", "eeIsikukaartGDPR");

    try {
      EeIsikukaartResponse response = ehisXRoadService
          .eeIsikukaart(personalCode, "xml", personalCode);

      ArrayNode GDPRNode = responseNode.putObject("value").putArray("GDPR");
      response.getIsikukaart().getGdprlogList().forEach(item ->
          GDPRNode.addObject().put("id", item.getId())
          .put("personCode", item.getPersoncode())
          .put("logTime", ehisDateTimeFormat(item.getLogtime()))
          .put("action", item.getAction())
          .put("sender", item.getSender())
          .put("receiver", item.getReceiver()));

      logForDrupal.setMessage("EHIS - eeIsikukaart.v1:GDPR teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      if (e instanceof XRoadServiceConsumptionException
          && ((XRoadServiceConsumptionException) e).getFaultString() != null
          && (((XRoadServiceConsumptionException) e).getFaultString()
          .equalsIgnoreCase("Paring ei ole lubatud")
          || ((XRoadServiceConsumptionException) e).getFaultString()
          .equalsIgnoreCase("Isiku kohta andmeid ei leitud."))) {
        responseNode.putObject("error").put("message_type", "ERROR").putObject("message_text")
            .put("et", ((XRoadServiceConsumptionException) e).getFaultString());
        responseNode.remove("value");
      } else {
        setError(LOGGER, responseNode, e);
      }
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    LOGGER.info(logForDrupal);

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "eeIsikukaartGDPR", responseNode);
    redisTemplate.expire(personalCode, redisExpire, TimeUnit.MINUTES);

    return responseNode;
  }
}
