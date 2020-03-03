package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Aadress;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Aadressid;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Dokumendid;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Dokument;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EhisKlassifikaator;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysDokumentResponseDocument.MtsysDokumentResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaDocument.MtsysEsitaTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaResponseDocument.MtsysEsitaTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevusnaitajadDocument.MtsysEsitaTegevusnaitajad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevusnaitajadResponseDocument.MtsysEsitaTegevusnaitajadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKustutaTegevuslubaResponseDocument.MtsysKustutaTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusDocument.MtsysLaeOppeasutus;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeOppeasutusResponseDocument.MtsysLaeOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaDocument.MtsysLaeTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaResponseDocument.MtsysLaeTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevusnaitajadDocument.MtsysLaeTegevusnaitajad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevusnaitajadResponseDocument.MtsysLaeTegevusnaitajadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusAndmed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusKontaktandmed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysOppeasutusResponseDocument.MtsysOppeasutusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTaotlusKontaktandmed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusloadResponseDocument.MtsysTegevusloadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaResponseDocument.MtsysTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaDocument.MtsysTegevusnaitaja;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaResponseDocument.MtsysTegevusnaitajaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Naitajad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.OppeasutusDetail;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Oppekava;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.OppekavaOppetasemed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Opperyhmad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Taotlus;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.TnItem;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;

public class MtsysWorker extends Worker {

  private static final Logger log = LoggerFactory.getLogger(MtsysWorker.class);

  private static final String MTSYSKLF_KEY = "klassifikaator";
  private static final String MTSYSFILE_KEY = "mtsysFile";

  private EhisXRoadService ehisXRoadService;

  private RedisTemplate<String, String> redisFileTemplate;

  public MtsysWorker(EhisXRoadService ehisXRoadService, RedisTemplate<String, Object> redisTemplate,
      RedisTemplate<String, String> redisFileTemplate, Long redisExpire, Long redisFileExpire,
      Long redisKlfExpire) {
    super(redisTemplate, redisExpire, redisFileExpire, redisKlfExpire);
    this.ehisXRoadService = ehisXRoadService;
    this.redisFileTemplate = redisFileTemplate;
  }

  public ObjectNode getMtsysKlf() {
    ObjectNode mtsysKlfResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser("SYSTEM - XROAD");
    logForDrupal.setType("EHIS - mtsysKlfTeenus.v1");
    logForDrupal.setSeverity("notice");

    try {
      MtsysKlfTeenusResponse response = ehisXRoadService.mtsysKlfTeenus(null);

      ObjectNode tegevusloaLiigidNode = mtsysKlfResponse.putObject("tegevusloaLiigid");
      response.getTegevusloaLiigid().getTegevusloaLiikList().forEach(
          item -> tegevusloaLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      ((ObjectNode) tegevusloaLiigidNode.get("18098")).put("valid", true);
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tegevusloaLiigid", tegevusloaLiigidNode);

      ObjectNode oppekavaStaatusedNode = mtsysKlfResponse.putObject("oppekavaStaatused");
      response.getOppekavaStaatused().getOppekavaStaatusList().forEach(
          item -> oppekavaStaatusedNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      oppekavaStaatusedNode.putObject("18472").put("et", "Esitatud").put("valid", true);
      oppekavaStaatusedNode.putObject("18471").put("et", "Sisestamisel").put("valid", true);
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
      response.getFailiTyybid().getFailiTyypList().forEach(item -> {
        if (failiTyybidNode.get(item.getKlFailTyyp().toString()) != null) {
          ((ArrayNode) failiTyybidNode.get(item.getKlFailTyyp().toString()).get("okLiik"))
              .addObject().put("required", item.getKohustuslik().equals(BigInteger.ONE))
              .put("klOkLiik", item.getKlOkLiik().toString())
              .put("okLiik", item.getOkLiik());
        } else {
          failiTyybidNode.putObject(item.getKlFailTyyp().toString())
              .put("et", item.getFailTyyp())
              .putArray("okLiik").addObject()
              .put("required", item.getKohustuslik().equals(BigInteger.ONE))
              .put("klOkLiik", item.getKlOkLiik().toString())
              .put("okLiik", item.getOkLiik());
        }
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
              .put("valid", !item.getId().equals(BigInteger.valueOf(14857L))
                  && !item.getId().equals(BigInteger.valueOf(14858L))
                  && !item.getId().equals(BigInteger.valueOf(14859L))
                  && !item.getId().equals(BigInteger.valueOf(14860L))
                  && !item.getId().equals(BigInteger.valueOf(14861L))
                  && !item.getId().equals(BigInteger.valueOf(14862L))
                  && !item.getId().equals(BigInteger.valueOf(15651L)) && item.getOnKehtiv()));
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

      redisTemplate.expire(MTSYSKLF_KEY, redisKlfExpire, TimeUnit.MINUTES);

      logForDrupal.setMessage("EHIS - mtsysKlfTeenus.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      mtsysKlfResponse.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return mtsysKlfResponse;
  }

  public void getMtsystegevusLoad(String identifier) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(identifier);
    logForDrupal.setType("EHIS - mtsysTegevuslaod.v1");
    logForDrupal.setSeverity("notice");

    try {
      ObjectNode tegevusloaLiigidNode = getKlfNode("tegevusloaLiigid");

      MtsysTegevusloadResponse response = ehisXRoadService.mtsysTegevusload(identifier, null);

      jsonNode.put("message", response.isSetInfotekst() ? response.getInfotekst() : null)
          .put("ownerid", response.isSetAsutus() ? response.getAsutus().getRegNr() : null);

      if (response.isSetAsutus() && response.getAsutus().isSetOppeasutused()) {
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

              if (item.isSetTegevusnaitajad()) {
                item.getTegevusnaitajad().getTegevusnaitajaList().forEach(tegevusnaitaja -> {
                  if (!tegevusnaitaja.isSetEsitamiseKp() && !tegevusnaitaja.isSetId()
                      && !tegevusnaitaja.isSetMenetlusStaatus()) {
                    ((ArrayNode) itemNode.get("acceptable_forms")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSNAITAJAD_ARUANNE")
                        .put("description", tegevusnaitaja.getAasta().intValue());
                  } else if (!tegevusnaitaja.getMenetlusStaatus().equalsIgnoreCase("Esitatud")) {
                    ((ArrayNode) itemNode.get("drafts")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSNAITAJAD_ARUANNE")
                        .put("id", tegevusnaitaja.getId().intValue())
                        .put("document_date", tegevusnaitaja.getEsitamiseKp())
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
                  String description = tegevusloaLiigidNode.get(tegevusluba.getLiik())
                      .get("et").asText();
                  description += tegevusluba.isSetLoaNumber() ?
                      " number " + tegevusluba.getLoaNumber() : "";
                  description += tegevusluba.isSetKehtivAlates() ?
                      " kehtivusega alates " + tegevusluba.getKehtivAlates() : "";
                  description += tegevusluba.isSetKehtivKuni() ?
                      " kuni " + tegevusluba.getKehtivKuni() : "";
                  description += tegevusluba.isSetTyhistamiseKp() ?
                      " tühistatud " + tegevusluba.getTyhistamiseKp() : "";

                  if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("Sisestamisel")
                      || tegevusluba.getMenetlusStaatus()
                      .equalsIgnoreCase("Tagastatud puudustega")) {
                    description = tegevusloaLiigidNode.get(tegevusluba.getLiik()).get("et")
                        .asText();
                    description += tegevusluba.getMenetlusStaatus()
                        .equalsIgnoreCase("Tagastatud puudustega")
                        ? ". Taotlus on puudustega ja tagastatud taotlejale täiendamiseks" : "";
                    ((ArrayNode) itemNode.get("drafts")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSLUBA_TAOTLUS")
                        .put("id", tegevusluba.isSetId() ? tegevusluba.getId().intValue() : null)
                        .put("document_date",
                            tegevusluba.isSetLoomiseKp() ? tegevusluba.getLoomiseKp() : null)
                        .put("description", description);
                  } else {
                    ((ArrayNode) itemNode.get("documents")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSLUBA")
                        .put("id", tegevusluba.getId().intValue())
                        .put("document_date",
                            tegevusluba.getMenetlusStaatus()
                                .equalsIgnoreCase("Ära saadetud") ?
                                tegevusluba.getLoomiseKp() : tegevusluba.getKehtivAlates())
                        .put("status", tegevusluba.getMenetlusStaatus())
                        .put("description", description);
                  }

                  if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("Registreeritud")
                      && !(tegevusluba.getLiik().equalsIgnoreCase("18057")
                      || tegevusluba.getLiik().equalsIgnoreCase("18058")
                      || tegevusluba.getLiik().equalsIgnoreCase("18102"))) {
                    ((ArrayNode) itemNode.get("acceptable_forms")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSLUBA_SULGEMINE_TAOTLUS")
                        .put("id", tegevusluba.getId().intValue())
                        .put("document_date", tegevusluba.getKehtivAlates())
                        .put("status", tegevusluba.getMenetlusStaatus())
                        .put("description", description);
                  }

                  if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("Registreeritud")
                      && (tegevusluba.getLiik().equalsIgnoreCase("18057")
                      || tegevusluba.getLiik().equalsIgnoreCase("18058")
                      || tegevusluba.getLiik().equalsIgnoreCase("18102"))) {
                    ((ArrayNode) itemNode.get("acceptable_forms")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSLUBA_MUUTMINE_TAOTLUS")
                        .put("id", tegevusluba.getId().intValue())
                        .put("document_date", tegevusluba.getKehtivAlates())
                        .put("status", tegevusluba.getMenetlusStaatus())
                        .put("description", description);
                  }

                  if (tegevusluba.getMenetlusStaatus().equalsIgnoreCase("Esitatud")
                      && tegevusluba.getLiik().equalsIgnoreCase("18098")) {
                    ((ArrayNode) itemNode.get("acceptable_forms")).addObject()
                        .put("form_name", "MTSYS_TEGEVUSLUBA_LOPETAMINE_TAOTLUS")
                        .put("id", tegevusluba.getId().intValue())
                        .put("document_date", tegevusluba.getKehtivAlates())
                        .put("status", tegevusluba.getMenetlusStaatus())
                        .put("description", description);
                  }
                });
              }
            });
      }

      logForDrupal.setMessage("EHIS - mtsysTegevuslaod.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());
      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      jsonNode.removeAll();
      jsonNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    redisTemplate.opsForHash().put(identifier, "mtsys", jsonNode);
    redisTemplate.expire(identifier, redisExpire, TimeUnit.MINUTES);
  }

  public ObjectNode getMtsysTegevusluba(String formName, Long identifier, String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    createTegevuslubaXJSON(formName, identifier, personalCode, jsonNode);
    ((ObjectNode) jsonNode.get("header")).put("current_step", "step_0");

    try {
      MtsysTegevuslubaResponse response = ehisXRoadService
          .mtsysTegevusluba(BigInteger.valueOf(identifier), personalCode);

      Long klOkLiik = response.getTegevusloaAndmed().getKlLiik().longValue();
      Long klStaatus = response.getTegevusloaAndmed().getKlStaatus().longValue();
      addAcceptableFormToHeader(jsonNode, klOkLiik, klStaatus);

      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_0").putObject("title")
          .put("et", klOkLiik.equals(18098L)
              ? "Majandustegevusteade" : "Tegevusluba");
      ObjectNode stepZeroDataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps")
          .get("step_0")).putObject("data_elements");

      stepZeroDataElementsNode.putObject("tegevusloaLiik")
          .put("value", klOkLiik.intValue());
      stepZeroDataElementsNode.putObject("tegevusloaStaatus")
          .put("value", klStaatus.intValue());
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

      stepZeroDataElementsNode.putObject("oppeTasemed").put("hidden",
          !klOkLiik.equals(18057L) && !klOkLiik.equals(18102L)).putArray("value");
      response.getTegevusloaAndmed().getOppetasemed().getOppekavaOppetaseList().forEach(
          ehisKlassifikaator -> ((ArrayNode) stepZeroDataElementsNode.get("oppeTasemed")
              .get("value")).addObject().put("nimetus", ehisKlassifikaator.getId().toString()));

      stepZeroDataElementsNode.putObject("oppekavaRuhmad").put("hidden", !klOkLiik.equals(18098L))
          .putArray("value");
      response.getTegevusloaAndmed().getOpperyhmad().getOpperyhmList().forEach(
          ehisKlassifikaator -> ((ArrayNode) stepZeroDataElementsNode.get("oppekavaRuhmad")
              .get("value")).addObject().put("nimetus", ehisKlassifikaator.getId().toString()));

      stepZeroDataElementsNode.putObject("valisAadress");
      stepZeroDataElementsNode.putObject("aadressid").putArray("value");
      setAadress(response.getTegevusloaAndmed().getAadressid(), stepZeroDataElementsNode);

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

      stepZeroDataElementsNode.putObject("peatamised").put("hidden",
          !response.isSetPeatamised() || response.getPeatamised().getPeatamineList().isEmpty())
          .putArray("value");
      response.getPeatamised().getPeatamineList().forEach(
          peatamine -> ((ArrayNode) stepZeroDataElementsNode.get("peatamised").get("value"))
              .addObject()
              .put("algusKp", peatamine.getAlgusKp())
              .put("loppKp", peatamine.getLoppKp()));

      stepZeroDataElementsNode.putObject("dokumendid").put("hidden", klOkLiik.equals(18098L))
          .putArray("value");
      response.getDokumendid().getDokumentList().forEach(
          dokument -> {
            AtomicBoolean insertNewDokument = new AtomicBoolean(true);
            stepZeroDataElementsNode.get("dokumendid").get("value").forEach(item -> {
              if (item.get("liik").asText().equals(String.valueOf(dokument.getKlLiik()))) {
                insertNewDokument.set(false);
                ((ArrayNode) item.get("fail")).addObject()
                    .put("file_name", dokument.getFailiNimi())
                    .put("file_identifier", MTSYSFILE_KEY + "_" + dokument.getDokumentId());
              }
            });
            if (insertNewDokument.get()) {
              ((ArrayNode) stepZeroDataElementsNode.get("dokumendid").get("value")).addObject()
                  .put("liik", String.valueOf(dokument.getKlLiik()))
                  .put("kommentaar", dokument.getKommentaar())
                  .putArray("fail").addObject()
                  .put("file_name", dokument.getFailiNimi())
                  .put("file_identifier", MTSYSFILE_KEY + "_" + dokument.getDokumentId());
            }
          });

      stepZeroDataElementsNode.putObject("lisainfo")
          .put("hidden", !response.getTegevusloaAndmed().isSetLisainfo())
          .put("value", response.getTegevusloaAndmed().isSetLisainfo() ?
              response.getTegevusloaAndmed().getLisainfo() : null);

      if (response.isSetInfotekst()) {
        ((ArrayNode) jsonNode.get("body").get("messages")).add("infotekst");
        ((ObjectNode) jsonNode.get("messages")).putObject("infotekst")
            .put("message_type", "NOTICE")
            .putObject("message_text")
            .put("et", response.getInfotekst());
      }

      logForDrupal.setMessage("EHIS - mtsysTegevusluba.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      super.setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysTegevuslubaTaotlus(String formName, Long identifier,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();
    ObjectNode klfFailiTyybid = getKlfNode("failiTyybid");

    createTegevuslubaXJSON(formName, identifier, personalCode, jsonNode);
    ((ObjectNode) jsonNode.get("header")).put("current_step", "step_andmed");
    ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("SAVE")
        .add("SUBMIT");

    try {
      MtsysTegevuslubaResponse response = ehisXRoadService
          .mtsysTegevusluba(BigInteger.valueOf(identifier), personalCode);

      ((ObjectNode) jsonNode.get("header")).put("identifier",
          response.getTegevusloaAndmed().isSetId() ?
              response.getTegevusloaAndmed().getId().longValue() : identifier);

      Long klOkLiik = response.getTegevusloaAndmed().getKlLiik().longValue();
      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_liik")
          .putObject("data_elements").putObject("tegevusloaLiik")
          .put("value", klOkLiik.toString());

      getTegevuslubaStepAndmedXJSON(jsonNode, klOkLiik, klfFailiTyybid);
      setTegevuslubaStepAndmedXJSONData(jsonNode, klfFailiTyybid, response, klOkLiik);

      logForDrupal.setMessage("EHIS - mtsysTegevusluba.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      super.setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode postMtsysTegevusluba(ObjectNode jsonNode) {
    String currentStep = jsonNode.get("header").get("current_step").isNull() ? null
        : jsonNode.get("header").get("current_step").asText();
    Long applicationId = jsonNode.get("header").get("identifier").isNull()
        || Long.valueOf(0).equals(jsonNode.get("header").get("identifier").longValue()) ?
        null : jsonNode.get("header").get("identifier").asLong();
    String personalCode = jsonNode.get("header").get("agents").get(0).get("person_id")
        .asText();

    if (isAcceptableActivityView(jsonNode)) {
      return jsonNode;
    }

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysLaeTegevusluba.v1");
    logForDrupal.setSeverity("notice");

    if (currentStep == null) {
      jsonNode.putObject("body").putObject("steps");
      ((ObjectNode) jsonNode.get("body")).putArray("messages");
      jsonNode.putObject("messages").put("default", "default");

      ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_liik")
          .putObject("data_elements").putObject("tegevusloaLiik").putNull("value");
      ((ObjectNode) jsonNode.get("body").get("steps").get("step_liik")).putArray("messages");

      ((ObjectNode) jsonNode.get("header")).put("current_step", "step_liik");
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("CONTINUE");

      logForDrupal.setMessage("postMtsysTegevusluba step_liik json loodud");
    } else if (currentStep.equalsIgnoreCase("step_liik")) {
      Long stepLiik = jsonNode.get("body").get("steps").get("step_liik")
          .get("data_elements").get("tegevusloaLiik").get("value").asLong();
      getTegevuslubaStepAndmedXJSON(jsonNode, stepLiik, getKlfNode("failiTyybid"));
      ObjectNode stepAndmed = (ObjectNode) jsonNode.get("body").get("steps").get("step_andmed")
          .get("data_elements");

      ObjectNode oppeasutusedNode = (ObjectNode) redisTemplate.opsForHash().get(
          jsonNode.get("header").get("agents").get(0).get("owner_id").asText(),
          "educationalInstitution_" + jsonNode.get("header").get("agents").get(0)
              .get("educationalInstitutions_id").asText());
      boolean addAddress = true;

      if (stepLiik.equals(18098L)) {
        try {
          MtsysTegevusnaitaja request = MtsysTegevusnaitaja.Factory.newInstance();
          request.setUusTMV(true);
          request.setOppeasutusId(BigInteger.valueOf(
              jsonNode.get("header").get("agents").get(0).get("educationalInstitutions_id")
                  .asLong()));

          MtsysTegevusnaitajaResponse response = ehisXRoadService
              .mtsysTegevusnaitaja(request, personalCode);

          response.getOpperyhmad().getOpperyhmList().forEach(item ->
              ((ArrayNode) stepAndmed.get("oppekavaRuhmad").get("value"))
                  .addObject().put("nimetus", item.getId().toString()));

          setAadress(response.getAadressid(), stepAndmed);
          addAddress = false;

        } catch (Exception e) {
          log.error(e.getMessage(), e.getCause());
          addAddress = false;
//          setXdzeisonError(LOGGER, jsonNode, e);
        }
      }

      if (oppeasutusedNode != null) {
        if (addAddress) {
          ((ArrayNode) stepAndmed.get("aadressid").get("value")).addObject().putObject("aadress")
              .put("seqNo", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("seqNo").asLong())
              .put("adsId", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("adsId").asLong())
              .put("adsOid", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("adsOid").asText(""))
              .put("klElukoht", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("klElukoht").asLong())
              .put("county", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("county").asText(""))
              .put("localGovernment", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("localGovernment").asText(""))
              .put("settlementUnit", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("settlementUnit").asText(""))
              .put("address", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("address").asText(""))
              .put("addressFull", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("addressFull").asText(""))
              .put("addressHumanReadable", oppeasutusedNode.get("educationalInstitution")
                  .get("address").get("addressHumanReadable").asText(""));
        }

        stepAndmed.putObject("oppeasutuseNimetus")
            .put("value", oppeasutusedNode.get("educationalInstitution").get("generalData")
                .get("name").asText());
        stepAndmed.putObject("omanik")
            .put("value", oppeasutusedNode.get("educationalInstitution").get("generalData")
                .get("owner").asText());
        stepAndmed.putObject("telefon")
            .put("value", oppeasutusedNode.get("educationalInstitution").get("contacts")
                .get("contactPhone").asText());
        stepAndmed.putObject("epost")
            .put("value", oppeasutusedNode.get("educationalInstitution").get("contacts")
                .get("contactEmail").asText());
        stepAndmed.putObject("koduleht")
            .put("value", oppeasutusedNode.get("educationalInstitution").get("contacts")
                .get("webpageAddress").asText());
      }

      ((ObjectNode) jsonNode.get("header")).put("current_step", "step_andmed");
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll()
          .add("SAVE").add("SUBMIT");

      logForDrupal.setMessage("postMtsysTegevusluba step_andmed json loodud");
    } else if (currentStep.equalsIgnoreCase("step_andmed")) {
      try {
        jsonNode.get("body").get("steps").get("step_andmed").get("messages")
            .forEach(t -> ((ObjectNode) jsonNode.get("messages")).remove(t.asText()));
        ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
            .removeAll();
        if (jsonNode.get("header").get("activity").asText().equalsIgnoreCase("SAVE")) {
          saveMtsysTegevusluba(jsonNode, applicationId, personalCode);
          logForDrupal
              .setMessage("EHIS - mtsysLaeTegevusluba.v1 teenuselt andmete pärimine õnnestus.");
        }
        if (jsonNode.get("header").get("activity").asText().equalsIgnoreCase("SUBMIT")) {
          AtomicBoolean repeatStepAndmed = new AtomicBoolean(false);
          if (jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("oppeTasemed").get("required").asBoolean()
              && jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("oppeTasemed").get("value").size() == 0) {
            repeatStepAndmed.set(true);
            ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
                .add("oppeTasemed_validation_error");
            ((ObjectNode) jsonNode.get("messages")).putObject("oppeTasemed_validation_error")
                .put("message_type", "ERROR").putObject("message_text")
                .put("et", "Õppetasemed puuduvad.");
          }
          if (jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("oppekavaRuhmad").get("required").asBoolean()
              && jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("oppekavaRuhmad").get("value").size() == 0) {
            repeatStepAndmed.set(true);
            ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
                .add("oppekavaRuhmad_validation_error");
            ((ObjectNode) jsonNode.get("messages")).putObject("oppekavaRuhmad_validation_error")
                .put("message_type", "ERROR").putObject("message_text")
                .put("et", "Õppekavarühmad puuduvad.");
          }
          if (!jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("valisAadress").get("value").asBoolean()
              && jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("aadressid").get("value").size() == 0) {
            repeatStepAndmed.set(true);
            ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
                .add("address_validation_error");
            ((ObjectNode) jsonNode.get("messages")).putObject("address_validation_error")
                .put("message_type", "ERROR").putObject("message_text")
                .put("et", "Taotluse esitamisel on kohustuslik määrata asukoht!.");
          }
          AtomicInteger validationErrors = new AtomicInteger(0);
          ObjectNode fileTypes = getKlfNode("failiTyybid");
          Long klOkLiik = jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("tegevusloaLiik").get("value").asLong();
          jsonNode.get("body").get("steps").get("step_andmed").get("data_elements")
              .get("dokumendid").get("value").forEach(
              item -> fileTypes.get(item.get("klLiik").asText()).get("okLiik").forEach(i -> {
                if (klOkLiik.equals(i.get("klOkLiik").asLong()) && i.get("required").asBoolean()
                    && (item.get("fail") == null || item.get("fail").get(0) == null
                    || item.get("fail").get(0).get("file_identifier") == null)) {
                  repeatStepAndmed.set(true);
                  ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
                      .add("dokumendid_validation_error_" + validationErrors);
                  ((ObjectNode) jsonNode.get("messages"))
                      .putObject("dokumendid_validation_error_" + validationErrors)
                      .put("message_type", "ERROR").putObject("message_text")
                      .put("et",
                          "Kohustuslik dokument '" + item.get("liik").asText() + "' puudub.");
                  validationErrors.getAndIncrement();
                }
              }));
          if (repeatStepAndmed.get()) {
            logForDrupal.setMessage("postMtsysTegevusluba step_andmed validation_error on SUBMIT");
            logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
            log.info(logForDrupal.toString());
            return jsonNode;
          }

          saveMtsysTegevusluba(jsonNode, applicationId, personalCode);
          logForDrupal
              .setMessage("EHIS - mtsysLaeTegevusluba.v1 teenuselt andmete pärimine õnnestus.");
          logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
          log.info(logForDrupal.toString());

          logForDrupal.setType("EHIS - mtsysEsitaTegevusluba.v1");

          MtsysEsitaTegevusluba request = MtsysEsitaTegevusluba.Factory.newInstance();
          request.setId(jsonNode.get("header").get("identifier").asInt());
          request.setOperatsioon("ESITAMINE");
          request.setAlgusKp(Calendar.getInstance());
          request.setLoppKp(Calendar.getInstance());
          MtsysEsitaTegevuslubaResponse response = ehisXRoadService
              .mtsysEsitaTegevusluba(request, personalCode);

          if (response.isSetInfotekst()) {
            if (response.getInfotekst().equalsIgnoreCase("Tegevusloa taotlus on esitatud!")
                || response.getInfotekst().equalsIgnoreCase("Majandustegevusteade on esitatud!")) {
              int infotekstSaveIndex = 0;
              for (JsonNode item : jsonNode.get("body").get("steps").get("step_andmed")
                  .get("messages")) {
                if (item.asText().equalsIgnoreCase("infotekst_save")) {
                  break;
                }
                infotekstSaveIndex++;
              }
              ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
                  .remove(infotekstSaveIndex);
              ((ObjectNode) jsonNode.get("messages")).remove("infotekst_save");
            }
            ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed")
                .get("messages")).add("infotekst_esita");
            ((ObjectNode) jsonNode.get("messages")).putObject("infotekst_esita")
                .put("message_type", "NOTICE")
                .putObject("message_text")
                .put("et", response.getInfotekst());
          }

          ((ObjectNode) jsonNode.get("header")).put("current_step", "step_andmed");
          ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");

          logForDrupal
              .setMessage("EHIS - mtsysEsitaTegevusluba.v1 teenuselt andmete pärimine õnnestus.");
        }
      } catch (Exception e) {
        setXdzeisonError(log, jsonNode, e);
      }
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysEsitaTegevusluba(String formName, Long identifier,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .put("current_step", "step_0")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("SUBMIT");

    ((ObjectNode) jsonNode.get("header")).putArray("agents").addObject()
        .put("person_id", personalCode)
        .putNull("role")
        .putNull("owner_id")
        .putNull("educationalInstitutions_id");

    jsonNode.putObject("body").putObject("steps").putObject("step_0").putObject("data_elements");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages").put("default", "default");

    if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_MUUTMINE_TAOTLUS")) {
      ((ObjectNode) jsonNode.get("body").get("steps").get("step_0").get("data_elements"))
          .putObject("menetlusKommentaar").putNull("value");
    }

    return jsonNode;
  }

  public ObjectNode postMtsysEsitaTegevusluba(ObjectNode jsonNode) {
    String formName = jsonNode.get("header").get("form_name").asText();
    String applicantPersonalCode = jsonNode.get("header").get("agents").get(0).get("person_id")
        .asText();

    if (isAcceptableActivityView(jsonNode)) {
      return jsonNode;
    }

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(applicantPersonalCode);
    logForDrupal.setType("EHIS - mtsysEsitaTegevusluba.v1");
    logForDrupal.setSeverity("notice");

    try {
      MtsysEsitaTegevusluba request = MtsysEsitaTegevusluba.Factory.newInstance();

      if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_LOPETAMINE_TAOTLUS")) {
        request.setOperatsioon("LOPETAMINE");
      } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_MUUTMINE_TAOTLUS")) {
        request.setOperatsioon("MUUTMINE");
        String menetlusKommentaar = jsonNode.get("body").get("steps").get("step_0")
            .get("data_elements").get("menetlusKommentaar").get("value").asText("");
        if (StringUtils.isNotBlank(menetlusKommentaar)) {
          request.setMenetlusKommentaar(menetlusKommentaar);
        }
      } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_SULGEMINE_TAOTLUS")) {
        request.setOperatsioon("SULGEMINE");
      }
      request.setId(jsonNode.get("header").get("identifier").asInt());
      request.setAlgusKp(Calendar.getInstance());
      request.setLoppKp(Calendar.getInstance());

      MtsysEsitaTegevuslubaResponse response = ehisXRoadService
          .mtsysEsitaTegevusluba(request, applicantPersonalCode);

      if (response.isSetInfotekst()) {
        ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_1")
            .putObject("data_elements").putObject("infotekst")
            .put("value", response.getInfotekst());
      }

      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
      ((ObjectNode) jsonNode.get("header")).put("current_step", "step_1");

      logForDrupal
          .setMessage("EHIS - mtsysEsitaTegevusluba.v1 teenuselt andmete pärimine õnnestus.");

    } catch (Exception e) {
      setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysOppeasutus(Long identifier, String institutionId,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysOppeasutus.v1");
    logForDrupal.setSeverity("notice");

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
              .put("seqNo",
                  response.getOppeasutus().getAadress().isSetJrkNr() ? response.getOppeasutus()
                      .getAadress().getJrkNr() : null)
              .put("adsId",
                  response.getOppeasutus().getAadress().isSetAdsId() ? response.getOppeasutus()
                      .getAadress().getAdsId().longValue() : null)
              .put("adsOid", response.getOppeasutus().getAadress().getAdsOid())
              .put("klElukoht",
                  response.getOppeasutus().getAadress().isSetKlElukoht() ? response.getOppeasutus()
                      .getAadress().getKlElukoht().intValue() : null)
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

      logForDrupal.setMessage("EHIS - mtsysOppeasutus.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      jsonNode.putObject("error").put("message_type", "ERROR").putObject("message_text")
          .put("et", "Tehniline viga!");

      jsonNode.remove("educationalInstitution");
      jsonNode.remove("message");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    redisTemplate.opsForHash().put(institutionId, "educationalInstitution_" + identifier, jsonNode);
    redisTemplate.expire(institutionId, redisExpire, TimeUnit.MINUTES);

    return jsonNode;
  }

  public ObjectNode postMtsysLaeOppeasutus(ObjectNode jsonNodeRequest, String personalCode) {
    ObjectNode jsonNodeResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser("SYSTEM - XROAD");
    logForDrupal.setType("EHIS - mtsysLaeOppeasutus.v1");
    logForDrupal.setSeverity("notice");

    try {
      MtsysLaeOppeasutus request = MtsysLaeOppeasutus.Factory.newInstance();
      if (!jsonNodeRequest.get("educationalInstitutionId").asText("").equals("")) {
        request.setOppeasutuseId(jsonNodeRequest.get("educationalInstitutionId")
            .bigIntegerValue()); //optional, olemas siis kui on muutmine, muidu tühi
      }
      request.setRegNr(jsonNodeRequest.get("ownerId").bigIntegerValue()); //tegelusload/asutus/regnr
      request.setNimetus(jsonNodeRequest.get("ownerName")
          .asText()); //xsd optional / eesti.ee's mitte, tegevusload/asutus/nimetus

      OppeasutusDetail oppeasutusDetail = OppeasutusDetail.Factory.newInstance();

      if (jsonNodeRequest.get("educationalInstitution").get("generalData") != null) {
        MtsysOppeasutusAndmed oppeasutusAndmed = MtsysOppeasutusAndmed.Factory.newInstance();
        if (!jsonNodeRequest.get("educationalInstitution").get("generalData").get("owner")
            .asText("").equals("")) {
          oppeasutusAndmed.setOmanik(jsonNodeRequest.get("educationalInstitution")
              .get("generalData").get("owner")
              .asText()); //optional olemas kui on muutmine, muidu tühi
        }
        oppeasutusAndmed.setOppeasutuseNimetus(jsonNodeRequest.get("educationalInstitution")
            .get("generalData").get("name").asText()); //lenght < 255
        if (!jsonNodeRequest.get("educationalInstitution").get("generalData").get("nameENG")
            .asText("").equals("")) {
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
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("seqNo")
            .asText("").equals("")) {
          aadress.setJrkNr(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("seqNo").asLong()); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("adsId")
            .asText("").equals("")) {
          aadress.setAdsId(BigInteger.valueOf(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("adsId").asLong())); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("adsOid")
            .asText("").equals("")) {
          aadress.setAdsOid(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("adsOid").asText()); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("klElukoht")
            .asText("").equals("")) {
          aadress.setKlElukoht(BigInteger.valueOf(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("klElukoht").asLong())); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("county")
            .asText("").equals("")) {
          aadress.setMaakond(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("county").asText()); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("localGovernment")
            .asText("").equals("")) {
          aadress.setOmavalitsus(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("localGovernment").asText()); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("settlementUnit")
            .asText("").equals("")) {
          aadress.setAsula(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("settlementUnit").asText()); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("addressFull")
            .asText("").equals("")) {
          aadress.setTaisAadress(jsonNodeRequest.get("educationalInstitution")
              .get("address").get("addressFull").asText()); //optional
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address").get("address")
            .asText("").equals("")) {
          if (!jsonNodeRequest.get("educationalInstitution").get("address").get("apartment")
              .asText("").equals("")) {
            aadress.setAdsAadress(jsonNodeRequest.get("educationalInstitution").get("address")
                .get("address").asText() + "-" + jsonNodeRequest.get("educationalInstitution")
                .get("address").get("apartment").asText());
          } else {
            aadress.setAdsAadress(jsonNodeRequest.get("educationalInstitution")
                .get("address").get("address").asText()); //optional
          }
        }
        if (!jsonNodeRequest.get("educationalInstitution").get("address")
            .get("addressHumanReadable").asText("").equals("")) {
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
      log.error(e.getMessage(), e.getCause());

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      jsonNodeResponse.putObject("error").put("message_type", "ERROR")
          .putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNodeResponse;
  }

  public ObjectNode getMtsysTegevusNaitaja(String formName, Long identifier,
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
    jsonNode.putObject("messages").put("default", "default");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegevusnaitaja.v1");
    logForDrupal.setSeverity("notice");

    try {
      MtsysTegevusnaitaja request = MtsysTegevusnaitaja.Factory.newInstance();
      request.setAruandeId(BigInteger.valueOf(identifier));

      MtsysTegevusnaitajaResponse response = ehisXRoadService
          .mtsysTegevusnaitaja(request, personalCode);

      if (response.getSaabMuuta()) {
        ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).add("CHANGE");
      }

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

      step0DataElementsNode.putObject("majandustegevuseTeateTabel").put("hidden", true)
          .putArray("value");
      step0DataElementsNode.putObject("tegevuslubaTabel").put("hidden", true).putArray("value");
      step0DataElementsNode.putObject("kokkuTabel").put("hidden", true).putArray("value");
      response.getNaitajad().getItemList().forEach(item -> {
        if (item.getKlOkLiik().equals(BigInteger.valueOf(-1L))) {
          ((ObjectNode) step0DataElementsNode.get("kokkuTabel")).put("hidden", false);
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
          ((ObjectNode) step0DataElementsNode.get("majandustegevuseTeateTabel"))
              .put("hidden", false);
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
          ((ObjectNode) step0DataElementsNode.get("tegevuslubaTabel")).put("hidden", false);
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

      logForDrupal.setMessage("EHIS - mtsysTegevusnaitaja.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      super.setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysTegevusNaitajaTaotlus(String formName, Long identifier, Long year,
      Long educationalInstitutionsId, String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .put("current_step", "step_aruanne")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("SAVE").add("SUBMIT");

    ((ObjectNode) jsonNode.get("header")).putArray("agents").addObject()
        .put("person_id", personalCode)
        .putNull("role")
        .putNull("owner_id")
        .put("educationalInstitutions_id", educationalInstitutionsId);

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages").put("default", "default");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegegevusnaitja.v1");
    logForDrupal.setSeverity("notice");

    try {
      MtsysTegevusnaitaja request = MtsysTegevusnaitaja.Factory.newInstance();
      if (year != null) {
        request.setAasta(BigInteger.valueOf(year));
      }
      if (identifier != null) {
        request.setAruandeId(BigInteger.valueOf(identifier));
      }
      request.setOppeasutusId(BigInteger.valueOf(educationalInstitutionsId));

      MtsysTegevusnaitajaResponse response = ehisXRoadService
          .mtsysTegevusnaitaja(request, personalCode);

      if (year == null) {
        year = response.getAasta().longValue();
      }

      ((ObjectNode) jsonNode.get("header")).putObject("parameters").put("aasta", year);
      ((ObjectNode) jsonNode.get("header")).putObject("parameters").put("fileSubmit", false);

      setMtsysTegevusnaitajaTaotlus(year, educationalInstitutionsId, jsonNode, response,
          personalCode);

      logForDrupal.setMessage("EHIS - mtsysTegevusnaitaja.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      super.setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode postMtysTegevusNaitaja(ObjectNode jsonNode) {
    Long identifier = jsonNode.get("header").get("identifier").isNull()
        || Long.valueOf(0).equals(jsonNode.get("header").get("identifier").longValue()) ?
        null : jsonNode.get("header").get("identifier").asLong();
    String personalCode = jsonNode.get("header").get("agents").get(0).get("person_id")
        .asText();

    if (isAcceptableActivityView(jsonNode)) {
      return jsonNode;
    }

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysLaeTegevusnaitajad.v1");
    logForDrupal.setSeverity("notice");

    try {
      jsonNode.get("body").get("messages")
          .forEach(t -> ((ObjectNode) jsonNode.get("messages")).remove(t.asText()));
      ((ArrayNode) jsonNode.get("body").get("messages")).removeAll();
      if (jsonNode.get("header").get("activity").asText().equalsIgnoreCase("SAVE")) {
        if (setTegevusnaitajadSaveVeatekst(jsonNode, identifier, personalCode)) {
          return jsonNode;
        }
      }

      if (jsonNode.get("header").get("activity").asText().equalsIgnoreCase("SUBMIT")) {
        if (setTegevusnaitajadSaveVeatekst(jsonNode, identifier, personalCode)) {
          return jsonNode;
        }

        jsonNode.get("body").get("messages")
            .forEach(t -> ((ObjectNode) jsonNode.get("messages")).remove(t.asText()));
        ((ArrayNode) jsonNode.get("body").get("messages")).removeAll();

        MtsysEsitaTegevusnaitajad request = MtsysEsitaTegevusnaitajad.Factory.newInstance();
        request.setOperatsioon("ESITAMINE");
        request.setAruandeId(jsonNode.get("header").get("identifier").bigIntegerValue());

        MtsysEsitaTegevusnaitajadResponse response = ehisXRoadService
            .mtsysEsitaTegevusnaitajad(request, personalCode);

        logForDrupal.setType("EHIS - mtsysEsitaTegevusnaitajad.v1");
        logForDrupal
            .setMessage("EHIS - mtsysEsitaTegevusnaitajad.v1 teenuselt andmete pärimine õnnestus.");

        setLaeTegevusnaitajadResponseInfotekst(jsonNode,
            response.isSetInfotekst() ? response.getInfotekst() : null,
            response.isSetVeatekst() ? response.getVeatekst() : null,
            response.isSetAruandeId() ? response.getAruandeId() : null);

        ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
      }

    } catch (Exception e) {
      setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysEsitaTegevusNaitaja(Long identifier, Long educationalInstitutionsId,
      String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();
    try {
      MtsysEsitaTegevusnaitajad request = MtsysEsitaTegevusnaitajad.Factory.newInstance();
      request.setAruandeId(BigInteger.valueOf(identifier));
      request.setOperatsioon("MUUTMINE");
      MtsysEsitaTegevusnaitajadResponse response = ehisXRoadService
          .mtsysEsitaTegevusnaitajad(request, personalCode);
      if (!response.isSetInfotekst()) {
        jsonNode = getMtsysTegevusNaitajaTaotlus("MTSYS_TEGEVUSNAITAJAD_ARUANNE",
            identifier, null, educationalInstitutionsId, personalCode);
      } else {
        ((ArrayNode) jsonNode.get("body").get("messages")).add("error_message");
        ((ObjectNode) jsonNode.get("messages")).putObject("error_message")
            .put("message_type", "ERROR").putObject("message_text")
            .put("et", response.getInfotekst());
      }
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());
      jsonNode = getMtsysTegevusNaitaja("MTSYS_TEGEVUSNAITAJAD", identifier, personalCode);
      ((ArrayNode) jsonNode.get("body").get("messages")).add("error_message");
      if (e instanceof XRoadServiceConsumptionException) {
        if (((XRoadServiceConsumptionException) e).getFaultString()
            .equalsIgnoreCase("Vale operatsioon!")
            || ((XRoadServiceConsumptionException) e).getFaultString()
            .equalsIgnoreCase("Tegevusnäitajade aruanne peab olema staatuses Esitatud!")
            || ((XRoadServiceConsumptionException) e).getFaultString()
            .equalsIgnoreCase("Tegevusnäitajad peavad olema salvestatud!")) {
          ((ObjectNode) jsonNode.get("messages")).putObject("error_message")
              .put("message_type", "ERROR").putObject("message_text")
              .put("et", ((XRoadServiceConsumptionException) e).getFaultString());
        }
      } else {
        ((ObjectNode) jsonNode.get("messages")).putObject("error_message")
            .put("message_type", "ERROR").putObject("message_text")
            .put("et", "Tehniline viga!");
      }
    }
    return jsonNode;
  }

  public ObjectNode delelteDocument(Integer identifier, String personalCode) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysKustutaTegevusluba.v1");
    logForDrupal.setSeverity("notice");
    try {
      MtsysKustutaTegevuslubaResponse response = ehisXRoadService
          .mtsysKustutaTegevusluba(identifier, personalCode);

      responseNode.putArray("messages").addObject().put("message_type",
          response.getInfotekst().equalsIgnoreCase("Tegevusloa taotlus on kustutatud!") ? "NOTICE"
              : "ERROR").putObject("message_text").put("et", response.getInfotekst());

      logForDrupal
          .setMessage("EHIS - mtsysKustutaTegevusluba.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      if (e instanceof XRoadServiceConsumptionException && (
          ((XRoadServiceConsumptionException) e).getFaultString()
              .equalsIgnoreCase("Staatus peab olema Sisestamisel!")
              || ((XRoadServiceConsumptionException) e).getFaultString()
              .equalsIgnoreCase("Id does not exist"))) {
        responseNode.putArray("messages").addObject()
            .put("message_type", "ERROR")
            .putObject("message_text")
            .put("et", ((XRoadServiceConsumptionException) e).getFaultString());

      } else {
        log.error(e.getMessage(), e.getCause());

        logForDrupal.setSeverity("ERROR");
        logForDrupal.setMessage(e.getMessage());

        responseNode.putObject("error")
            .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
      }
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return responseNode;
  }

  public ObjectNode getDocumentFile(String documentId, Long identifier, String personalCode) {
    ObjectNode documentResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysDokument.v1");
    logForDrupal.setSeverity("notice");

    try {
      long id = Long.parseLong(documentId.replace(MTSYSFILE_KEY + "_", ""));

      MtsysDokumentResponse response = ehisXRoadService.mtsysDokument(identifier.intValue(),
          (int) id, personalCode);

      documentResponse.put("fileName", response.getFilename()).put("size", response.getSize())
          .put("mediaType", response.getMediatype()).put("value", response.getByteArrayValue());

      logForDrupal.setMessage("EHIS - mtsysDokument.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      documentResponse.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return documentResponse;
  }

  private void saveMtsysTegevusluba(ObjectNode jsonNode, Long applicationId,
      String applicantPersonalCode)
      throws ParseException, XRoadServiceConsumptionException {
    ObjectNode dataObjectNode = (ObjectNode) jsonNode.get("body").get("steps")
        .get("step_andmed").get("data_elements");
    Calendar cal = Calendar.getInstance();

    MtsysLaeTegevusluba request = MtsysLaeTegevusluba.Factory.newInstance();
    request.setRegNr(jsonNode.get("header").get("agents").get(0).get("owner_id").asText());

    Oppekava oppekava = Oppekava.Factory.newInstance();
    oppekava.setKlOkLiik(
        BigInteger.valueOf(dataObjectNode.get("tegevusloaLiik").get("value").asLong()));
    oppekava.setKoolId(BigInteger.valueOf(
        jsonNode.get("header").get("agents").get(0).get("educationalInstitutions_id")
            .asLong()));
    request.setOppekava(oppekava);

    Taotlus taotlus = Taotlus.Factory.newInstance();
    if (applicationId != null) {
      taotlus.setId(BigInteger.valueOf(applicationId));
    }
    if (!dataObjectNode.get("oppekavaNimetus").get("value").asText("").equals("")) {
      taotlus.setNimetus(dataObjectNode.get("oppekavaNimetus").get("value").asText());
    }
    if (!dataObjectNode.get("laagriNimetus").get("value").asText("").equals("")) {
      taotlus.setLaagriNimetus(dataObjectNode.get("laagriNimetus").get("value").asText());
    }
    if (!dataObjectNode.get("kohtadeArvLaagris").get("value").asText("").equals("")) {
      taotlus.setKohtadeArvLaagris(BigInteger.valueOf(
          dataObjectNode.get("kohtadeArvLaagris").get("value").asLong()));
    }
    if (!dataObjectNode.get("alguseKuupaev").get("value").asText("").equals("")) {
      cal.setTime(simpleDateFormat.parse(
          dataObjectNode.get("alguseKuupaev").get("value").asText()));
      taotlus.setKehtibAlates(cal);
    }
    if (!dataObjectNode.get("lopuKuupaev").get("value").asText("").equals("")) {
      cal.setTime(simpleDateFormat.parse(dataObjectNode.get("lopuKuupaev").get("value").asText()));
      taotlus.setKehtibKuni(cal);
    }
    if (!dataObjectNode.get("tkkLiik").get("value").asText("").equals("")
        && !dataObjectNode.get("tkkLiik").get("value").asText("").equalsIgnoreCase("null")) {
      taotlus.setKlTkkLiik(BigInteger.valueOf(dataObjectNode.get("tkkLiik").get("value").asLong()));
    }
    if (!dataObjectNode.get("keeleTase").get("value").asText("").equals("")
        && !dataObjectNode.get("keeleTase").get("value").asText("").equalsIgnoreCase("null")) {
      taotlus
          .setKlEkTase(BigInteger.valueOf(dataObjectNode.get("keeleTase").get("value").asLong()));
    }
    if (!dataObjectNode.get("soidukiteKategooria").get("value").asText("").equals("")
        && !dataObjectNode.get("soidukiteKategooria").get("value").asText("")
        .equalsIgnoreCase("null")) {
      taotlus.setKlSoidukiKategooria(BigInteger.valueOf(
          dataObjectNode.get("soidukiteKategooria").get("value").asLong()));
    }
    if (dataObjectNode.get("oppeTasemed").get("required").asBoolean()) {
      ObjectNode klfOppekavaOppetasemed = getKlfNode("oppekavaOppetasemed");
      OppekavaOppetasemed oppetasemed = OppekavaOppetasemed.Factory.newInstance();
      dataObjectNode.get("oppeTasemed").get("value").forEach(item -> {
        EhisKlassifikaator klf = EhisKlassifikaator.Factory.newInstance();
        klf.setId(BigInteger.valueOf(item.get("nimetus").asLong()));
        klf.setNimetus(klfOppekavaOppetasemed.get(item.get("nimetus").asText()).get("et").asText());
        klf.setOnKehtiv(
            klfOppekavaOppetasemed.get(item.get("nimetus").asText()).get("valid").asBoolean());
        oppetasemed.getOppekavaOppetaseList().add(klf);
      });
      taotlus.setOppetasemed(oppetasemed);
    }
    if (dataObjectNode.get("oppekavaRuhmad").get("required").asBoolean()) {
      ObjectNode klfOppekavaRyhmad = getKlfNode("opperyhmad");
      Opperyhmad opperyhmad = Opperyhmad.Factory.newInstance();
      dataObjectNode.get("oppekavaRuhmad").get("value").forEach(item -> {
        EhisKlassifikaator klf = EhisKlassifikaator.Factory.newInstance();
        klf.setId(BigInteger.valueOf(item.get("nimetus").asLong()));
        klf.setNimetus(klfOppekavaRyhmad.get(item.get("nimetus").asText()).get("et").asText());
        klf.setOnKehtiv(
            klfOppekavaRyhmad.get(item.get("nimetus").asText()).get("valid").asBoolean());
        opperyhmad.getOpperyhmList().add(klf);
      });
      taotlus.setOpperyhmad(opperyhmad);
    }

    Aadressid aadressid = Aadressid.Factory.newInstance();
    aadressid.setOnValismaa(dataObjectNode.get("valisAadress").get("value").asBoolean());
    dataObjectNode.get("aadressid").get("value").forEach(item0 -> {
      if (!item0.get("aadress").isArray()) {
        ObjectNode item = (ObjectNode) item0.get("aadress");
        Aadress aadress = Aadress.Factory.newInstance();
        if (!item.get("seqNo").asText("").equals("")) {
          aadress.setJrkNr(item.get("seqNo").asLong());
        }
        if (!item.get("adsId").asText("").equals("")) {
          aadress.setAdsId(BigInteger.valueOf(item.get("adsId").asLong()));
        }
        if (!item.get("adsOid").asText("").equals("")) {
          aadress.setAdsOid(item.get("adsOid").asText());
        }
        if (!item.get("klElukoht").asText("").equals("")) {
          aadress.setKlElukoht(BigInteger.valueOf(item.get("klElukoht").asLong()));
        }
        if (!item.get("county").asText("").equals("")) {
          aadress.setMaakond(item.get("county").asText());
        }
        if (!item.get("localGovernment").asText("").equals("")) {
          aadress.setOmavalitsus(item.get("localGovernment").asText());
        }
        if (!item.get("settlementUnit").asText("").equals("")) {
          aadress.setAsula(item.get("settlementUnit").asText());
        }
        if (!item.get("address").asText("").equals("")) {
          if (!item.get("apartment").asText("").equals("")) {
            aadress
                .setAdsAadress(item.get("address").asText() + "-" + item.get("apartment").asText());
          } else {
            aadress.setAdsAadress(item.get("address").asText());
          }
        }
        if (!item.get("addressFull").asText("").equals("")) {
          aadress.setTaisAadress(item.get("addressFull").asText());
        }
        if (!item.get("addressHumanReadable").asText("").equals("")) {
          aadress.setAdsAadressHumanReadable(item.get("addressHumanReadable").asText());
        }
        aadressid.getAadressList().add(aadress);
      }
    });
    taotlus.setAadressid(aadressid);

    if (!dataObjectNode.get("kommentaar").get("value").asText("").equals("")) {
      taotlus.setLisainfo(dataObjectNode.get("kommentaar").get("value").asText());
    }
    request.setTaotlus(taotlus);

    MtsysTaotlusKontaktandmed kontaktandmed = MtsysTaotlusKontaktandmed.Factory.newInstance();
    if (!dataObjectNode.get("oppeasutuseNimetus").get("value").asText("").equals("")) {
      kontaktandmed
          .setKooliNimetus(dataObjectNode.get("oppeasutuseNimetus").get("value").asText());
    }
    if (!dataObjectNode.get("omanik").get("value").asText("").equals("")) {
      kontaktandmed.setOmanik(dataObjectNode.get("omanik").get("value").asText());
    }
    kontaktandmed.setKontaktisik(dataObjectNode.get("kontaktisik").get("value").asText());
    kontaktandmed
        .setOppeasutuseYldtelefon(dataObjectNode.get("telefon").get("value").asText());
    kontaktandmed.setOppeasutuseEpost(dataObjectNode.get("epost").get("value").asText());
    kontaktandmed.setKoduleht(dataObjectNode.get("koduleht").get("value").asText());
    request.setKontaktandmed(kontaktandmed);

    Dokumendid dokumendid = Dokumendid.Factory.newInstance();
    dataObjectNode.get("dokumendid").get("value").forEach(item ->
        item.get("fail").forEach(fileItem -> {
          String fileIdentifier = fileItem.get("file_identifier").asText("");
          if (!fileIdentifier.equals("")) {
            Dokument dokument = Dokument.Factory.newInstance();
            if (fileIdentifier.startsWith(MTSYSFILE_KEY + "_")) {
              dokument
                  .setDokumentId(Long.parseLong(fileIdentifier.replace(MTSYSFILE_KEY + "_", "")));
            } else {
              dokument.setContent(Base64.getDecoder().decode((String) Objects.requireNonNull(
                  redisFileTemplate.opsForHash().get(
                      jsonNode.get("header").get("agents").get(0).get("owner_id").asText(),
                      fileIdentifier))));
            }
            dokument.setKlLiik(item.get("klLiik").asInt());
            dokument.setFailiNimi(fileItem.get("file_name").asText());
            if (!item.get("kommentaar").asText("").equals("")) {
              dokument.setKommentaar(item.get("kommentaar").asText());
            }
            dokumendid.getDokumentList().add(dokument);
          }
        }));
    request.setDokumendid(dokumendid);

    MtsysLaeTegevuslubaResponse response = ehisXRoadService
        .mtsysLaeTegevusluba(request, applicantPersonalCode);

    if (response.isSetInfotekst()) {
      ((ArrayNode) jsonNode.get("body").get("steps").get("step_andmed").get("messages"))
          .add("infotekst_save");
      ((ObjectNode) jsonNode.get("messages")).putObject("infotekst_save")
          .put("message_type", "NOTICE")
          .putObject("message_text")
          .put("et", response.getInfotekst());
    }

    ((ObjectNode) jsonNode.get("header"))
        .put("identifier", response.getTaotlusId().longValue());

    MtsysTegevuslubaResponse mtsysTegevuslubaResponse = ehisXRoadService
        .mtsysTegevusluba(response.getTaotlusId(), applicantPersonalCode);

    setTegevuslubaStepAndmedXJSONData(jsonNode, getKlfNode("failiTyybid"), mtsysTegevuslubaResponse,
        null);
  }

  private void saveMtsysTegevusNaitaja(ObjectNode jsonNode, Long identifier,
      String applicantPersonalCode) throws XRoadServiceConsumptionException {
    MtsysLaeTegevusnaitajad request = MtsysLaeTegevusnaitajad.Factory.newInstance();
    ObjectNode dataElementNode = (ObjectNode) jsonNode.get("body").get("steps")
        .get("step_aruanne").get("data_elements");
    long educationalInstitutionsId = dataElementNode.get("oppeasutusId").get("value").asLong();
    long year = dataElementNode.get("aasta").get("value").asLong();

    if (identifier != null) {
      request.setAruandeId(BigInteger.valueOf(identifier));
    }
    request.setAasta(BigInteger.valueOf(year));
    request.setOppeasutusId(BigInteger.valueOf(educationalInstitutionsId));

    if (jsonNode.get("header").get("parameters").get("fileSubmit").asBoolean()) {
      request.setFail(Base64.getDecoder().decode((String) Objects.requireNonNull(
          redisFileTemplate.opsForHash().get(
              jsonNode.get("header").get("agents").get(0).get("owner_id").asText(),
              dataElementNode.get("esitamiseksCSV").get("value").get(0).get("file_identifier")
                  .asText()))));
    } else {
      Naitajad naitajad = Naitajad.Factory.newInstance();

      ArrayNode values = nodeFactory.arrayNode();
      values.addAll((ArrayNode) dataElementNode.get("majandustegevuseTeateTabel").get("value"));
      values.addAll((ArrayNode) dataElementNode.get("tegevuslubaTabel").get("value"));

      values.forEach(item -> {
        TnItem naitaja = TnItem.Factory.newInstance();
        naitaja.setNimetus(item.get("nimetus").asText());
        naitaja.setKlOkLiik(BigInteger.valueOf(item.get("klOkLiik").asLong()));
        if (!item.get("klOpperuhm").asText("").equals("")) {
          naitaja.setKlOpperuhm(BigInteger.valueOf(item.get("klOpperuhm").asLong()));
        }
        if (!item.get("klEkTase").asText("").equals("")) {
          naitaja.setKlEkTase(BigInteger.valueOf(item.get("klEkTase").asLong()));
        }
        if (!item.get("klKategooria").asText("").equals("")) {
          naitaja.setKlKategooria(BigInteger.valueOf(item.get("klKategooria").asLong()));
        }
        naitaja.setOppijaArv(BigInteger.valueOf(item.get("oppijateArv").asLong()));
        naitaja.setTunnistusArv(BigInteger.valueOf(item.get("tunnistusteArv").asLong()));
        naitaja.setKuni8(BigInteger.valueOf(item.get("kuni8").asLong()));
        naitaja.setKuni26(BigInteger.valueOf(item.get("kuni26").asLong()));
        naitaja.setKuni80(BigInteger.valueOf(item.get("kuni80").asLong()));
        naitaja.setKuni240(BigInteger.valueOf(item.get("kuni240").asLong()));
        naitaja.setYle240(BigInteger.valueOf(item.get("yle240").asLong()));
        naitajad.getItemList().add(naitaja);
      });
      request.setNaitajad(naitajad);
    }

    MtsysLaeTegevusnaitajadResponse response = ehisXRoadService
        .mtsysLaeTegevusnaitajad(request, applicantPersonalCode);

    setLaeTegevusnaitajadResponseInfotekst(jsonNode,
        response.isSetInfotekst() ? response.getInfotekst() : null,
        response.isSetVeatekst() ? response.getVeatekst() : null,
        response.isSetAruandeId() ? response.getAruandeId() : null);

    if (response.isSetAruandeId()) {
      MtsysTegevusnaitaja tegevusnaitajaRequest = MtsysTegevusnaitaja.Factory.newInstance();
      tegevusnaitajaRequest.setAruandeId(response.getAruandeId());
      tegevusnaitajaRequest.setOppeasutusId(BigInteger.valueOf(educationalInstitutionsId));
      tegevusnaitajaRequest.setAasta(BigInteger.valueOf(year));

      MtsysTegevusnaitajaResponse tegevusnaitajaResponse = ehisXRoadService
          .mtsysTegevusnaitaja(tegevusnaitajaRequest, applicantPersonalCode);

      ((ObjectNode) jsonNode.get("header")).putObject("parameters").put("fileSubmit", false);
      setMtsysTegevusnaitajaTaotlus(year, educationalInstitutionsId, jsonNode,
          tegevusnaitajaResponse, applicantPersonalCode);
    }
  }

  private void setMtsysTegevusnaitajaTaotlus(Long year, Long educationalInstitutionsId,
      ObjectNode jsonNode, MtsysTegevusnaitajaResponse response, String personalCode) {
    ObjectNode dataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps"))
        .putObject("step_aruanne").putObject("data_elements");

    dataElementsNode.putObject("aasta").put("value", year);
    dataElementsNode.putObject("oppeasutusId").put("value", educationalInstitutionsId);

    String redisHK =
        "mtsys_tegevusnaitajad_aruanne_eeltaidetud_" + educationalInstitutionsId + "_" + year;
    dataElementsNode.putObject("eeltaidetudCSV").putArray("value").addObject()
        .put("file_name", "tegevusnaitajad.csv")
        .put("file_identifier", redisHK);
    redisFileTemplate.opsForHash()
        .put(personalCode, redisHK, response.getCsvFail().getStringValue());
    redisFileTemplate.expire(personalCode, redisFileExpire, TimeUnit.MINUTES);

    dataElementsNode.putObject("majandustegevuseTeateTabel").put("hidden", true)
        .putArray("value");
    dataElementsNode.putObject("tegevuslubaTabel").put("hidden", true).putArray("value");
    response.getNaitajad().getItemList().forEach(item -> {
      if (item.getKlOkLiik().equals(BigInteger.valueOf(18098L))) {
        ((ObjectNode) dataElementsNode.get("majandustegevuseTeateTabel")).put("hidden", false);
        ((ArrayNode) dataElementsNode.get("majandustegevuseTeateTabel").get("value")).addObject()
            .put("nimetus", item.getNimetus())
            .put("oppijateArv", item.getOppijaArv())
            .put("tunnistusteArv", item.getTunnistusArv())
            .put("kuni8", item.getKuni8())
            .put("kuni26", item.getKuni26())
            .put("kuni80", item.getKuni80())
            .put("kuni240", item.getKuni240())
            .put("yle240", item.getYle240())
            .put("kokku", item.getKokku())
            .put("klOkLiik", item.getKlOkLiik())
            .put("klOpperuhm", item.getKlOpperuhm())
            .put("klKategooria", item.getKlKategooria())
            .put("klEkTase", item.getKlEkTase());
      } else if (!item.getKlOkLiik().equals(BigInteger.valueOf(18098L)) && !item.getKlOkLiik()
          .equals(BigInteger.valueOf(-1L))) {
        ((ObjectNode) dataElementsNode.get("tegevuslubaTabel")).put("hidden", false);
        ((ArrayNode) dataElementsNode.get("tegevuslubaTabel").get("value")).addObject()
            .put("nimetus", item.getNimetus())
            .put("oppijateArv", item.getOppijaArv())
            .put("tunnistusteArv", item.getTunnistusArv())
            .put("kuni8", item.getKuni8())
            .put("kuni26", item.getKuni26())
            .put("kuni80", item.getKuni80())
            .put("kuni240", item.getKuni240())
            .put("yle240", item.getYle240())
            .put("kokku", item.getKokku())
            .put("klOkLiik", item.getKlOkLiik())
            .put("klOpperuhm", item.getKlOpperuhm())
            .put("klKategooria", item.getKlKategooria())
            .put("klEkTase", item.getKlEkTase());
      }
    });
  }

  private ObjectNode getKlfNode(String hashKey) {
    ObjectNode result = (ObjectNode) redisTemplate.opsForHash().get(MTSYSKLF_KEY, hashKey);

    if (result == null) {
      getMtsysKlf();

      result = (ObjectNode) redisTemplate.opsForHash().get(MTSYSKLF_KEY, hashKey);
    }

    return result;
  }

  private void createTegevuslubaXJSON(String formName, Long identifier, String personalCode,
      ObjectNode jsonNode) {
    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .putNull("current_step")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("VIEW");

    ((ObjectNode) jsonNode.get("header")).putArray("agents").addObject()
        .put("person_id", personalCode)
        .putNull("role")
        .putNull("owner_id")
        .putNull("educationalInstitutions_id");

    ((ObjectNode) jsonNode.get("header")).putObject("parameters");

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages").put("default", "default");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - mtsysTegevusluba.v1");
    logForDrupal.setSeverity("notice");
  }

  private void getTegevuslubaStepAndmedXJSON(ObjectNode jsonNode, Long klOkLiik,
      ObjectNode klfFailiTyybid) {
    boolean laagerBoolean = klOkLiik.equals(18052L) || klOkLiik.equals(18189L);

    ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_andmed")
        .putObject("title")
        .put("value", klOkLiik.equals(18098L) ? "Majandustegevusteade" : "Tegevusluba");

    ObjectNode stepAndmedDataElements = ((ObjectNode) jsonNode.get("body").get("steps")
        .get("step_andmed")).putObject("data_elements");
    ((ObjectNode) jsonNode.get("body").get("steps").get("step_andmed")).putArray("messages");

    stepAndmedDataElements.putObject("tegevusloaLiik")
        .put("value", klOkLiik.toString());
    stepAndmedDataElements.putObject("oppekavaNimetus")
        .putNull("value")
        .put("required",
            !(laagerBoolean || klOkLiik.equals(18098L)))
        .put("hidden",
            laagerBoolean || klOkLiik.equals(18098L));
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
        .put("required", laagerBoolean)
        .put("hidden", !laagerBoolean);
    stepAndmedDataElements.putObject("kohtadeArvLaagris")
        .putNull("value")
        .put("required", laagerBoolean)
        .put("hidden", !laagerBoolean);
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
        .put("required", klOkLiik.equals(18057L) || klOkLiik.equals(18102L))
        .put("hidden", !klOkLiik.equals(18057L) && !klOkLiik.equals(18102L))
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
        .put("hidden", true);
    stepAndmedDataElements.putObject("omanik")
        .putNull("value")
        .put("required", false)
        .put("hidden", true);
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
      Iterator<Entry<String, JsonNode>> fileTypes = klfFailiTyybid.fields();
      while (fileTypes.hasNext()) {
        Entry<String, JsonNode> fileType = fileTypes.next();
        fileType.getValue().get("okLiik").forEach(i -> {
          if (klOkLiik.equals(i.get("klOkLiik").asLong())) {
            dokumendidValue.addObject()
                .put("liik", i.get("required").asBoolean() ?
                    fileType.getValue().get("et").asText() + " *" :
                    fileType.getValue().get("et").asText())
                .put("klLiik", Long.valueOf(fileType.getKey()));
          }
        });
      }
    } else {
      ((ObjectNode) stepAndmedDataElements.get("dokumendid")).put("hidden", true);
    }

    stepAndmedDataElements.putObject("kommentaar")
        .putNull("value")
        .put("required", false)
        .put("hidden", false);
  }

  private void setTegevuslubaStepAndmedXJSONData(ObjectNode jsonNode, ObjectNode klfFailiTyybid,
      MtsysTegevuslubaResponse response, Long klOkLiik) {
    klOkLiik = klOkLiik == null ? response.getTegevusloaAndmed().getKlLiik().longValue() : klOkLiik;

    ObjectNode stepAndmedDataElements = (ObjectNode) jsonNode.get("body").get("steps")
        .get("step_andmed").get("data_elements");

    ((ObjectNode) stepAndmedDataElements.get("tegevusloaLiik"))
        .put("value", klOkLiik.toString());
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

    ((ArrayNode) stepAndmedDataElements.get("oppeTasemed").get("value")).removeAll();
    response.getTegevusloaAndmed().getOppetasemed().getOppekavaOppetaseList()
        .forEach(item -> ((ArrayNode) stepAndmedDataElements.get("oppeTasemed").get("value"))
            .addObject().put("nimetus", item.getId().toString()));

    ((ArrayNode) stepAndmedDataElements.get("oppekavaRuhmad").get("value")).removeAll();
    response.getTegevusloaAndmed().getOpperyhmad().getOpperyhmList()
        .forEach(item -> ((ArrayNode) stepAndmedDataElements.get("oppekavaRuhmad").get("value"))
            .addObject().put("nimetus", item.getId().toString()));

    setAadress(response.getTegevusloaAndmed().getAadressid(), stepAndmedDataElements);

    ((ObjectNode) stepAndmedDataElements.get("oppeasutuseNimetus"))
        .put("value", response.getKontaktandmed().getKooliNimetus())
        .put("hidden", false);
    ((ObjectNode) stepAndmedDataElements.get("omanik"))
        .put("value", response.getKontaktandmed().getOmanik())
        .put("hidden", false);
    ((ObjectNode) stepAndmedDataElements.get("kontaktisik"))
        .put("value", response.getKontaktandmed().getKontaktisik());
    ((ObjectNode) stepAndmedDataElements.get("telefon"))
        .put("value", response.getKontaktandmed().getOppeasutuseYldtelefon());
    ((ObjectNode) stepAndmedDataElements.get("epost"))
        .put("value", response.getKontaktandmed().getOppeasutuseEpost());
    ((ObjectNode) stepAndmedDataElements.get("koduleht"))
        .put("value", response.getKontaktandmed().getKoduleht());

    Long finalKlOkLiik = klOkLiik;
    stepAndmedDataElements.get("dokumendid").get("value")
        .forEach(failItem -> ((ObjectNode) failItem).remove("fail"));
    response.getDokumendid().getDokumentList().forEach(item -> {
      ObjectNode fileType = (ObjectNode) klfFailiTyybid.get(String.valueOf(item.getKlLiik()));
      String fileTypeKlOkLiik =
          fileType.get("okLiik").findValuesAsText("klOkLiik").contains(finalKlOkLiik.toString())
              ? finalKlOkLiik.toString() : "0";

      fileType.get("okLiik").forEach(i -> {
        if (fileTypeKlOkLiik.equalsIgnoreCase(i.get("klOkLiik").asText())) {
          AtomicBoolean insertNeDokument = new AtomicBoolean(true);
          stepAndmedDataElements.get("dokumendid").get("value").forEach(failItem -> {
            if (failItem.get("klLiik").asInt() == item.getKlLiik()) {
              insertNeDokument.set(false);
              if (failItem.get("fail") == null) {
                ((ObjectNode) failItem).putArray("fail");
              }
              ((ArrayNode) failItem.get("fail")).addObject()
                  .put("file_name", item.getFailiNimi())
                  .put("file_identifier", MTSYSFILE_KEY + "_" + item.getDokumentId());
            }
          });
          if (insertNeDokument.get()) {
            ((ArrayNode) stepAndmedDataElements.get("dokumendid").get("value")).addObject()
                .put("liik", i.get("required").asBoolean() ?
                    fileType.get("et").asText() + " *" :
                    fileType.get("et").asText())
                .put("klLiik", item.getKlLiik())
                .put("kommentaar", item.getKommentaar())
                .putArray("fail").addObject()
                .put("file_name", item.getFailiNimi())
                .put("file_identifier", MTSYSFILE_KEY + "_" + item.getDokumentId());
          }
        }
      });
    });

    ((ObjectNode) stepAndmedDataElements.get("kommentaar"))
        .put("value", response.getTegevusloaAndmed().getLisainfo());
  }

  private void setAadress(Aadressid aadressid, ObjectNode jsonNode) {
    ((ArrayNode) jsonNode.get("aadressid").get("value")).removeAll();
    ((ObjectNode) jsonNode.get("valisAadress")).put("value", aadressid.getOnValismaa());
    aadressid.getAadressList().forEach(aadress ->
        ((ArrayNode) jsonNode.get("aadressid").get("value")).addObject().putObject("aadress")
            .put("seqNo", aadress.getJrkNr())
            .put("adsId", aadress.getAdsId() != null ? aadress.getAdsId().longValue() : null)
            .put("adsOid", aadress.getAdsOid())
            .put("klElukoht", aadress.getKlElukoht())
            .put("county", aadress.getMaakond())
            .put("localGovernment", aadress.getOmavalitsus())
            .put("settlementUnit", aadress.getAsula())
            .put("address", aadress.getAdsAadress())
            .put("addressFull", aadress.getTaisAadress())
            .put("addressHumanReadable", aadress.getAdsAadressHumanReadable()));
  }

  private boolean setTegevusnaitajadSaveVeatekst(ObjectNode jsonNode, Long identifier,
      String personalCode) throws XRoadServiceConsumptionException {
    saveMtsysTegevusNaitaja(jsonNode, identifier, personalCode);

    List<String> bodyMessages = new ArrayList<>();
    jsonNode.get("body").get("messages").forEach(i -> bodyMessages.add(i.asText()));

    logForDrupal
        .setMessage("EHIS - mtsysLaeTegevusnaitajad.v1 teenuselt andmete pärimine õnnestus.");

    if (bodyMessages.contains("veatekst")) {
      logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
      log.info(logForDrupal.toString());

      return true;
    }
    return false;
  }

  private void setLaeTegevusnaitajadResponseInfotekst(ObjectNode jsonNode, String infotekst,
      String veatekst, BigInteger aruandeId) {
    long timestamp = System.currentTimeMillis();
    if (infotekst != null) {
      ((ArrayNode) jsonNode.get("body").get("messages")).add("infotekst_" + timestamp);
      ((ObjectNode) jsonNode.get("messages")).putObject("infotekst_" + timestamp)
          .put("message_type", "NOTICE")
          .putObject("message_text")
          .put("et", infotekst);
    }

    if (veatekst != null) {
      ((ArrayNode) jsonNode.get("body").get("messages")).add("veatekst_" + timestamp);
      ((ObjectNode) jsonNode.get("messages")).putObject("veatekst_" + timestamp)
          .put("message_type", "ERROR")
          .putObject("message_text")
          .put("et", veatekst);
    }

    if (aruandeId != null) {
      ((ObjectNode) jsonNode.get("header"))
          .put("identifier", aruandeId.longValue());
    }
  }

  private boolean isAcceptableActivityView(ObjectNode jsonNode) {
    List<String> acceptableActivity = new ArrayList<>();
    jsonNode.get("header").get("acceptable_activity")
        .forEach(i -> acceptableActivity.add(i.asText()));

    return acceptableActivity.contains("VIEW");
  }

  private void addAcceptableFormToHeader(ObjectNode jsonNode, Long klOkLiik, Long klStaatus) {
    ArrayNode acceptableFormArrayNode = ((ObjectNode) jsonNode.get("header"))
        .putArray("acceptable_form");

    boolean b = klOkLiik.equals(18057L) || klOkLiik.equals(18058L) || klOkLiik.equals(18102L);
    if (klStaatus.equals(15670L) && !b) {
      acceptableFormArrayNode.addObject()
          .put("form_name", "MTSYS_TEGEVUSLUBA_SULGEMINE_TAOTLUS");
    }

    if (klStaatus.equals(15670L) && b) {
      acceptableFormArrayNode.addObject()
          .put("form_name", "MTSYS_TEGEVUSLUBA_MUUTMINE_TAOTLUS");
    }

    if (klStaatus.equals(18103L) && klOkLiik.equals(18098L)) {
      acceptableFormArrayNode.addObject()
          .put("form_name", "MTSYS_TEGEVUSLUBA_LOPETAMINE_TAOTLUS");
    }
  }
}
