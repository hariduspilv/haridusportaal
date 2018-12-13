package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
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
            .put("required", item.getKohustuslik().equals(BigInteger.ONE));

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
                            >= currentDate.get(Calendar.YEAR) - 1);
                  }
                });
              }

              if (item.isSetTegevusload()) {
                item.getTegevusload().getTegevuslubaList().forEach(tegevusluba -> {
                  if (tegevusluba.getLiik().equalsIgnoreCase("18098")) {
                    if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("Sisestamisel") ||
                        tegevusluba.getMenetlusStaatus()
                            .equalsIgnoreCase("Tagastatud puudustega")) {
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
                    if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("Sisestamisel") ||
                        tegevusluba.getMenetlusStaatus()
                            .equalsIgnoreCase("Tagastatud puudustega")) {
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
                          .put("form_name", "MTSYS_TEGEVUSLUBA")
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

    redisTemplate.opsForHash().put(identifier, "mtsys", jsonNode);
  }

  public ObjectNode getMtsysTegevusluba(String formName, Long identifier, String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .put("current_step", "step_0")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("VIEW");

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegevusluba.v1");

    try {
      MtsysTegevuslubaResponse response = ehisXRoadService
          .mtsysTegevusluba(BigInteger.valueOf(identifier), personalCode);

      Long klOkLiik = response.getTegevusloaAndmed().getKlLiik().longValue();
      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_0").putObject("title")
          .put("et", klOkLiik.equals(18098L)
              ? "Majandustegevusteade" : "Tegevusluba");
      ObjectNode stepZeroDataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps")
          .get("step_0")).putObject("data_elements");

      stepZeroDataElementsNode.putObject("tegevusloaLiik")
          .put("value", response.getTegevusloaAndmed().getKlLiik().intValue());
      stepZeroDataElementsNode.putObject("tegevusloaStaatus")
          .put("value", response.getTegevusloaAndmed().getKlStaatus().intValue());
      stepZeroDataElementsNode.putObject("tegevusloaNumber")
          .put("value", response.getTegevusloaAndmed().getLoaNumber());
      stepZeroDataElementsNode.putObject("oppekavaNimetus").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetNimetus())
          .put("value", response.getTegevusloaAndmed().isSetNimetus() ?
              response.getTegevusloaAndmed().getNimetus() : null);
      stepZeroDataElementsNode.putObject("kaskkirjaNr").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKaskkirjaNr())
          .put("value", response.getTegevusloaAndmed().isSetKaskkirjaNr() ?
              response.getTegevusloaAndmed().getKaskkirjaNr() : null);
      stepZeroDataElementsNode.putObject("kaskkirjaKuupaev").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKaskkirjaKp())
          .put("value", response.getTegevusloaAndmed().isSetKaskkirjaKp() ?
              response.getTegevusloaAndmed().getKaskkirjaKp() : null);
      stepZeroDataElementsNode.putObject("alguseKuupaev")
          .put("hidden", !response.getTegevusloaAndmed().isSetKehtivAlates())
          .put("value", response.getTegevusloaAndmed().isSetKehtivAlates() ?
              response.getTegevusloaAndmed().getKehtivAlates() : null);
      stepZeroDataElementsNode.putObject("lopuKuupaev").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKehtivKuni())
          .put("value", response.getTegevusloaAndmed().isSetKehtivKuni() ?
              response.getTegevusloaAndmed().getKehtivKuni() : null);
      stepZeroDataElementsNode.putObject("tuhistamiseKuupaev").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetTyhistamiseKp())
          .put("value", response.getTegevusloaAndmed().isSetTyhistamiseKp() ?
              response.getTegevusloaAndmed().getTyhistamiseKp() : null);
      stepZeroDataElementsNode.putObject("laagriNimetus").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetLaagriNimetus())
          .put("value", response.getTegevusloaAndmed().isSetLaagriNimetus() ?
              response.getTegevusloaAndmed().getLaagriNimetus() : null);
      stepZeroDataElementsNode.putObject("kohtadeArvLaagris").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKohtadeArvLaagris())
          .put("value", response.getTegevusloaAndmed().isSetKohtadeArvLaagris() ?
              response.getTegevusloaAndmed().getKohtadeArvLaagris().intValue() : null);
      stepZeroDataElementsNode.putObject("tkkLiik").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKlTkkLiik())
          .put("value", response.getTegevusloaAndmed().isSetKlTkkLiik() ?
              response.getTegevusloaAndmed().getKlTkkLiik().intValue() : null);
      stepZeroDataElementsNode.putObject("keeleTase").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKlEkTase())
          .put("value", response.getTegevusloaAndmed().isSetKlEkTase() ?
              response.getTegevusloaAndmed().getKlEkTase().intValue() : null);
      stepZeroDataElementsNode.putObject("soidukiteKategooria").put("hidden",
          klOkLiik.equals(18098L) || !response.getTegevusloaAndmed().isSetKlSoidukiKategooria())
          .put("value", response.getTegevusloaAndmed().isSetKlSoidukiKategooria() ?
              response.getTegevusloaAndmed().getKlSoidukiKategooria().intValue() : null);

      stepZeroDataElementsNode.putObject("oppeTasemed").putArray("value");
      response.getTegevusloaAndmed().getOppetasemed().getOppekavaOppetaseList().forEach(
          ehisKlassifikaator -> ((ArrayNode) stepZeroDataElementsNode.get("oppeTasemed")
              .get("value")).addObject().put("nimetus", ehisKlassifikaator.getOnKehtiv()
              ? ehisKlassifikaator.getNimetus() : ehisKlassifikaator.getNimetus() + " (Kehtetu)"));

      stepZeroDataElementsNode.putObject("oppekavaRuhmad").putArray("value");
      response.getTegevusloaAndmed().getOpperyhmad().getOpperyhmList().forEach(
          ehisKlassifikaator -> ((ArrayNode) stepZeroDataElementsNode.get("oppekavaRuhmad")
              .get("value")).addObject().put("nimetus", ehisKlassifikaator.getOnKehtiv()
              ? ehisKlassifikaator.getNimetus() : ehisKlassifikaator.getNimetus() + " (Kehtetu)"));

      stepZeroDataElementsNode.putObject("valisAadress")
          .put("value", response.getTegevusloaAndmed().getAadressid().getOnValismaa());

      stepZeroDataElementsNode.putObject("aadressid").putArray("value");
      response.getTegevusloaAndmed().getAadressid().getAadressList().forEach(
          aadress -> ((ArrayNode) stepZeroDataElementsNode.get("aadressid").get("value"))
              .addObject().put("county", aadress.getMaakond())
              .put("localGovernment", aadress.getOmavalitsus())
              .put("settlementUnit", aadress.getAsula())
              .put("addressHumanReadable", aadress.getAdsAadressHumanReadable()));

      stepZeroDataElementsNode.putObject("oppeasutuseNimetus")
          .put("value", response.getKontaktandmed().getKooliNimetus());
      stepZeroDataElementsNode.putObject("omanik")
          .put("value", response.getKontaktandmed().getOmanik());
      stepZeroDataElementsNode.putObject("kontaktisik")
          .put("value", response.getKontaktandmed().getKontaktisik());
      stepZeroDataElementsNode.putObject("telefon")
          .put("value", response.getKontaktandmed().getOppeasutuseYldtelefon());
      stepZeroDataElementsNode.putObject("epost")
          .put("value", response.getKontaktandmed().getOppeasutuseEpost());
      stepZeroDataElementsNode.putObject("koduleht")
          .put("value", response.getKontaktandmed().getKoduleht());

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
                .put("file_identifier", MTSYSFILE_KEY + "_" + dokument.getDokumentId());

            redisTemplate.opsForHash()
                .put(personalCode, MTSYSFILE_KEY + "_" + dokument.getDokumentId(),
                    dokument.getContent());
          });

      stepZeroDataElementsNode.putObject("lisainfo")
          .put("hidden", !response.getTegevusloaAndmed().isSetLisainfo())
          .put("value", response.getTegevusloaAndmed().isSetLisainfo() ?
              response.getTegevusloaAndmed().getLisainfo() : null);

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

    return jsonNode;
  }

  public ObjectNode getMtsysTegevuslubaTaotlus(String formName, Long identifier,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();
    ObjectNode klfFailiTyybid = getKlfNode("failiTyybid");

    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .put("current_step", "step_andmed")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("SAVE").add("SUBMIT");

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegevusluba.v1");

    try {
      MtsysTegevuslubaResponse response = ehisXRoadService
          .mtsysTegevusluba(BigInteger.valueOf(identifier), personalCode);

      ((ObjectNode) jsonNode.get("header")).put("identifier",
          response.getTegevusloaAndmed().isSetId() ?
              response.getTegevusloaAndmed().getId().longValue() : identifier);

      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_liik")
          .putObject("tegevusloaLiik")
          .put("value", response.getTegevusloaAndmed().getKlLiik().longValue());

      getTegevuslubaXJSON(jsonNode, response.getTegevusloaAndmed().getKlLiik().longValue(),
          klfFailiTyybid);

      ObjectNode stepAndmedDataElements = (ObjectNode) jsonNode.get("body").get("steps")
          .get("step_andmed").get("data_elements");

      ((ObjectNode) stepAndmedDataElements.get("tegevusloaLiik"))
          .put("value", response.getTegevusloaAndmed().getKlLiik().longValue());
      ((ObjectNode) stepAndmedDataElements.get("oppekavaNimetus"))
          .put("value", response.getTegevusloaAndmed().getNimetus());
      ((ObjectNode) stepAndmedDataElements.get("alguseKuupaev"))
          .put("value", response.getTegevusloaAndmed().getKehtivAlates());
      ((ObjectNode) stepAndmedDataElements.get("lopuKuupaev"))
          .put("value", response.getTegevusloaAndmed().getKehtivKuni());
      ((ObjectNode) stepAndmedDataElements.get("laagriNimetus"))
          .put("value", response.getTegevusloaAndmed().getLaagriNimetus());
      ((ObjectNode) stepAndmedDataElements.get("kohtadeArvLaagris"))
          .put("value", response.getTegevusloaAndmed().isSetKohtadeArvLaagris() ?
              response.getTegevusloaAndmed().getKohtadeArvLaagris().longValue() : null);
      ((ObjectNode) stepAndmedDataElements.get("tkkLiik"))
          .put("value", response.getTegevusloaAndmed().isSetKlTkkLiik() ?
              response.getTegevusloaAndmed().getKlTkkLiik().longValue() : null);
      ((ObjectNode) stepAndmedDataElements.get("keeleTase"))
          .put("value", response.getTegevusloaAndmed().isSetKlEkTase() ?
              response.getTegevusloaAndmed().getKlEkTase().longValue() : null);
      ((ObjectNode) stepAndmedDataElements.get("soidukiteKategooria"))
          .put("value", response.getTegevusloaAndmed().isSetKlSoidukiKategooria() ?
              response.getTegevusloaAndmed().getKlSoidukiKategooria().longValue() : null);

      response.getTegevusloaAndmed().getOppetasemed().getOppekavaOppetaseList()
          .forEach(item -> ((ArrayNode) stepAndmedDataElements.get("oppeTasemed").get("value"))
              .addObject().put("id", item.getId().longValue())
              .put("nimetus", item.getNimetus())
              .put("onKehtiv", item.getOnKehtiv()));

      response.getTegevusloaAndmed().getOpperyhmad().getOpperyhmList()
          .forEach(item -> ((ArrayNode) stepAndmedDataElements.get("oppekavaRuhmad").get("value"))
              .addObject().put("id", item.getId().longValue())
              .put("nimetus", item.getNimetus())
              .put("onKehtiv", item.getOnKehtiv()));

      ((ObjectNode) stepAndmedDataElements.get("valisAadress"))
          .put("value", response.getTegevusloaAndmed().getAadressid().getOnValismaa());
      response.getTegevusloaAndmed().getAadressid().getAadressList()
          .forEach(item -> ((ArrayNode) stepAndmedDataElements.get("aadressid").get("value"))
              .addObject().put("seqNo", item.getJrkNr())
              .put("adsId", item.getAdsId().longValue())
              .put("adsOid", item.getAdsOid())
              .put("klElukoht", item.getKlElukoht().longValue())
              .put("county", item.getMaakond())
              .put("localGovernment", item.getOmavalitsus())
              .put("settlementUnit", item.getAsula())
              .put("address", item.getAdsAadress())
              .put("addressFull", item.getTaisAadress())
              .put("addressHumanReadable", item.getAdsAadressHumanReadable()));

      ((ObjectNode) stepAndmedDataElements.get("oppeasutuseNimetus"))
          .put("value", response.getKontaktandmed().getKooliNimetus());
      ((ObjectNode) stepAndmedDataElements.get("omanik"))
          .put("value", response.getKontaktandmed().getOmanik());
      ((ObjectNode) stepAndmedDataElements.get("kontaktisik"))
          .put("value", response.getKontaktandmed().getKontaktisik());
      ((ObjectNode) stepAndmedDataElements.get("telefon"))
          .put("value", response.getKontaktandmed().getOppeasutuseYldtelefon());
      ((ObjectNode) stepAndmedDataElements.get("epost"))
          .put("value", response.getKontaktandmed().getOppeasutuseEpost());
      ((ObjectNode) stepAndmedDataElements.get("koduleht"))
          .put("value", response.getKontaktandmed().getKoduleht());

      response.getDokumendid().getDokumentList().forEach(item -> {
        ObjectNode fileType = (ObjectNode) klfFailiTyybid
            .get(response.getTegevusloaAndmed().getKlLiik().toString())
            .get(String.valueOf(item.getKlLiik()));

        ((ArrayNode) stepAndmedDataElements.get("dokumendid").get("value")).addObject()
            .put("liik", fileType.get("required").asBoolean() ?
                fileType.get("et").asText() + " (Kohustuslik)" :
                fileType.get("et").asText())
            .put("klLiik", item.getKlLiik())
            .put("kommentaar", item.getKommentaar())
            .put("required", fileType.get("required").asBoolean())
            .putObject("fail").put("file_name", item.getFailiNimi())
            .put("file_identifier", MTSYSFILE_KEY + "_" + item.getDokumentId());

        redisTemplate.opsForHash()
            .put(personalCode, MTSYSFILE_KEY + "_" + item.getDokumentId(),
                item.getContent());
      });

      ((ObjectNode) stepAndmedDataElements.get("kommentaar"))
          .put("value", response.getTegevusloaAndmed().getLisainfo());

    } catch (Exception e) {
      super.setXdzeisonError(LOGGER, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));

    return jsonNode;
  }

  public ObjectNode postMtsysTegevusluba(ObjectNode jsonNode) {
    String currentStep = jsonNode.get("header").get("current_step").isNull() ? null
        : jsonNode.get("header").get("current_step").asText();
    Long applicationId = jsonNode.get("header").get("identifier").isNull()
        || Long.valueOf(0).equals(jsonNode.get("header").get("identifier").longValue()) ?
        null : jsonNode.get("header").get("identifier").asLong();
    String applicantPersonalCode = jsonNode.get("header").get("agents").get(0).get("person_id")
        .asText();

    List<String> acceptableActivity = new ArrayList<>();
    jsonNode.get("header").get("acceptable_activity")
        .forEach(i -> acceptableActivity.add(i.asText()));

    if (acceptableActivity.contains("VIEW")) {
      return jsonNode;
    }

    if (currentStep == null) {
      jsonNode.putObject("body").putObject("steps");
      ((ObjectNode) jsonNode.get("body")).putArray("messages");
      jsonNode.putObject("messages");

      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_liik")
          .putObject("tegevusloaLiik").putNull("value");

      ((ObjectNode) jsonNode.get("header")).put("current_step", "step_liik");
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("CONTINUE");
    } else if (currentStep.equalsIgnoreCase("step_liik")) {
      getTegevuslubaXJSON(jsonNode,
          jsonNode.get("body").get("steps").get("step_liik").get("tegevusloaLiik").get("value")
              .asLong(), getKlfNode("failiTyybid"));

      ((ObjectNode) jsonNode.get("header")).put("current_step", "step_andmed");
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll()
          .add("SAVE, SUBMIT");
    }

    return jsonNode;
  }

  public ObjectNode getMtsysOppeasutus(Long identifier, String institutionId,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysOppeasutus.v1");

    try {
      MtsysOppeasutusResponse response = ehisXRoadService
          .mtsysOppeasutus(BigInteger.valueOf(identifier), personalCode);

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
          && !jsonNodeRequest.get("educationalInstitutionId").isNull()
          && !jsonNodeRequest.get("educationalInstitutionId").asText().equalsIgnoreCase("")) {
        request.setOppeasutuseId(jsonNodeRequest.get("educationalInstitutionId")
            .bigIntegerValue()); //optional, olemas siis kui on muutmine, muidu tühi
      }
      request.setRegNr(jsonNodeRequest.get("ownerId").bigIntegerValue()); //tegelusload/asutus/regnr
      request.setNimetus(jsonNodeRequest.get("ownerName")
          .asText()); //xsd optional / eesti.ee's mitte, tegevusload/asutus/nimetus

      OppeasutusDetail oppeasutusDetail = OppeasutusDetail.Factory.newInstance();

      if (jsonNodeRequest.get("educationalInstitution").get("generalData") != null) {
        MtsysOppeasutusAndmed oppeasutusAndmed = MtsysOppeasutusAndmed.Factory.newInstance();
        if (jsonNodeRequest.get("educationalInstitution").get("generalData").get("owner") != null
            && !jsonNodeRequest.get("educationalInstitution").get("generalData").get("owner")
            .asText().equalsIgnoreCase("")) {
          oppeasutusAndmed.setOmanik(jsonNodeRequest.get("educationalInstitution")
              .get("generalData").get("owner")
              .asText()); //optional olemas kui on muutmine, muidu tühi
        }
        oppeasutusAndmed.setOppeasutuseNimetus(jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("name").asText()); //lenght < 255
        if (jsonNodeRequest.get("educationalInstitution").get("generalData")
            .get("nameENG") != null && !jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("nameENG").asText().equalsIgnoreCase("")) {
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
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("seqNo") != null
            && !jsonNodeRequest.get("educationalInstitution").get("address").get("seqNo").asText()
            .equalsIgnoreCase("")) {
          aadress.setJrkNr(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("seqNo").asLong()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("adsId") != null
            && !jsonNodeRequest.get("educationalInstitution").get("address").get("adsId").asText()
            .equalsIgnoreCase("")) {
          aadress.setAdsId(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("adsId").bigIntegerValue()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("adsOid") != null
            && !jsonNodeRequest.get("educationalInstitution").get("address").get("adsOid").asText()
            .equalsIgnoreCase("")) {
          aadress.setAdsOid(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("adsOid").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("klElukoht") != null
            && !jsonNodeRequest.get("educationalInstitution").get("address").get("klElukoht")
            .asText().equalsIgnoreCase("")) {
          aadress.setKlElukoht(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("klElukoht").bigIntegerValue()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("county") != null
            && !jsonNodeRequest.get("educationalInstitution").get("address").get("county").asText()
            .equalsIgnoreCase("")) {
          aadress.setMaakond(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("county").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("localGovernment") != null && !jsonNodeRequest.get("educationalInstitution")
            .get("address").get("localGovernment").asText().equalsIgnoreCase("")) {
          aadress.setOmavalitsus(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("localGovernment").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("settlementUnit") != null && !jsonNodeRequest.get("educationalInstitution")
            .get("address").get("settlementUnit").asText().equalsIgnoreCase("")) {
          aadress.setAsula(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("settlementUnit").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address").get("address") != null
            && !jsonNodeRequest.get("educationalInstitution").get("address").get("address").asText()
            .equalsIgnoreCase("")) {
          aadress.setTaisAadress(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("address").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("addressFull") != null && !jsonNodeRequest.get("educationalInstitution")
            .get("address").get("addressFull").asText().equalsIgnoreCase("")) {
          aadress.setAdsAadress(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("addressFull").asText()); //optional
        }
        if (jsonNodeRequest.get("educationalInstitution").get("address")
            .get("addressHumanReadable") != null && !jsonNodeRequest.get("educationalInstitution")
            .get("address").get("addressHumanReadable").asText().equalsIgnoreCase("")) {
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

    return jsonNodeResponse;
  }

  public ObjectNode getMtsysTegevusNaitajad(String formName, Long identifier,
      String personalCode) {
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
      request.setAruandeId(BigInteger.valueOf(identifier));

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

  private void getTegevuslubaXJSON(ObjectNode jsonNode, Long klOkLiik,
      ObjectNode klfFailiTyybid) {

    ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_andmed")
        .putObject("title")
        .put("value", klOkLiik.equals(18098L) ? "Majandustegevusteade" : "Tegevusluba");

    ObjectNode stepAndmedDataElements = ((ObjectNode) jsonNode.get("body").get("steps")
        .get("step_andmed")).putObject("data_elements");

    stepAndmedDataElements.putObject("tegevusloaLiik")
        .put("value", klOkLiik);
    stepAndmedDataElements.putObject("oppekavaNimetus")
        .putNull("value")
        .put("required",
            !klOkLiik.equals(18052L) && !klOkLiik.equals(18189L) && !klOkLiik.equals(18098L))
        .put("hidden",
            klOkLiik.equals(18052L) || klOkLiik.equals(18189L) || klOkLiik.equals(18098L));
    stepAndmedDataElements.putObject("alguseKuupaev")
        .putNull("value")
        .put("required", klOkLiik.equals(18189L))
        .put("hidden", !klOkLiik.equals(18189L));
    stepAndmedDataElements.putObject("lopuKuupaev")
        .putNull("value")
        .put("required", klOkLiik.equals(18189L))
        .put("hidden", !klOkLiik.equals(18189L));
    stepAndmedDataElements.putObject("laagriNimetus")
        .putNull("value")
        .put("required", klOkLiik.equals(18052L) || klOkLiik.equals(18189L))
        .put("hidden", !(klOkLiik.equals(18052L) || klOkLiik.equals(18189L)));
    stepAndmedDataElements.putObject("kohtadeArvLaagris")
        .putNull("value")
        .put("required", klOkLiik.equals(18052L) || klOkLiik.equals(18189L))
        .put("hidden", !(klOkLiik.equals(18052L) || klOkLiik.equals(18189L)));
    stepAndmedDataElements.putObject("tkkLiik")
        .putNull("value")
        .put("required", klOkLiik.equals(18101L))
        .put("hidden", !klOkLiik.equals(18101L));
    stepAndmedDataElements.putObject("keeleTase")
        .putNull("value")
        .put("required", klOkLiik.equals(18100L))
        .put("hidden", !klOkLiik.equals(18100L));
    stepAndmedDataElements.putObject("soidukiteKategooria")
        .putNull("value")
        .put("required", klOkLiik.equals(18055L))
        .put("hidden", !klOkLiik.equals(18055L));

    stepAndmedDataElements.putObject("oppeTasemed")
        .put("required", klOkLiik.equals(18057L))
        .put("hidden", !klOkLiik.equals(18057L))
        .put("add_del_rows", true)
        .putArray("value");

    stepAndmedDataElements.putObject("oppekavaRuhmad")
        .put("required", klOkLiik.equals(18098L))
        .put("hidden", !klOkLiik.equals(18098L))
        .put("add_del_rows", true)
        .putArray("value");

    stepAndmedDataElements.putObject("valisAadress")
        .put("value", false)
        .put("required", false)
        .put("hidden", false);
    stepAndmedDataElements.putObject("aadressid")
        .put("required", false)
        .put("hidden", false)
        .put("add_del_rows", true)
        .putArray("value");

    stepAndmedDataElements.putObject("oppeasutuseNimetus")
        .putNull("value")
        .put("required", false)
        .put("hidden", false);
    stepAndmedDataElements.putObject("omanik")
        .putNull("value")
        .put("required", false)
        .put("hidden", false);
    stepAndmedDataElements.putObject("kontaktisik")
        .putNull("value")
        .put("required", true)
        .put("hidden", false);
    stepAndmedDataElements.putObject("telefon")
        .putNull("value")
        .put("required", true)
        .put("hidden", false);
    stepAndmedDataElements.putObject("epost")
        .putNull("value")
        .put("required", true)
        .put("hidden", false);
    stepAndmedDataElements.putObject("koduleht")
        .putNull("value")
        .put("required", true)
        .put("hidden", false);

    stepAndmedDataElements.putObject("dokumendid").put("hidden", false);
    ArrayNode dokumendidValue = ((ObjectNode) stepAndmedDataElements.get("dokumendid"))
        .putArray("value");
    if (!klOkLiik.equals(18098L)) {
      Iterator<Entry<String, JsonNode>> fileTypes = klfFailiTyybid.get(klOkLiik.toString())
          .fields();
      while (fileTypes.hasNext()) {
        Entry<String, JsonNode> fileType = fileTypes.next();
        if (!fileType.getKey().equalsIgnoreCase("et")) {
          dokumendidValue.addObject()
              .put("liik", fileType.getValue().get("required").asBoolean() ?
                  fileType.getValue().get("et").asText() + " (Kohustuslik)" :
                  fileType.getValue().get("et").asText())
              .put("klLiik", Long.valueOf(fileType.getKey()))
              .put("required", fileType.getValue().get("required").asBoolean());
        }
      }
    } else {
      ((ObjectNode) stepAndmedDataElements.get("dokumendid")).put("hidden", true);
    }

    stepAndmedDataElements.putObject("kommentaar")
        .putNull("value")
        .put("required", false)
        .put("hidden", false);
  }
}
