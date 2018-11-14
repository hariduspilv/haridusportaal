package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Aadress;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusDocument.MtsysLaeOppeasutus;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusResponseDocument.MtsysLaeOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusAndmed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusKontaktandmed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusResponseDocument.MtsysOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusloadResponseDocument.MtsysTegevusloadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaResponseDocument.MtsysTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaDocument.MtsysTegevusnaitaja;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaResponseDocument.MtsysTegevusnaitajaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.OppeasutusDetail;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.Calendar;
import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class MtsysWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(MtsysWorker.class);

  private static final String MTSYSKLF_KEY = "klassifikaator";
  private static final String MTSYSFILE_KEY = "mtsysFile_";

  @Resource
  private EhisXRoadService ehisXRoadService;

  public ObjectNode getMtsysKlf() {
    ObjectNode mtsysKlfResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser("SYSTEM - XROAD");
    logForDrupal.setType("EHIS - mtsysKlfTeenus.v1");

    try {
      MtsysKlfTeenusResponse response = ehisXRoadService.mtsysKlfTeenus(null);

      ObjectNode tegevusloaLiigidNode = mtsysKlfResponse.putObject("tegevusloaLiigid");
      response.getTegevusloaLiigid().getTegevusloaLiikList().forEach(
          item -> tegevusloaLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tegevusloaLiigid", tegevusloaLiigidNode);

      ObjectNode oppekavaStaatusedNode = mtsysKlfResponse.putObject("oppekavaStaatused");
      response.getOppekavaStaatused().getOppekavaStaatusList().forEach(
          item -> oppekavaStaatusedNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppekavaStaatused", oppekavaStaatusedNode);

      ObjectNode oppekavaOppetasemedNode = mtsysKlfResponse.putObject("oppekavaOppetasemed");
      response.getOppekavaOppetasemed().getOppekavaOppetaseList().forEach(
          item -> oppekavaOppetasemedNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppekavaOppetasemed", oppekavaOppetasemedNode);

      ObjectNode soidukiKategooriadNode = mtsysKlfResponse.putObject("soidukiKategooriad");
      response.getSoidukiKategooriad().getSoidukiKategooriaList().forEach(
          item -> soidukiKategooriadNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "soidukiKategooriad", soidukiKategooriadNode);

      ObjectNode oppeasutuseOmandivormidNode = mtsysKlfResponse
          .putObject("oppeasutuseOmandivormid");
      response.getOppeasutuseOmandivormid().getOppeasutuseOmandivormList().forEach(
          item -> oppeasutuseOmandivormidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash()
          .put(MTSYSKLF_KEY, "oppeasutuseOmandivormid", oppeasutuseOmandivormidNode);

      ObjectNode oppeasutuseLiigidNode = mtsysKlfResponse.putObject("oppeasutuseLiigid");
      response.getOppeasutuseLiigid().getOppeasutuseLiikList().forEach(
          item -> oppeasutuseLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppeasutuseLiigid", oppeasutuseLiigidNode);

      ObjectNode pidajaLiigidNode = mtsysKlfResponse.putObject("pidajaLiigid");
      response.getPidajaLiigid().getPidajaLiikList().forEach(
          item -> pidajaLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "pidajaLiigid", pidajaLiigidNode);

      ObjectNode failiTyybidNode = mtsysKlfResponse.putObject("failiTyybid");
      final Object[] lastKlOkLiik = new Object[]{BigInteger.valueOf(-1L)};
      response.getFailiTyybid().getFailiTyypList().forEach(item -> {
        if (lastKlOkLiik[0].equals(BigInteger.valueOf(-1L)) || !lastKlOkLiik[0]
            .equals(item.getKlOkLiik())) {
          failiTyybidNode.putObject(item.getKlOkLiik().toString())
              .put("et", item.getOkLiik());
          lastKlOkLiik[0] = item.getKlOkLiik();
        }

        ((ObjectNode) failiTyybidNode.get(item.getKlOkLiik().toString()))
            .putObject(item.getKlFailTyyp().toString())
            .put("et", item.getFailTyyp())
            .put("required", item.getKohustuslik().equals(BigInteger.ONE) ? true : false);

      });
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "failiTyybid", failiTyybidNode);

      ObjectNode tkkLiigidNode = mtsysKlfResponse.putObject("tkkLiigid");
      response.getTkkLiigid().getTkkLiikList().forEach(
          item -> tkkLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tkkLiigid", tkkLiigidNode);

      ObjectNode eestiKeeleTasemedNode = mtsysKlfResponse.putObject("eestiKeeleTasemed");
      response.getEestiKeeleTasemed().getEestiKeeleTaseList().forEach(
          item -> eestiKeeleTasemedNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "eestiKeeleTasemed", eestiKeeleTasemedNode);

      ObjectNode opperyhmadNode = mtsysKlfResponse.putObject("opperyhmad");
      response.getOpperyhmad().getOpperyhmList().forEach(
          item -> opperyhmadNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "opperyhmad", opperyhmadNode);

      ObjectNode tegevusnaitajaTyybidNode = mtsysKlfResponse.putObject("tegevusnaitajaTyybid");
      response.getTegevusnaitajaTyybid().getTegevusnaitajaTyypList().forEach(
          item -> tegevusnaitajaTyybidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash()
          .put(MTSYSKLF_KEY, "tegevusnaitajaTyybid", tegevusnaitajaTyybidNode);

      logForDrupal.setMessage("EHIS - mtsysKlfTeenus.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      mtsysKlfResponse.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "ehis.mtsysKlfTeenus.v1");

//    redisTemplate.opsForHash().put(MTSYSKLF_KEY, "mtsysKlf", mtsysKlfResponse);

    return mtsysKlfResponse;
  }

  public void getMtsystegevusLoad(String identifier) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(identifier);
    logForDrupal.setType("EHIS - mtsysTegevuslaod.v1");

    try {
      ObjectNode tegevusloaLiigidNode = getKlfNode("tegevusloaLiigid");
//      ObjectNode oppekavaStaatusedNode = getKlfNode("oppekavaStaatused");

      MtsysTegevusloadResponse response = ehisXRoadService.mtsysTegevusload(identifier, null);

      jsonNode.put("message", response.isSetInfotekst() ? response.getInfotekst() : null)
          .put("ownerid", response.isSetAsutus() ? response.getAsutus().getRegNr() : null);

      if (response.isSetAsutus()) {
        ArrayNode educationalInstitutionNode = jsonNode.putArray("educationalInstitutions");

        Calendar currentDate = Calendar.getInstance();
        Calendar beforeDate = Calendar.getInstance();
        beforeDate.set(Calendar.MONTH, Calendar.APRIL);
        beforeDate.set(Calendar.DATE, 1);

        response.getAsutus().getOppeasutused().getOppeasutusList().forEach(
            item -> {
              ObjectNode itemNode = educationalInstitutionNode.addObject();
              itemNode.put("id", item.getId().intValue())
                  .put("message",
                      item.isSetTegevusnaitajad() && item.getTegevusnaitajad().isSetTnInfotekst()
                          ? item.getTegevusnaitajad().getTnInfotekst() : null);

              itemNode.putArray("documents");
              itemNode.putArray("drafts");

              itemNode.putArray("acceptable_forms").addObject()
                  .put("form_name", "MTSYS_TEGEVUSLUBA_TAOTLUS");
              ((ArrayNode) itemNode.get("acceptable_forms")).addObject()
                  .put("form_name", "MTSYS_MAJANDUSTEGEVUSE_TEADE");

              if (item.isSetTegevusnaitajad()) {
                item.getTegevusnaitajad().getTegevusnaitajaList().forEach(tegevusnaitaja -> {
                  if (!tegevusnaitaja.isSetEsitamiseKp() && !tegevusnaitaja.isSetId()
                      && !tegevusnaitaja.isSetMenetlusStaatus()) {
                    ((ArrayNode) itemNode.get("acceptable_forms")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSNAITAJAD")
                        .put("description", tegevusnaitaja.getAasta().intValue());
                  } else if (!tegevusnaitaja.getMenetlusStaatus().equalsIgnoreCase("Esitatud")) {
                    ((ArrayNode) itemNode.get("drafts")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSNAITAJAD")
                        .put("id", tegevusnaitaja.getId().intValue())
                        .put("description", tegevusnaitaja.getAasta().intValue());
                  } else {
                    ((ArrayNode) itemNode.get("documents")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSNAITAJAD")
                        .put("id", tegevusnaitaja.getId().intValue())
                        .put("document_date", tegevusnaitaja.getEsitamiseKp())
                        .put("status", tegevusnaitaja.getMenetlusStaatus())
                        .put("description", tegevusnaitaja.getAasta().intValue())
                        .put("changeable", currentDate.before(beforeDate)
                            && tegevusnaitaja.getAasta().intValue()
                            >= currentDate.get(Calendar.YEAR) - 1 ? true : false);
                  }
                });
              }

              if (item.isSetTegevusload()) {
                item.getTegevusload().getTegevuslubaList().forEach(tegevusluba -> {
                  if (tegevusluba.getLiik().equalsIgnoreCase("18098")) {
                    if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("15667") &&
                        tegevusluba.getMenetlusStaatus().equalsIgnoreCase("15669")) {
                      ((ArrayNode) itemNode.get("drafts")).addObject()
                          .put("form_name", "MTSYS_MAJANDUSTEGEVUSE_TEADE")
                          .put("id", tegevusluba.isSetId() ? tegevusluba.getId().intValue() : null)
                          .put("document_date",
                              tegevusluba.isSetLoomiseKp() ? tegevusluba.getLoomiseKp() : null)
                          .put("description", tegevusloaLiigidNode.get(tegevusluba.getLiik())
                              .get("et").asText());
                    } else {
                      String description = tegevusloaLiigidNode.get(tegevusluba.getLiik())
                          .get("et").asText() +
                          " number " + tegevusluba.getLoaNumber() +
                          " kehtivusega alates " + tegevusluba.getKehtivAlates() +
                          " kuni " + tegevusluba.getKehtivKuni();
                      if (tegevusluba.isSetTyhistamiseKp()) {
                        description += " tühistatud " + tegevusluba.getTyhistamiseKp();
                      }

                      ((ArrayNode) itemNode.get("documents")).addObject()
                          .put("form_name", "MTSYS_MAJANDUSTEGEVUSE_TEADE")
                          .put("id", tegevusluba.getId().intValue())
                          .put("document_date", tegevusluba.getKehtivAlates())
                          .put("status", tegevusluba.getMenetlusStaatus())
                          .put("description", description);
                    }
                  } else {
                    if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("15667") &&
                        tegevusluba.getMenetlusStaatus().equalsIgnoreCase("15669")) {
                      ((ArrayNode) itemNode.get("drafts")).addObject()
                          .put("form_name", "MTSYS_TEGEVUSLUBA_TAOTLUS")
                          .put("id", tegevusluba.isSetId() ? tegevusluba.getId().intValue() : null)
                          .put("document_date",
                              tegevusluba.isSetLoomiseKp() ? tegevusluba.getLoomiseKp() : null)
                          .put("description", tegevusloaLiigidNode.get(tegevusluba.getLiik())
                              .get("et").asText());
                    } else {
                      String description = tegevusloaLiigidNode.get(tegevusluba.getLiik())
                          .get("et").asText() +
                          " number " + tegevusluba.getLoaNumber() +
                          " kehtivusega alates " + tegevusluba.getKehtivAlates() +
                          " kuni " + tegevusluba.getKehtivKuni();
                      if (tegevusluba.isSetTyhistamiseKp()) {
                        description += " tühistatud " + tegevusluba.getTyhistamiseKp();
                      }

                      ((ArrayNode) itemNode.get("documents")).addObject()
                          .put("form_name", "MTSYS_TEGEVUSLUBA_TAOTLUS")
                          .put("id", tegevusluba.getId().intValue())
                          .put("document_date", tegevusluba.getKehtivAlates())
                          .put("status", tegevusluba.getMenetlusStaatus())
                          .put("description", description);
                    }
                  }
                });
              }
            });
      }

    } catch (Exception e) {
      LOGGER.error(e, e);
      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      jsonNode.removeAll();
      jsonNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "ehis.mtsysTegevuslaod.v1");

    redisTemplate.opsForHash().put(identifier, "mtsys", jsonNode);
  }

  public ObjectNode getMtsysTegevusluba(String formName, String identifier, String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .putArray("acceptable_activity").add("VIEW");
    ((ObjectNode) jsonNode.get("header"))
        .put("current_step", "step_0")
        .put("identifier", identifier);
    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegevusluba.v1");

    try {
      MtsysTegevuslubaResponse response = ehisXRoadService
          .mtsysTegevusluba(BigInteger.valueOf(Long.parseLong(identifier)), personalCode);

      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_0").putObject("title")
          .put("et", "Tegevusluba");
      ObjectNode stepZeroDataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps")
          .get("step_0")).putObject("data_elements");

      stepZeroDataElementsNode.putObject("tegevusloaLiik").putArray("value")
          .add(response.getTegevusloaAndmed().getKlLiik().intValue());
      stepZeroDataElementsNode.putObject("tegevusloaStaatus").putArray("value")
          .add(response.getTegevusloaAndmed().getKlStaatus().intValue());
      stepZeroDataElementsNode.putObject("tegevusloaNumber").putArray("value")
          .add(response.getTegevusloaAndmed().getLoaNumber());
      stepZeroDataElementsNode.putObject("oppekavaNimetus").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetNimetus() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetNimetus() ?
          response.getTegevusloaAndmed().getNimetus() : null);
      stepZeroDataElementsNode.putObject("kaskkirjaNr").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKaskkirjaNr() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKaskkirjaNr() ?
          response.getTegevusloaAndmed().getKaskkirjaNr() : null);
      stepZeroDataElementsNode.putObject("kaskkirjaKuupaev").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKaskkirjaKp() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKaskkirjaKp() ?
          response.getTegevusloaAndmed().getKaskkirjaKp() : null);
      stepZeroDataElementsNode.putObject("alguseKuupaev").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKehtivAlates() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKehtivAlates() ?
          response.getTegevusloaAndmed().getKehtivAlates() : null);
      stepZeroDataElementsNode.putObject("lopuKuupaev").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKehtivKuni() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKehtivKuni() ?
          response.getTegevusloaAndmed().getKehtivKuni() : null);
      stepZeroDataElementsNode.putObject("tuhistamiseKuupaev").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetTyhistamiseKp() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetTyhistamiseKp() ?
          response.getTegevusloaAndmed().getTyhistamiseKp() : null);
      stepZeroDataElementsNode.putObject("laagriNimetus").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetLaagriNimetus() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetLaagriNimetus() ?
          response.getTegevusloaAndmed().getLaagriNimetus() : null);
      stepZeroDataElementsNode.putObject("kohtadeArvLaagris").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKohtadeArvLaagris() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKohtadeArvLaagris() ?
          response.getTegevusloaAndmed().getKohtadeArvLaagris().intValue() : null);
      stepZeroDataElementsNode.putObject("tkkLiik").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKlTkkLiik() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKlTkkLiik() ?
          response.getTegevusloaAndmed().getKlTkkLiik().intValue() : null);
      stepZeroDataElementsNode.putObject("keeleTase").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKlEkTase() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKlEkTase() ?
          response.getTegevusloaAndmed().getKlEkTase().intValue() : null);
      stepZeroDataElementsNode.putObject("soidukiteKategooria").put("hidden",
          response.getTegevusloaAndmed().getKlLiik().equals(BigInteger.valueOf(18098L))
              || !response.getTegevusloaAndmed().isSetKlSoidukiKategooria() ? true : false)
          .putArray("value").add(response.getTegevusloaAndmed().isSetKlSoidukiKategooria() ?
          response.getTegevusloaAndmed().getKlSoidukiKategooria().intValue() : null);

//      stepZeroDataElementsNode.putObject("id")
//          .put("hidden", response.getTegevusloaAndmed().isSetId() ? true : false)
//          .putArray("value").add(response.getTegevusloaAndmed().isSetId() ?
//          response.getTegevusloaAndmed().getId().intValue() : null);
//      stepZeroDataElementsNode.putObject("taotlusId")
//          .put("hidden", response.getTegevusloaAndmed().isSetTaotlusId() ? true : false)
//          .putArray("value").add(response.getTegevusloaAndmed().isSetTaotlusId() ?
//          response.getTegevusloaAndmed().getTaotlusId().intValue() : null);
//      stepZeroDataElementsNode.putObject("tyyp").putArray("value")
//          .add(response.getTegevusloaAndmed().getTyyp());
//      stepZeroDataElementsNode.putObject("lisainfo")
//          .put("hidden", response.getTegevusloaAndmed().isSetLisainfo() ? true : false)
//          .putArray("value").add(response.getTegevusloaAndmed().isSetLisainfo() ?
//          response.getTegevusloaAndmed().getLisainfo() : null);
//      stepZeroDataElementsNode.putObject("loomiseKp")
//          .put("hidden", response.getTegevusloaAndmed().isSetLoomiseKp() ? true : false)
//          .putArray("value").add(response.getTegevusloaAndmed().isSetLoomiseKp() ?
//          response.getTegevusloaAndmed().getLoomiseKp() : null);
//      stepZeroDataElementsNode.putObject("peatatudKuniKp")
//          .put("hidden", response.getTegevusloaAndmed().isSetPeatatudKuniKp() ? true : false)
//          .putArray("value").add(response.getTegevusloaAndmed().isSetPeatatudKuniKp() ?
//          response.getTegevusloaAndmed().getPeatatudKuniKp() : null);

      stepZeroDataElementsNode.putObject("oppeTasemed").putArray("value");
      response.getTegevusloaAndmed().getOppetasemed().getOppekavaOppetaseList().forEach(
          ehisKlassifikaator -> ((ArrayNode) stepZeroDataElementsNode.get("oppeTasemed")
              .get("value")).addObject()
//              .put("id", ehisKlassifikaator.getId().intValue())
              .put("nimetus", ehisKlassifikaator.getNimetus())
              .put("onKehtiv", ehisKlassifikaator.getOnKehtiv()));

      stepZeroDataElementsNode.putObject("oppekavaRuhmad").putArray("value");
      response.getTegevusloaAndmed().getOpperyhmad().getOpperyhmList().forEach(
          ehisKlassifikaator -> ((ArrayNode) stepZeroDataElementsNode.get("oppekavaRuhmad")
              .get("value")).addObject()
//              .put("id", ehisKlassifikaator.getId().intValue())
              .put("nimetus", ehisKlassifikaator.getNimetus())
              .put("onKehtiv", ehisKlassifikaator.getOnKehtiv()));

      stepZeroDataElementsNode.putObject("valisAadress").putArray("value")
          .add(response.getTegevusloaAndmed().getAadressid().getOnValismaa());

      stepZeroDataElementsNode.putObject("aadressid").putArray("value");
      response.getTegevusloaAndmed().getAadressid().getAadressList().forEach(
          aadress -> ((ArrayNode) stepZeroDataElementsNode.get("aadressid").get("value"))
              .addObject()
              .put("maakond", aadress.getMaakond())
              .put("omavalitsus", aadress.getOmavalitsus())
              .put("asula", aadress.getAsula())
              .put("aadress", aadress.getAdsAadressHumanReadable())
//              .put("jrkNr", aadress.getJrkNr())
//              .put("adsId", aadress.getAdsId().intValue())
//              .put("adsOid", aadress.getAdsOid())
//              .put("klElukoht", aadress.getKlElukoht())
//              .put("taisAadress", aadress.getTaisAadress())
//              .put("adsAadress", aadress.getAdsAadress())
      );

      stepZeroDataElementsNode.putObject("oppeasutuseNimetus").putArray("value")
          .add(response.getKontaktandmed().getKooliNimetus());
      stepZeroDataElementsNode.putObject("omanik").putArray("value")
          .add(response.getKontaktandmed().getOmanik());
      stepZeroDataElementsNode.putObject("kontaktisik").putArray("value")
          .add(response.getKontaktandmed().getKontaktisik());
      stepZeroDataElementsNode.putObject("telefon").putArray("value")
          .add(response.getKontaktandmed().getOppeasutuseYldtelefon());
      stepZeroDataElementsNode.putObject("epost").putArray("value")
          .add(response.getKontaktandmed().getOppeasutuseEpost());
      stepZeroDataElementsNode.putObject("koduleht").putArray("value")
          .add(response.getKontaktandmed().getKoduleht());

      stepZeroDataElementsNode.putObject("peatamised").putArray("value");
      response.getPeatamised().getPeatamineList().forEach(
          peatamine -> ((ArrayNode) stepZeroDataElementsNode.get("peatamised").get("value"))
              .addObject()
              .put("algusKp", peatamine.getAlgusKp())
              .put("loppKp", peatamine.getLoppKp()));

      stepZeroDataElementsNode.putObject("dokumendid").putArray("value");
      response.getDokumendid().getDokumentList().forEach(
          dokument -> {
            ((ArrayNode) stepZeroDataElementsNode.get("dokumendid").get("value")).addObject()
                .put("liik", dokument.getKlLiik())
                .put("kommentaar", dokument.getKommentaar())
                .putObject("fail")
                .put("file_name", dokument.getFailiNimi())
                .put("file_identifier", MTSYSFILE_KEY + dokument.getDokumentId());

            redisTemplate.opsForHash()
                .put(personalCode, MTSYSFILE_KEY + dokument.getDokumentId(), dokument.getContent());
          });

      if (response.isSetInfotekst()) {
        ((ArrayNode) jsonNode.get("body").get("messages")).add(
            response.getTegevusloaAndmed().isSetTaotlusId() ? "muudatusetaotlus" : "infotekst");
        ((ObjectNode) jsonNode.get("messages")).putObject(
            response.getTegevusloaAndmed().isSetTaotlusId() ? "muudatusetaotlus" : "infotekst")
            .put("message_type", "NOTICE")
            .putObject("message_text")
            .put("et", response.getTegevusloaAndmed().isSetTaotlusId() ?
                "Tegevusloa kohta on vormistatud muudatuse taotlus" : response.getInfotekst());
      }

    } catch (Exception e) {
      super.setXdzeisonError(LOGGER, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "ehis.mtsysTegevusluba.v1");

    return jsonNode;
  }

  public ObjectNode getMtsysOppeasutus(String identifier, String institutionId,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysOppeasutus.v1");

    try {
      MtsysOppeasutusResponse response = ehisXRoadService
          .mtsysOppeasutus(BigInteger.valueOf(Long.parseLong(identifier)), personalCode);

      if (response.isSetInfotekst()) {
        jsonNode.put("message", response.getInfotekst());
      }

      if (response.isSetOppeasutus()) {
        ObjectNode educationalInstitutionNode = jsonNode.putObject("educationalInstitution");
        if (response.getOppeasutus().isSetYldandmed()) {
          educationalInstitutionNode.putObject("generalData")
              .put("owner", response.getOppeasutus().getYldandmed().getOmanik())
              .put("name", response.getOppeasutus().getYldandmed().getOppeasutuseNimetus())
              .put("nameENG",
                  response.getOppeasutus().getYldandmed().getOppeasutuseNimetusIngliseKeeles())
              .put("ownerType", response.getOppeasutus().getYldandmed().getKlPidajaLiik())
              .put("ownershipType", response.getOppeasutus().getYldandmed().getKlOmandivorm())
              .put("studyInstitutionType",
                  response.getOppeasutus().getYldandmed().getKlOppeasutuseLiik());
        }

        if (response.getOppeasutus().isSetAadress()) {
          educationalInstitutionNode.putObject("address")
              .put("seqNo", response.getOppeasutus().getAadress().getJrkNr())
              .put("adsId", response.getOppeasutus().getAadress().getAdsId())
              .put("adsOid", response.getOppeasutus().getAadress().getAdsOid())
              .put("klElukoht", response.getOppeasutus().getAadress().getKlElukoht().intValue())
              .put("county", response.getOppeasutus().getAadress().getMaakond())
              .put("localGovernment", response.getOppeasutus().getAadress().getOmavalitsus())
              .put("settlementUnit", response.getOppeasutus().getAadress().getAsula())
              .put("address", response.getOppeasutus().getAadress().getAdsAadress())
              .put("addressFull", response.getOppeasutus().getAadress().getTaisAadress())
              .put("addressHumanReadable",
                  response.getOppeasutus().getAadress().getAdsAadressHumanReadable());
        }

        if (response.getOppeasutus().isSetKontaktandmed()) {
          educationalInstitutionNode.putObject("contacts")
              .put("contactPhone",
                  response.getOppeasutus().getKontaktandmed().getOppeasutuseYldtelefon())
              .put("contactEmail",
                  response.getOppeasutus().getKontaktandmed().getOppeasutuseEpost())
              .put("webpageAddress",
                  response.getOppeasutus().getKontaktandmed().getKoduleheAadress());
        }
      }
    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash()
          .put(institutionId, "educationalInstitution_" + identifier, "Tehniline viga!");

      jsonNode.putObject("error").put("message_type", "ERROR").putObject("message_text")
          .put("et", "Tehniline viga!");

      jsonNode.remove("educationalInstitution");
      jsonNode.remove("message");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "ehis.mtsysOppeasutus.v1");

    redisTemplate.opsForHash().put(institutionId, "educationalInstitution_" + identifier, jsonNode);

    return jsonNode;
  }

  public ObjectNode postMtsysLaeOppeasutus(ObjectNode jsonNodeRequest, String personalCode) {
    ObjectNode jsonNodeResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser("SYSTEM - XROAD");
    logForDrupal.setType("EHIS - mtsysLaeOppeasutus.v1");

    try {
      MtsysLaeOppeasutus request = MtsysLaeOppeasutus.Factory.newInstance();
      if (jsonNodeRequest.get("educationalInstitutionId") != null
          && !jsonNodeRequest.get("educationalInstitutionId").isNull()) {
        request.setOppeasutuseId(jsonNodeRequest.get("educationalInstitutionId")
            .bigIntegerValue()); //optional, olemas siis kui on muutmine, muidu tühi
      }
      request.setRegNr(jsonNodeRequest.get("ownerId").bigIntegerValue()); //tegelusload/asutus/regnr
      request.setNimetus(jsonNodeRequest.get("ownerName").asText()); //xsd optional / eesti.ee's mitte, tegevusload/asutus/nimetus

      OppeasutusDetail oppeasutusDetail = OppeasutusDetail.Factory.newInstance();

      if (jsonNodeRequest.get("educationalInstitution").get("generalData") != null) {
        MtsysOppeasutusAndmed oppeasutusAndmed = MtsysOppeasutusAndmed.Factory.newInstance();
        if (jsonNodeRequest.get("educationalInstitution").get("generalData").get("owner") != null) {
          oppeasutusAndmed.setOmanik(jsonNodeRequest.get("educationalInstitution")
              .get("generalData").get("owner").asText()); //optional olemas kui on muutmine, muidu tühi
        }
        oppeasutusAndmed.setOppeasutuseNimetus(jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("name").asText()); //lenght < 255
        if (jsonNodeRequest.get("educationalInstitution").get("generalData")
            .get("nameENG") != null) {
          oppeasutusAndmed.setOppeasutuseNimetusIngliseKeeles(
              jsonNodeRequest.get("educationalInstitution").get("generalData")
                  .get("nameENG").asText()); //optional , lenght < 255
        }
        oppeasutusAndmed.setKlPidajaLiik(jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("ownerType").asInt());
        oppeasutusAndmed.setKlOmandivorm(jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("ownershipType").asInt());
        oppeasutusAndmed.setKlOppeasutuseLiik(jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("studyInstitutionType").asInt());
        oppeasutusDetail.setYldandmed(oppeasutusAndmed);
      }

      if (jsonNodeRequest.get("educationalInstitution").get("address") != null) {
        Aadress aadress = Aadress.Factory.newInstance();
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("seqNo") != null) {
          aadress.setJrkNr(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("seqNo").asLong()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("adsId") != null) {
          aadress.setAdsId(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("adsId").bigIntegerValue()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("adsOid") != null) {
          aadress.setAdsOid(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("adsOid").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("klElukoht") != null) {
          aadress.setKlElukoht(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("klElukoht").bigIntegerValue()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("county") != null) {
          aadress.setMaakond(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("county").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("localGovernment") != null) {
          aadress.setOmavalitsus(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("localGovernment").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("settlementUnit") != null) {
          aadress.setAsula(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("settlementUnit").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("address") != null) {
          aadress.setTaisAadress(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("address").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("addressFull") != null) {
          aadress.setAdsAadress(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("addressFull").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("addressHumanReadable") != null) {
          aadress.setAdsAadressHumanReadable(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("addressHumanReadable").asText()); //optional
        }
        oppeasutusDetail.setAadress(aadress);
      }

      if (jsonNodeRequest.get("educationalInstitution").get("contacts") != null) {
        MtsysOppeasutusKontaktandmed oppeasutusKontaktandmed = MtsysOppeasutusKontaktandmed.Factory
            .newInstance();
        oppeasutusKontaktandmed.setOppeasutuseYldtelefon(
            jsonNodeRequest.get("educationalInstitution").get("contacts")
                .get("contactPhone").asText()); //lenght < 25 && matches(., '^\d{0,}$')
        oppeasutusKontaktandmed.setOppeasutuseEpost(jsonNodeRequest.get("educationalInstitution")
            .get("contacts").get("contactEmail").asText()); //lenght < 100
        oppeasutusKontaktandmed.setKoduleheAadress(jsonNodeRequest.get("educationalInstitution")
            .get("contacts").get("webpageAddress").asText()); //lenght < 255
        oppeasutusDetail.setKontaktandmed(oppeasutusKontaktandmed);
      }
      request.setOppeasutuseAndmed(oppeasutusDetail);

      MtsysLaeOppeasutusResponse response = ehisXRoadService
          .mtsysLaeOppeasutus(request, personalCode);

      if (response.isSetInfotekst()) {
        jsonNodeResponse.put("message", response.getInfotekst());
      }

      logForDrupal.setMessage("EHIS - mtsysLaeOppeasutus.v1 teenusega andmete lisamine õnnestus.");
    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      jsonNodeResponse.putObject("error").put("message_type", "ERROR")
          .putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "ehis.mtsysKlfTeenus.v1");

    return jsonNodeResponse;
  }

  public Object getMtsysTegevusNaitajad(String formName, String identifier, String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .putArray("acceptable_activity").add("VIEW");
    ((ObjectNode) jsonNode.get("header"))
        .put("current_step", "step_0")
        .put("identifier", identifier);
    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegevusnaitaja.v1");

    try {
      MtsysTegevusnaitaja request = MtsysTegevusnaitaja.Factory.newInstance();
      request.setAruandeId(BigInteger.valueOf(Long.parseLong(identifier)));

      MtsysTegevusnaitajaResponse response = ehisXRoadService
          .mtsysTegevusnaitaja(request, personalCode);

      ObjectNode step0DataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps"))
          .putObject("step_0").putObject("data_elements");

      step0DataElementsNode.putObject("aasta")
          .put("value", response.isSetAasta() ? response.getAasta().intValue() : null);
      step0DataElementsNode.putObject("staatus").put("value", response.isSetKlStaatus() ?
          response.getKlStaatus().getId().intValue() : null);
      step0DataElementsNode.putObject("esitamiseKp")
          .put("value", response.isSetEsitamiseKp() ? response.getEsitamiseKp() : null);
      step0DataElementsNode.putObject("kommentaar")
          .put("value", response.isSetKommentaar() ? response.getKommentaar() : null);

      step0DataElementsNode.putObject("majandustegevuseTeateTabel").putArray("value");
      step0DataElementsNode.putObject("tegevuslubaTabel").putArray("value");
      step0DataElementsNode.putObject("kokkuTabel").putArray("value");

      response.getNaitajad().getItemList().forEach(item -> {
        if (item.getKlOkLiik().equals(BigInteger.valueOf(-1L))) {
          ((ArrayNode) step0DataElementsNode.get("kokkuTabel").get("value")).addObject()
              .put("nimetus", item.isSetNimetus() ? item.getNimetus() : null)
              .put("oppijateArv", item.isSetOppijaArv() ? item.getOppijaArv().intValue() : null)
              .put("tunnistusteArv",
                  item.isSetTunnistusArv() ? item.getTunnistusArv().intValue() : null)
              .put("kuni8", item.isSetKuni8() ? item.getKuni8().intValue() : null)
              .put("kuni26", item.isSetKuni26() ? item.getKuni26().intValue() : null)
              .put("kuni80", item.isSetKuni80() ? item.getKuni80().intValue() : null)
              .put("kuni240", item.isSetKuni240() ? item.getKuni240().intValue() : null)
              .put("yle240", item.isSetYle240() ? item.getYle240().intValue() : null)
              .put("kokku", item.isSetKokku() ? item.getKokku().intValue() : null);
        } else if (item.getKlOkLiik().equals(BigInteger.valueOf(18098L))) {
          ((ArrayNode) step0DataElementsNode.get("majandustegevuseTeateTabel").get("value"))
              .addObject()
              .put("nimetus", item.isSetNimetus() ? item.getNimetus() : null)
              .put("oppijateArv", item.isSetOppijaArv() ? item.getOppijaArv().intValue() : null)
              .put("tunnistusteArv",
                  item.isSetTunnistusArv() ? item.getTunnistusArv().intValue() : null)
              .put("kuni8", item.isSetKuni8() ? item.getKuni8().intValue() : null)
              .put("kuni26", item.isSetKuni26() ? item.getKuni26().intValue() : null)
              .put("kuni80", item.isSetKuni80() ? item.getKuni80().intValue() : null)
              .put("kuni240", item.isSetKuni240() ? item.getKuni240().intValue() : null)
              .put("yle240", item.isSetYle240() ? item.getYle240().intValue() : null)
              .put("kokku", item.isSetKokku() ? item.getKokku().intValue() : null);
        } else {
          ((ArrayNode) step0DataElementsNode.get("tegevuslubaTabel").get("value")).addObject()
              .put("nimetus", item.isSetNimetus() ? item.getNimetus() : null)
              .put("oppijateArv", item.isSetOppijaArv() ? item.getOppijaArv().intValue() : null)
              .put("tunnistusteArv",
                  item.isSetTunnistusArv() ? item.getTunnistusArv().intValue() : null)
              .put("kuni8", item.isSetKuni8() ? item.getKuni8().intValue() : null)
              .put("kuni26", item.isSetKuni26() ? item.getKuni26().intValue() : null)
              .put("kuni80", item.isSetKuni80() ? item.getKuni80().intValue() : null)
              .put("kuni240", item.isSetKuni240() ? item.getKuni240().intValue() : null)
              .put("yle240", item.isSetYle240() ? item.getYle240().intValue() : null)
              .put("kokku", item.isSetKokku() ? item.getKokku().intValue() : null);
        }
      });

    } catch (Exception e) {
      super.setXdzeisonError(LOGGER, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logForDrupal, "ehis.mtsysTegevusnaitaja.v1");

    return jsonNode;
  }

  private ObjectNode getKlfNode(String hashKey) {
    ObjectNode result = (ObjectNode) redisTemplate.opsForHash().get(MTSYSKLF_KEY, hashKey);

    if (result == null) {
      getMtsysKlf();

      result = (ObjectNode) redisTemplate.opsForHash().get(MTSYSKLF_KEY, hashKey);
    }

    return result;
  }
}
