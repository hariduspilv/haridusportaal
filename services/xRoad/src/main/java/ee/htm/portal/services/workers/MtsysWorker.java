package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import com.nortal.jroad.jaxb.ByteArrayDataSource;
import com.nortal.jroad.model.XRoadAttachment;
import com.nortal.jroad.model.XRoadMessage;
import com.nortal.jroad.model.XmlBeansXRoadMessage;
import ee.htm.portal.services.client.Ehis2XRoadService;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Aadress;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Aadressid;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Dokumendid;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Dokument;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EhisKlassifikaator;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysDokumentResponseDocument.MtsysDokumentResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaDocument.MtsysEsitaTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysEsitaTegevuslubaResponseDocument.MtsysEsitaTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKustutaTegevuslubaResponseDocument.MtsysKustutaTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaDocument.MtsysLaeTegevusluba;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysLaeTegevuslubaResponseDocument.MtsysLaeTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTaotlusKontaktandmed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusloadResponseDocument.MtsysTegevusloadResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaResponseDocument.MtsysTegevuslubaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaDocument.MtsysTegevusnaitaja;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevusnaitajaResponseDocument.MtsysTegevusnaitajaResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Oppekava;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.OppekavaOppetasemed;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Opperyhmad;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Taotlus;
import ee.htm.portal.services.types.eu.x_road.ehis2.EducationalInstitutionExtended;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetInstitutionsRequestDocument.GetInstitutionsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetInstitutionsRequestDocument.GetInstitutionsRequest.Action;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetInstitutionsResponseDocument.GetInstitutionsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionOwner;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionsAddressPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionsAddressesPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionsContactPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionsContactPost.TypeCl;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionsContactsPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.InstitutionsPerformanceReportPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.Message;
import ee.htm.portal.services.types.eu.x_road.ehis2.Messages;
import ee.htm.portal.services.types.eu.x_road.ehis2.Metric;
import ee.htm.portal.services.types.eu.x_road.ehis2.Metrics;
import ee.htm.portal.services.types.eu.x_road.ehis2.MetricsGroup;
import ee.htm.portal.services.types.eu.x_road.ehis2.MetricsGroup.GroupCl;
import ee.htm.portal.services.types.eu.x_road.ehis2.MetricsGroups;
import ee.htm.portal.services.types.eu.x_road.ehis2.MetricsPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.MetricsPost.ReportStatusCl;
import ee.htm.portal.services.types.eu.x_road.ehis2.MtsysClassifiers;
import ee.htm.portal.services.types.eu.x_road.ehis2.OwnerPost;
import ee.htm.portal.services.types.eu.x_road.ehis2.PerformanceReport;
import ee.htm.portal.services.types.eu.x_road.ehis2.PerformanceReportResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostEducationalInstitution;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostInstitutionsRequestDocument.PostInstitutionsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostInstitutionsResponseDocument.PostInstitutionsResponse;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.Calendar;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import javax.activation.DataHandler;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.util.FileCopyUtils;

public class MtsysWorker extends Worker {

  private static final Logger log = LoggerFactory.getLogger(MtsysWorker.class);

  private static final String MTSYSKLF_KEY = "klassifikaator";
  private static final String MTSYSFILE_KEY = "mtsysFile";

  private final EhisXRoadService ehisXRoadService;

  private final Ehis2XRoadService ehis2XRoadService;

  private final RedisTemplate<String, String> redisFileTemplate;

  public MtsysWorker(EhisXRoadService ehisXRoadService, Ehis2XRoadService ehis2XRoadService,
      RedisTemplate<String, Object> redisTemplate, RedisTemplate<String, String> redisFileTemplate,
      Long redisExpire, Long redisFileExpire, Long redisKlfExpire) {
    super(redisTemplate, redisExpire, redisFileExpire, redisKlfExpire);
    this.ehisXRoadService = ehisXRoadService;
    this.ehis2XRoadService = ehis2XRoadService;
    this.redisFileTemplate = redisFileTemplate;
  }

  public ObjectNode getMtsysKlf() {
    ObjectNode mtsysKlfResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser("SYSTEM - XROAD");
    logForDrupal.setType("EHIS - mtsysKlfTeenus.v1");
    logForDrupal.setSeverity("notice");

    try {
      //EHIS1 klassifikaatorid
      MtsysKlfTeenusResponse response = ehisXRoadService.mtsysKlfTeenus(null);
      ObjectNode failSafe = mtsysKlfResponse.putObject("failsafe");

      ObjectNode tegevusloaLiigidNode = mtsysKlfResponse.putObject("tegevusloaLiigid");
      failSafe.putObject("tegevusloaLiigid")
         .put("ehis1", response.isSetTegevusloaLiigid() && !response.getTegevusloaLiigid().getTegevusloaLiikList().isEmpty())
         .put("ehis2", false);
      response.getTegevusloaLiigid().getTegevusloaLiikList().forEach(
          item -> tegevusloaLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      ((ObjectNode) tegevusloaLiigidNode.get("18098")).put("valid", true);
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tegevusloaLiigid", tegevusloaLiigidNode);

      ObjectNode oppekavaStaatusedNode = mtsysKlfResponse.putObject("oppekavaStaatused");
      failSafe.putObject("oppekavaStaatused")
         .put("ehis1", response.isSetOppekavaStaatused() && !response.getOppekavaStaatused().getOppekavaStaatusList().isEmpty())
         .put("ehis2", false);
      response.getOppekavaStaatused().getOppekavaStaatusList().forEach(
          item -> oppekavaStaatusedNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      oppekavaStaatusedNode.putObject("18472").put("et", "Esitatud").put("valid", true);
      oppekavaStaatusedNode.putObject("18471").put("et", "Sisestamisel").put("valid", true);
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppekavaStaatused", oppekavaStaatusedNode);

      ObjectNode oppekavaOppetasemedNode = mtsysKlfResponse.putObject("oppekavaOppetasemed");
      failSafe.putObject("oppekavaOppetasemed")
         .put("ehis1", response.isSetOppekavaOppetasemed() && !response.getOppekavaOppetasemed().getOppekavaOppetaseList().isEmpty())
         .put("ehis2", false);
      response.getOppekavaOppetasemed().getOppekavaOppetaseList().forEach(
          item -> oppekavaOppetasemedNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppekavaOppetasemed", oppekavaOppetasemedNode);

      ObjectNode soidukiKategooriadNode = mtsysKlfResponse.putObject("soidukiKategooriad");
      failSafe.putObject("soidukiKategooriad")
         .put("ehis1", response.isSetSoidukiKategooriad() && !response.getSoidukiKategooriad().getSoidukiKategooriaList().isEmpty())
         .put("ehis2", false);
      response.getSoidukiKategooriad().getSoidukiKategooriaList().forEach(
          item -> soidukiKategooriadNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "soidukiKategooriad", soidukiKategooriadNode);

      ObjectNode failiTyybidNode = mtsysKlfResponse.putObject("failiTyybid");
      failSafe.putObject("failiTyybid")
         .put("ehis1", response.isSetFailiTyybid() && !response.getFailiTyybid().getFailiTyypList().isEmpty())
         .put("ehis2", false);
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
      failSafe.putObject("tkkLiigid")
         .put("ehis1", response.isSetTkkLiigid() && !response.getTkkLiigid().getTkkLiikList().isEmpty())
         .put("ehis2", false);
      response.getTkkLiigid().getTkkLiikList().forEach(
          item -> tkkLiigidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tkkLiigid", tkkLiigidNode);

      ObjectNode eestiKeeleTasemedNode = mtsysKlfResponse.putObject("eestiKeeleTasemed");
      failSafe.putObject("eestiKeeleTasemed")
         .put("ehis1", response.isSetEestiKeeleTasemed() && !response.getEestiKeeleTasemed().getEestiKeeleTaseList().isEmpty())
         .put("ehis2", false);
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
      failSafe.putObject("opperyhmad")
         .put("ehis1", response.isSetOpperyhmad() && !response.getOpperyhmad().getOpperyhmList().isEmpty())
         .put("ehis2", false);
      response.getOpperyhmad().getOpperyhmList().forEach(
          item -> opperyhmadNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "opperyhmad", opperyhmadNode);

      ObjectNode tegevusnaitajaTyybidNode = mtsysKlfResponse.putObject("tegevusnaitajaTyybid");
      failSafe.putObject("tegevusnaitajaTyybid")
         .put("ehis1", response.isSetTegevusnaitajaTyybid() && !response.getTegevusnaitajaTyybid().getTegevusnaitajaTyypList().isEmpty())
         .put("ehis2", false);
      response.getTegevusnaitajaTyybid().getTegevusnaitajaTyypList().forEach(
          item -> tegevusnaitajaTyybidNode.putObject(item.getId().toString())
              .put("et", item.getNimetus())
              .put("valid", item.getOnKehtiv()));
      redisTemplate.opsForHash()
          .put(MTSYSKLF_KEY, "tegevusnaitajaTyybid", tegevusnaitajaTyybidNode);

      redisTemplate.opsForHash().put(MTSYSKLF_KEY, "failSafe", failSafe);
      redisTemplate.expire(MTSYSKLF_KEY, redisKlfExpire, TimeUnit.MINUTES);

      // EHIS2 Classifiers
      GetInstitutionsResponse ehis2Response = ehis2XRoadService.getMtsysKlf();
      if (ehis2Response.isSetMtsysClassifiers()) {
        MtsysClassifiers classifiers = ehis2Response.getMtsysClassifiers();

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetTegevusloaLiigid()) {
          ((ObjectNode) failSafe.get("tegevusloaLiigid")).put("ehis2", !classifiers.getTegevusloaLiigid().getTegevusloaLiikList().isEmpty());
          classifiers.getTegevusloaLiigid().getTegevusloaLiikList().forEach(
              item -> tegevusloaLiigidNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
//        ((ObjectNode) tegevusloaLiigidNode.get("18098")).put("valid", true);
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tegevusloaLiigid", tegevusloaLiigidNode);
        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetOppekavaStaatused()) {
          ((ObjectNode) failSafe.get("oppekavaStaatused")).put("ehis2", !classifiers.getOppekavaStaatused().getOppekavaStaatusList().isEmpty());
          classifiers.getOppekavaStaatused().getOppekavaStaatusList().forEach(
              item -> oppekavaStaatusedNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
          oppekavaStaatusedNode.putObject("TKA_TEGEVUSNAITAJA_STAATUS:TKATN_STAATUS_ESI")
              .put("et", "Esitatud").put("valid", false);
          oppekavaStaatusedNode.putObject("TKA_TEGEVUSNAITAJA_STAATUS:TKATN_STAATUS_SIS")
              .put("et", "Sisestamisel").put("valid", false);
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppekavaStaatused", oppekavaStaatusedNode);
        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetOppekavaOppetasemed()) {
          ((ObjectNode) failSafe.get("oppekavaOppetasemed")).put("ehis2", !classifiers.getOppekavaOppetasemed().getOppetasemedList().isEmpty());
          classifiers.getOppekavaOppetasemed().getOppetasemedList().forEach(
              item -> oppekavaOppetasemedNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
          redisTemplate.opsForHash()
              .put(MTSYSKLF_KEY, "oppekavaOppetasemed", oppekavaOppetasemedNode);
        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetSoidukiKategooriad()) {
          ((ObjectNode) failSafe.get("soidukiKategooriad")).put("ehis2", !classifiers.getSoidukiKategooriad().getSoidukiKategooriaList().isEmpty());
          classifiers.getSoidukiKategooriad().getSoidukiKategooriaList().forEach(
              item -> soidukiKategooriadNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
          redisTemplate.opsForHash()
              .put(MTSYSKLF_KEY, "soidukiKategooriad", soidukiKategooriadNode);
        }

        if (classifiers.isSetOppeasutuseOmandivormid()) {
          ObjectNode oppeasutuseOmandivormidNode = mtsysKlfResponse.putObject("oppeasutuseOmandivormid");
          failSafe.putObject("oppeasutuseOmandivormid").put("ehis2", !classifiers.getOppeasutuseOmandivormid().getOppeasutuseOmandivormList().isEmpty());
          classifiers.getOppeasutuseOmandivormid().getOppeasutuseOmandivormList().forEach(
              item -> oppeasutuseOmandivormidNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", item.getOnKehtiv()));
          redisTemplate.opsForHash()
              .put(MTSYSKLF_KEY, "oppeasutuseOmandivormid", oppeasutuseOmandivormidNode);
        }

        if (classifiers.isSetOppeasutuseLiigid()) {
          ObjectNode oppeasutuseLiigidNode = mtsysKlfResponse.putObject("oppeasutuseLiigid");
          failSafe.putObject("oppeasutuseLiigid").put("ehis2", !classifiers.getOppeasutuseLiigid().getOppeasutuseLiikList().isEmpty());
          classifiers.getOppeasutuseLiigid().getOppeasutuseLiikList().forEach(
              item -> oppeasutuseLiigidNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", item.getOnKehtiv()));
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "oppeasutuseLiigid", oppeasutuseLiigidNode);
        }

        if (classifiers.isSetPidajaLiigid()) {
          ObjectNode pidajaLiigidNode = mtsysKlfResponse.putObject("pidajaLiigid");
          failSafe.putObject("pidajaLiigid").put("ehis2", !classifiers.getPidajaLiigid().getPidajaLiikList().isEmpty());
          classifiers.getPidajaLiigid().getPidajaLiikList().forEach(
              item -> pidajaLiigidNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", item.getOnKehtiv()));
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "pidajaLiigid", pidajaLiigidNode);
        }

        //TODO: failityyp
//        if (classifiers.isSetFailiTyybid()) {
//        classifiers.getFailiTyybid().getFailiTyypList().forEach();
//        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetTkkLiigid()) {
          ((ObjectNode) failSafe.get("tkkLiigid")).put("ehis2", !classifiers.getTkkLiigid().getTkkLiikList().isEmpty());
          classifiers.getTkkLiigid().getTkkLiikList().forEach(
              item -> tkkLiigidNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "tkkLiigid", tkkLiigidNode);
        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetEestiKeeleTasemed()) {
          ((ObjectNode) failSafe.get("eestiKeeleTasemed")).put("ehis2", !classifiers.getEestiKeeleTasemed().getEestiKeeleTaseList().isEmpty());
          classifiers.getEestiKeeleTasemed().getEestiKeeleTaseList().forEach(
              item -> eestiKeeleTasemedNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
//                .put("valid", !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_A")
//                    && !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_A1")
//                    && !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_B")
//                    && !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_C")
//                    && !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_D")
//                    && !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_E")
//                    && !item.getId().equals("STATELANGUAGE_CATEGORY:STATELANGUAGE_CATEGORY_F")
//                    && item.getOnKehtiv()));
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "eestiKeeleTasemed", eestiKeeleTasemedNode);
        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetOpperyhmad()) {
          ((ObjectNode) failSafe.get("opperyhmad")).put("ehis2", !classifiers.getOpperyhmad().getOpperyhmList().isEmpty());
          classifiers.getOpperyhmad().getOpperyhmList().forEach(
              item -> opperyhmadNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
          redisTemplate.opsForHash().put(MTSYSKLF_KEY, "opperyhmad", opperyhmadNode);
        }

        //TODO: kontoll kas ja kus kasutatakse ning on seda ehis2 (oppeasutused ja tegevusnäitajad) raames hetkel vaja
        if (classifiers.isSetTegevusnaitajaTyybid()) {
          ((ObjectNode) failSafe.get("tegevusnaitajaTyybid")).put("ehis2", !classifiers.getTegevusnaitajaTyybid().getTegevusnaitajaTyypList().isEmpty());
          classifiers.getTegevusnaitajaTyybid().getTegevusnaitajaTyypList().forEach(
              item -> tegevusnaitajaTyybidNode.putObject(item.getId())
                  .put("et", item.getNimetus())
                  .put("valid", false));
          redisTemplate.opsForHash()
              .put(MTSYSKLF_KEY, "tegevusnaitajaTyybid", tegevusnaitajaTyybidNode);
        }
        redisTemplate.opsForHash().put(MTSYSKLF_KEY, "failSafe", failSafe);
        redisTemplate.expire(MTSYSKLF_KEY, redisKlfExpire, TimeUnit.MINUTES);
      }

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

  public void getMtsystegevusLoad(String personalCode, String ownerRegCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(ownerRegCode);
    logForDrupal.setType("EHIS - mtsysTegevuslaod.v1");
    logForDrupal.setSeverity("notice");

    try {
      ObjectNode tegevusloaLiigidNode = getKlfNode("tegevusloaLiigid", false);

      MtsysTegevusloadResponse response = ehisXRoadService.mtsysTegevusload(ownerRegCode, personalCode);

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

    redisTemplate.opsForHash().put(ownerRegCode, "mtsys", jsonNode);
    redisTemplate.expire(ownerRegCode, redisExpire, TimeUnit.MINUTES);
  }

  public ObjectNode getMtsysTegevusluba(String formName, Long identifier, String personalCode,
      String ownerRegCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    createTegevuslubaXJSON(formName, identifier, ownerRegCode, personalCode, jsonNode);
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
      String personalCode, String ownerRegCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    createTegevuslubaXJSON(formName, identifier, ownerRegCode, personalCode, jsonNode);
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

      ObjectNode klfFailiTyybid = getKlfNode("failiTyybid", false);
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
    String currentStep = jsonNode.get("header").get("current_step").isNull()
        ? null : jsonNode.get("header").get("current_step").asText();
    Long applicationId = jsonNode.get("header").get("identifier").isNull()
        || Long.valueOf(0).equals(jsonNode.get("header").get("identifier").longValue())
        ? null : jsonNode.get("header").get("identifier").asLong();
    String personalCode = jsonNode.get("header").get("agents").get(0).get("person_id").asText();
    String ownerRegCode = jsonNode.get("header").get("agents").get(0).get("owner_id").asText();
    String educationalInstitutionId = jsonNode.get("header").get("agents").get(0).get("educationalInstitutions_id").asText();

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
      ObjectNode klfFailiTyybid = null;
      try {
        klfFailiTyybid = getKlfNode("failiTyybid", false);
      } catch (Exception e) {
        log.info(e.getMessage(), e);
      }
      getTegevuslubaStepAndmedXJSON(jsonNode, stepLiik, klfFailiTyybid);
      ObjectNode stepAndmed = (ObjectNode) jsonNode.get("body").get("steps").get("step_andmed")
          .get("data_elements");

      ObjectNode oppeasutusedNode = (ObjectNode) redisTemplate.opsForHash()
          .get(ownerRegCode, "educationalInstitution_" + educationalInstitutionId);
      boolean addAddress = true;

      if (stepLiik.equals(18098L)) {
        try {
          MtsysTegevusnaitaja request = MtsysTegevusnaitaja.Factory.newInstance();
          request.setUusTMV(true);
          request.setOppeasutusId(BigInteger.valueOf(Long.parseLong(educationalInstitutionId)));

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
        if (addAddress && oppeasutusedNode.get("educationalInstitution").has("address")) {
          ((ArrayNode) stepAndmed.get("aadressid").get("value")).addObject().putObject("aadress")
              .put("seqNo", oppeasutusedNode.get("educationalInstitution").get("address").has("seqNo")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("seqNo").asLong()
                  : null)
              .put("adsId", oppeasutusedNode.get("educationalInstitution").get("address").has("adsId")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("adsId").asLong()
                  : null)
              .put("adsOid", oppeasutusedNode.get("educationalInstitution").get("address").has("adsOid")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("adsOid").asText("")
                  : null)
              .put("klElukoht", oppeasutusedNode.get("educationalInstitution").get("address").has("klElukoht")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("klElukoht").asLong()
                  : null)
              .put("county", oppeasutusedNode.get("educationalInstitution").get("address").has("county")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("county").asText("")
                  : null)
              .put("localGovernment", oppeasutusedNode.get("educationalInstitution").get("address").has("localGovernment")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("localGovernment").asText("")
                  : null)
              .put("settlementUnit", oppeasutusedNode.get("educationalInstitution").get("address").has("settlementUnit")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("settlementUnit").asText("")
                  : null)
              .put("address", oppeasutusedNode.get("educationalInstitution").get("address").has("address")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("address").asText("")
                  : null)
              .put("addressFull", oppeasutusedNode.get("educationalInstitution").get("address").has("addressFull")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("addressFull").asText("")
                  : null)
              .put("addressHumanReadable", oppeasutusedNode.get("educationalInstitution").get("address").has("addressHumanReadable")
                  ? oppeasutusedNode.get("educationalInstitution").get("address").get("addressHumanReadable").asText("")
                  : null);
        }

        if (oppeasutusedNode.get("educationalInstitution").has("generalData")) {
          stepAndmed.putObject("oppeasutuseNimetus")
              .put("value", oppeasutusedNode.get("educationalInstitution").get("generalData").has("name")
                  ? oppeasutusedNode.get("educationalInstitution").get("generalData").get("name").asText()
                  : null);
          stepAndmed.putObject("omanik")
              .put("value", oppeasutusedNode.get("educationalInstitution").get("generalData").has("owner")
                  ? oppeasutusedNode.get("educationalInstitution").get("generalData").get("owner").asText()
                  : null);
        }
        if (oppeasutusedNode.get("educationalInstitution").has("contacts")) {
          stepAndmed.putObject("telefon")
              .put("value", oppeasutusedNode.get("educationalInstitution").get("contacts").has("contactPhone")
                  ? oppeasutusedNode.get("educationalInstitution").get("contacts").get("contactPhone").asText()
                  : null);
          stepAndmed.putObject("epost")
              .put("value", oppeasutusedNode.get("educationalInstitution").get("contacts").has("contactEmail")
                  ? oppeasutusedNode.get("educationalInstitution").get("contacts").get("contactEmail").asText()
                  : null);
          stepAndmed.putObject("koduleht")
              .put("value", oppeasutusedNode.get("educationalInstitution").get("contacts").has("webpageAddress")
                  ? oppeasutusedNode.get("educationalInstitution").get("contacts").get("webpageAddress").asText()
                  : null);
        }
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
          ObjectNode fileTypes = getKlfNode("failiTyybid", false);
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
      String personalCode, String ownerRegCode) {
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
        .put("owner_id", ownerRegCode)
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
    String personalCode = jsonNode.get("header").get("agents").get(0).get("person_id").asText();

    if (isAcceptableActivityView(jsonNode)) {
      return jsonNode;
    }

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
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
          .mtsysEsitaTegevusluba(request, personalCode);

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

  public ObjectNode getMtsysOppeasutus(Long identifier, String ownerRegCode, String personalCode) {
    ObjectNode jsonNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS2 - getInstitutions.v1 (getInstitution)");
    logForDrupal.setSeverity("notice");

    try {
      GetInstitutionsRequest request = GetInstitutionsRequest.Factory.newInstance();
      request.setEducationalInstitutionUid(String.valueOf(identifier));
      request.setAction(Action.GET_INSTITUTION);
      GetInstitutionsResponse response = ehis2XRoadService.getInstitutions(request, personalCode, null, ownerRegCode);

      if (response.isSetMessages()) {
        response.getMessages().getMessageList().forEach(s -> {
          if (s.getType().equalsIgnoreCase("ERROR")) {
            jsonNode.putObject("error").put("message_type", "ERROR").putObject("message_text").put("et", s.getText());
            jsonNode.remove("educationalInstitution");
            jsonNode.remove("message");
          }
        });
      }
      if (response.isSetEducationalInstitution()) {
        ObjectNode educationalInstitutionNode = jsonNode.putObject("educationalInstitution");
        EducationalInstitutionExtended educationalInstitution = response.getEducationalInstitution();

        educationalInstitutionNode.putObject("generalData")
            .put("name", educationalInstitution.getName())
            .put("nameENG", educationalInstitution.getNameEng())
            .put("ownerType", educationalInstitution.getOwnerTypeCl())
            .put("ownershipType", educationalInstitution.getOwnershipTypeCl())
            .put("studyInstitutionType", educationalInstitution.getTypeCl());
        if (educationalInstitution.isSetOwners() && !educationalInstitution.getOwners().getOwnerList().isEmpty()) {
          educationalInstitution.getOwners().getOwnerList().stream()
              .filter(InstitutionOwner::getIsOwner)
              .forEach(s -> ((ObjectNode) educationalInstitutionNode.get("generalData"))
                  .put("owner", s.getInstitutionName() + " (" + s.getInstitutionRegNr() + ")"));
        }

        if (educationalInstitution.isSetLegalAddress()) {
          educationalInstitutionNode.putObject("address")
              .putNull("seqNo")
              .put("adsId", educationalInstitution.getLegalAddress().isSetAdsAdrId() ?
                  Long.valueOf(educationalInstitution.getLegalAddress().getAdsAdrId()) : null)
              .put("adsOid", educationalInstitution.getLegalAddress().getAdsOid())
              .put("klElukoht", educationalInstitution.getLegalAddress().isSetEhak() ?
                  Long.valueOf(educationalInstitution.getLegalAddress().getEhak()) : null)
              .putNull("county")
              .putNull("localGovernment")
              .putNull("settlementUnit")
              .put("address", educationalInstitution.getLegalAddress().getAddress())
              .put("addressFull", educationalInstitution.getLegalAddress().getFullAddress())
              .put("addressHumanReadable", educationalInstitution.getLegalAddress().getFullAddress());
        }

        if (educationalInstitution.isSetContacts()
            && educationalInstitution.getContacts().getContactList() != null
            && !educationalInstitution.getContacts().getContactList().isEmpty()) {
          ObjectNode contacts = educationalInstitutionNode.putObject("contacts");
          contacts.putNull("contactEmail")
              .putNull("webpageAddress")
              .putNull("contactPhone")
              .putNull("contactEmailUid")
              .putNull("webpageAddressUid")
              .putNull("contactPhoneUid");

          educationalInstitution.getContacts().getContactList().forEach(s -> {
            if (s.getTypeCl().equalsIgnoreCase("INSTITUTION_CONTACT_TYPE:PRIMARY_EMAIL")) {
              contacts.put("contactEmail", s.getValue());
              contacts.put("contactEmailUid", s.getUid());
            } else if (s.getTypeCl().equalsIgnoreCase("INSTITUTION_CONTACT_TYPE:WEBSITE")) {
              contacts.put("webpageAddress", s.getValue());
              contacts.put("webpageAddressUid", s.getUid());
            } else if (s.getTypeCl().equalsIgnoreCase("INSTITUTION_CONTACT_TYPE:PHONE")) {
              contacts.put("contactPhone", s.getValue());
              contacts.put("contactPhoneUid", s.getUid());
            }
          });
        }
      }

      logForDrupal.setMessage("EHIS2 - getInstitutions.v1 (getInstitution) teenuselt andmete pärimine õnnestus.");
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

    redisTemplate.opsForHash().put(ownerRegCode, "educationalInstitution_" + identifier, jsonNode);
    redisTemplate.expire(ownerRegCode, redisExpire, TimeUnit.MINUTES);

    return jsonNode;
  }

  public ObjectNode postMtsysLaeOppeasutus(ObjectNode jsonNodeRequest, String personalCode) {
    ObjectNode jsonNodeResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser("SYSTEM - XROAD");
    logForDrupal.setType("EHIS2 - postInstitutions.v1 (saveEducationalInstitution)");
    logForDrupal.setSeverity("notice");

    try {
      XRoadMessage<PostInstitutionsRequest> xRoadMessage = new XmlBeansXRoadMessage<>(
          PostInstitutionsRequest.Factory.newInstance());
      PostInstitutionsResponse response = null;
      String partyCode = jsonNodeRequest.get("ownerId").asText();

      if (jsonNodeRequest.get("educationalInstitutionId") != null
          && !jsonNodeRequest.get("educationalInstitutionId").asText("").equals("")
          && jsonNodeRequest.get("educationalInstitution").get("contacts") != null) {
        xRoadMessage.getContent().setAction(PostInstitutionsRequest.Action.SAVE_CONTACTS);
        xRoadMessage.getContent().setEducationalInstitutionUid(jsonNodeRequest.get("educationalInstitutionId").asText());
        InstitutionsContactsPost request = xRoadMessage.getContent().addNewContacts();
        if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhone") != null
            && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhone").asText("").equals("")) {
          InstitutionsContactPost contactPhone = request.addNewContact();
          contactPhone.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_PHONE);
          contactPhone.setValue(jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhone").asText());
          if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhoneUid") != null
              && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhoneUid").asText("").equals("")) {
            contactPhone.setUid(jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhoneUid").asText());
          }
        }
        if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmail") != null
            && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmail").asText("").equals("")) {
          InstitutionsContactPost contactEmail = request.addNewContact();
          contactEmail.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_PRIMARY_EMAIL);
          contactEmail.setValue(jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmail").asText());
          if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmailUid") != null
              && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmailUid").asText("").equals("")) {
            contactEmail.setUid(jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmailUid").asText());
          }
        }
        if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddress") != null
            && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddress").asText("").equals("")) {
          InstitutionsContactPost contactWebAddress = request.addNewContact();
          contactWebAddress.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_WEBSITE);
          String webpageAddress = jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddress").asText();
          contactWebAddress.setValue(webpageAddress.toLowerCase().startsWith("http") ? webpageAddress : "http://" + webpageAddress);
          if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddressUid") != null
              && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddressUid").asText("").equals("")) {
            contactWebAddress.setUid(jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddressUid").asText());
          }
        }
        response = ehis2XRoadService.postInstitutions(xRoadMessage, personalCode, null, partyCode);
      } else {
        boolean doXRoadRequest = true;
        xRoadMessage.getContent().setEducationalInstitutionUid("0");
        xRoadMessage.getContent().setAction(PostInstitutionsRequest.Action.SAVE_EDUCATIONAL_INSTITUTION);
        PostEducationalInstitution request = xRoadMessage.getContent().addNewSaveEducationalInstitution();
        request.setChangeDate(Calendar.getInstance());
        request.setRegNr(jsonNodeRequest.get("ownerId").asText());
        if (jsonNodeRequest.get("educationalInstitution").get("generalData") != null) {
          request.setName(jsonNodeRequest.get("educationalInstitution").get("generalData").get("name").asText());
          if (jsonNodeRequest.get("educationalInstitution").get("generalData").get("nameENG") != null
              && !jsonNodeRequest.get("educationalInstitution").get("generalData").get("nameENG").asText("").equals("")) {
            request.setNameEng(jsonNodeRequest.get("educationalInstitution").get("generalData").get("nameENG").asText());
          }
          request.setTypeCl(jsonNodeRequest.get("educationalInstitution").get("generalData").get("studyInstitutionType").asText());
          request.setOwnershipTypeCl(jsonNodeRequest.get("educationalInstitution").get("generalData").get("ownershipType").asText());
          request.setOwnerTypeCl(jsonNodeRequest.get("educationalInstitution").get("generalData").get("ownerType").asText());
        }
        OwnerPost owner = request.addNewOwners().addNewOwner();
        owner.setIsOwner(true);
        owner.setInstitutionRegNr(partyCode);

        if (jsonNodeRequest.get("educationalInstitution").get("address") != null
            || jsonNodeRequest.get("educationalInstitution").get("contacts") != null) {
          response = ehis2XRoadService.postInstitutions(xRoadMessage, personalCode, null, partyCode);

          if (response.isSetMessage() && response.getMessage().getType().equalsIgnoreCase("ERROR")
              || response.isSetMessages() && response.getMessages().getMessageList() != null
              && response.getMessages().getMessageList().stream().anyMatch(s -> s.getType().equalsIgnoreCase("ERROR"))) {
            doXRoadRequest = false;
          } else {
            xRoadMessage = new XmlBeansXRoadMessage<>(PostInstitutionsRequest.Factory.newInstance());
            xRoadMessage.getContent().setAction(PostInstitutionsRequest.Action.SAVE_CONTACTS);
            xRoadMessage.getContent().setEducationalInstitutionUid(response.getEducationalInstitution().getEducationalInstitutionUid());
            InstitutionsContactsPost contactRequest = xRoadMessage.getContent().addNewContacts();
            if (jsonNodeRequest.get("educationalInstitution").get("address") != null ) {
              InstitutionsContactPost contactAddress = contactRequest.addNewContact();
              contactAddress.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_LEGAL_ADDRESS);
              InstitutionsAddressesPost addresses = contactAddress.addNewAddresses();
              InstitutionsAddressPost address = addresses.addNewAddress();
              if (!jsonNodeRequest.get("educationalInstitution").get("address").get("adsOid").asText("").equals("")) {
                address.setAdsOid(jsonNodeRequest.get("educationalInstitution").get("address").get("adsOid").asText());
              }
              if (!jsonNodeRequest.get("educationalInstitution").get("address").get("address").asText("").equals("")) {
                address.setAddress(jsonNodeRequest.get("educationalInstitution").get("address").get("address").asText());
              }
            }
            if (jsonNodeRequest.get("educationalInstitution").get("contacts") != null) {
              if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhone") != null
                  && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhone").asText("").equals("")) {
                InstitutionsContactPost contactPhone = contactRequest.addNewContact();
                contactPhone.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_PHONE);
                contactPhone.setValue(jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactPhone").asText());
              }
              if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmail") != null
                  && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmail").asText("").equals("")) {
                InstitutionsContactPost contactEmail = contactRequest.addNewContact();
                contactEmail.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_PRIMARY_EMAIL);
                contactEmail.setValue(jsonNodeRequest.get("educationalInstitution").get("contacts").get("contactEmail").asText());
              }
              if (jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddress") != null
                  && !jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddress").asText("").equals("")) {
                InstitutionsContactPost contactWebAddress = contactRequest.addNewContact();
                contactWebAddress.setTypeCl(TypeCl.INSTITUTION_CONTACT_TYPE_WEBSITE);
                String webpageAddress = jsonNodeRequest.get("educationalInstitution").get("contacts").get("webpageAddress").asText();
                contactWebAddress.setValue(webpageAddress.toLowerCase().startsWith("http") ? webpageAddress : "http://" + webpageAddress);
              }
            }
          }
        }

        if (doXRoadRequest) {
          response = ehis2XRoadService.postInstitutions(xRoadMessage, personalCode, null, partyCode);
        }
      }

      if (response != null && (response.isSetMessage()
          && response.getMessage().getType().equalsIgnoreCase("ERROR")
          || response.isSetMessages() && response.getMessages().getMessageList() != null
          && response.getMessages().getMessageList().stream().anyMatch(s -> s.getType().equalsIgnoreCase("ERROR")))) {
        logForDrupal.setSeverity("ERROR");
        StringBuilder message = new StringBuilder(
            response.isSetMessage() ? response.getMessage().getText() : ";");
        if(response.isSetMessages()) {
          for (Message m : response.getMessages().getMessageList()) {
            message.append(m.getText()).append(";");
          }
        }
        logForDrupal.setMessage(message.toString());
        logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
        log.info(logForDrupal.toString());
        return jsonNodeResponse.putObject("error").put("message_type", "ERROR")
            .putObject("message_text").put("et", "Tehniline viga!");
      }

      if (jsonNodeRequest.get("educationalInstitutionId") != null
          && !jsonNodeRequest.get("educationalInstitutionId").asText("").equals("")) {
        jsonNodeResponse.put("message","Õppeasutuse andmed muudetud!");
      } else {
        jsonNodeResponse.put("message","Õppeasutuse andmed lisatud!");
      }

      logForDrupal.setMessage("EHIS2 - postInstitutions.v1 (saveEducationalInstitution) teenusega andmete lisamine õnnestus.");
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

  public ObjectNode getMtsysTegevusNaitaja(String formName, String identifier, String personalCode,
      Long institutionId, String ownerRegCode) {
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
    logForDrupal.setUser(ownerRegCode);
    logForDrupal.setType("EHIS2 - getInstitutions.v1 (getPerformanceReport)");
    logForDrupal.setSeverity("notice");

    try {
      GetInstitutionsRequest request = GetInstitutionsRequest.Factory.newInstance();
      request.setAction(Action.GET_PERFORMANCE_REPORT);
      request.setEducationalInstitutionUid(institutionId.toString());
      request.addNewGetPerformanceReport().setReportUid(identifier);
      GetInstitutionsResponse response = ehis2XRoadService.getInstitutions(request, personalCode, null, ownerRegCode);

      if (response.isSetMessages()) {
        setEhis2MessageToJsonMessages(jsonNode, response.getMessages());
      }

      if (response.isSetPerformanceReportResponse()) {
        PerformanceReport report = response.getPerformanceReportResponse().getPerformanceReportArray(0);

        if (report.getEditAllowed()) {
          ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).add("CHANGE");
        }

        ObjectNode step0DataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_0").putObject("data_elements");

        step0DataElementsNode.putObject("aasta").put("value", report.getReportYear());
        step0DataElementsNode.putObject("staatus").put("value", report.isSetReportStatusCl() ? report.getReportStatusCl() : null);
        step0DataElementsNode.putObject("esitamiseKp").put("value", report.isSetDateOfEntry() ? report.getDateOfEntry().replaceFirst("^(\\d{4})-(\\d{2})-(\\d{2})$", "$3.$2.$1") : null);
        step0DataElementsNode.putObject("kommentaar").put("value", report.isSetReportComment() ? report.getReportComment() : null);

        step0DataElementsNode.putObject("majandustegevuseTeateTabel").put("hidden", true).putArray("value");
        step0DataElementsNode.putObject("tegevuslubaTabel").put("hidden", true).putArray("value");
        step0DataElementsNode.putObject("kokkuTabel").put("hidden", true).putArray("value");

        ObjectNode tegevusloaLiigidNode = getKlfNode("tegevusloaLiigid", true);
        ObjectNode eestiKeeleTasemedNode = getKlfNode("eestiKeeleTasemed", true);
        ObjectNode soidukiKategooriadNode = getKlfNode("soidukiKategooriad", true);
        ObjectNode opperyhmad = getKlfNode("opperyhmad", true);

        report.getMetricsGroups().getMetricsGroupList().forEach(s -> {
          if (s.getGroupCl().equals(GroupCl.PERFORMANCE_REPORT_METRICS_GROUP_ACTIVITY_LICENCE_DOMAINS)) {
            ((ObjectNode) step0DataElementsNode.get("tegevuslubaTabel")).put("hidden", false);

            s.getMetrics().getMetricList().forEach(item -> {
              String nimetus = tegevusloaLiigidNode.get(item.getActivityLicenceCl()).get("et").asText();
              if (item.isSetStateLanguageCategoryCl()) {
                nimetus += " - " + eestiKeeleTasemedNode.get(item.getStateLanguageCategoryCl()).get("et").asText();
              }
              if (item.isSetRightToDriveCategoryCl()) {
                nimetus += " - " + soidukiKategooriadNode.get(item.getRightToDriveCategoryCl()).get("et").asText();
              }

              ((ArrayNode) step0DataElementsNode.get("tegevuslubaTabel").get("value")).addObject()
                  .put("nimetus", nimetus)
                  .put("oppijateArv", item.isSetStudentCount() ? item.getStudentCount() : null)
                  .put("tunnistusteArv", item.isSetDiplomaCount() ? item.getDiplomaCount() : null)
                  .put("kuni8", item.isSetUpTo8() ? item.getUpTo8() : null)
                  .put("kuni26", item.isSetUpTo26() ? item.getUpTo26() : null)
                  .put("kuni80", item.isSetUpTo80() ? item.getUpTo80() : null)
                  .put("kuni240", item.isSetUpTo240() ? item.getUpTo240() : null)
                  .put("yle240", item.isSetOver240() ? item.getOver240() : null);
            });
          } else if (s.getGroupCl().equals(GroupCl.PERFORMANCE_REPORT_METRICS_GROUP_STUDY_PROGRAMME_GROUPS)) {
            ((ObjectNode) step0DataElementsNode.get("majandustegevuseTeateTabel")).put("hidden", false);

            s.getMetrics().getMetricList().forEach(item ->
                ((ArrayNode) step0DataElementsNode.get("majandustegevuseTeateTabel").get("value")).addObject()
                .put("nimetus", opperyhmad.get(item.getStudyProgrammeGroupCl()).get("et").asText())
                .put("oppijateArv", item.isSetStudentCount() ? item.getStudentCount() : null)
                .put("tunnistusteArv", item.isSetDiplomaCount() ? item.getDiplomaCount() : null)
                .put("kuni8", item.isSetUpTo8() ? item.getUpTo8() : null)
                .put("kuni26", item.isSetUpTo26() ? item.getUpTo26() : null)
                .put("kuni80", item.isSetUpTo80() ? item.getUpTo80() : null)
                .put("kuni240", item.isSetUpTo240() ? item.getUpTo240() : null)
                .put("yle240", item.isSetOver240() ? item.getOver240() : null));
          }
        });
      }

      logForDrupal.setMessage("EHIS2 - getInstitutions.v1 (getPerformanceReport) teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      super.setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysTegevusNaitajaTaotlus(String formName, Long identifier, Long year,
      Long educationalInstitutionsId, String personalCode, String ownerRegCode) {
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
        .put("owner_id", ownerRegCode)
        .put("educationalInstitutions_id", educationalInstitutionsId);

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages").put("default", "default");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(ownerRegCode);
    logForDrupal.setType("EHIS2 - getInstitutions.v1 (getPerformanceReport)");
    logForDrupal.setSeverity("notice");

    try {
      GetInstitutionsRequest request = GetInstitutionsRequest.Factory.newInstance();
      request.setEducationalInstitutionUid(educationalInstitutionsId.toString());

      if (identifier != null) {
        request.setAction(Action.GET_PERFORMANCE_REPORT);
        request.addNewGetPerformanceReport().setReportUid(identifier.toString());
      } else if (year != null) {
        request.setAction(Action.GET_PERFORMANCE_REPORT_METRICS);
        request.addNewGetPerformanceReportMetrics().setReportYear(year.intValue());
      }

      GetInstitutionsResponse response = ehis2XRoadService.getInstitutions(request, personalCode, null, ownerRegCode);

      if (response.isSetMessages()) {
        setEhis2MessageToJsonMessages(jsonNode, response.getMessages());
      }

      if (response.isSetPerformanceReportResponse()) {
        PerformanceReportResponse performanceReportResponse = response.getPerformanceReportResponse();

        if (year == null) {
          if (performanceReportResponse.isSetReportYear()) {
            year = Long.valueOf(performanceReportResponse.getReportYear());
          } else if (!performanceReportResponse.getPerformanceReportList().isEmpty()) {
            year = (long) performanceReportResponse.getPerformanceReportList().get(0).getReportYear();
          }
        }

        ((ObjectNode) jsonNode.get("header")).putObject("parameters").put("aasta", year);
        ((ObjectNode) jsonNode.get("header")).putObject("parameters").put("fileSubmit", false);

        String reportUid = null;
        Collection<MetricsGroup> metricsGroupCollection;
        if (!performanceReportResponse.getPerformanceReportList().isEmpty()) {
          reportUid = performanceReportResponse.getPerformanceReportList().get(0).getReportUid();
          metricsGroupCollection = performanceReportResponse.getPerformanceReportList().get(0).getMetricsGroups().getMetricsGroupList();
        } else {
          metricsGroupCollection = performanceReportResponse.getMetricsGroup().getMetricsGroupList();
        }
        setMtsysTegevusnaitajaTaotlus(year, educationalInstitutionsId, jsonNode, reportUid, metricsGroupCollection, personalCode, ownerRegCode);
      }
      logForDrupal.setMessage("EHIS2 - getInstitutions.v1 (getPerformanceReport) teenuselt andmete pärimine õnnestus.");
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
    String ownerRegCode = jsonNode.get("header").get("agents").get(0).get("owner_id").asText();
    String personalCode = jsonNode.get("header").get("agents").get(0).get("person_id").asText();
    String activity =  jsonNode.get("header").get("activity").asText();

    if (isAcceptableActivityView(jsonNode)) {
      return jsonNode;
    }

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS2 - postInstitutions.v1 (saveMetrics)");
    logForDrupal.setSeverity("notice");

    try {
      jsonNode.get("body").get("messages")
          .forEach(t -> ((ObjectNode) jsonNode.get("messages")).remove(t.asText()));
      ((ArrayNode) jsonNode.get("body").get("messages")).removeAll();

      //SAVE, SUBMIT
      ObjectNode dataElementNode = (ObjectNode) jsonNode.get("body").get("steps")
          .get("step_aruanne").get("data_elements");
      Long educationalInstitutionsId = dataElementNode.get("oppeasutusId").get("value").asLong();
      Long year = dataElementNode.get("aasta").get("value").asLong();

      XRoadMessage<PostInstitutionsRequest> xRoadMessage =
          new XmlBeansXRoadMessage<>(PostInstitutionsRequest.Factory.newInstance());
      PostInstitutionsRequest request = xRoadMessage.getContent();
      request.setEducationalInstitutionUid(educationalInstitutionsId.toString());
      request.setAction(PostInstitutionsRequest.Action.SAVE_METRICS);
      InstitutionsPerformanceReportPost report = request.addNewPerformanceReport();
      if (identifier != null) {
        report.setReportUid(identifier.toString());
      }
      report.setReportYear(year.intValue());

      if (jsonNode.get("header").get("parameters").get("fileSubmit").asBoolean()) {
        String fileIdentifier = dataElementNode.get("esitamiseksCSV").get("value")
            .get(0).get("file_identifier").asText();
        String fileName = dataElementNode.get("esitamiseksCSV").get("value")
            .get(0).get("file_name").asText();
        String contentType = "text/csv; name=" + (StringUtils.isNotBlank(fileName) ? fileName : "tegevusnaitajad.csv");
        report.setReportFile("cid:" + fileIdentifier);
        DataHandler dataHandler = new DataHandler(
            new ByteArrayDataSource(contentType, Base64.getDecoder()
                .decode((String) redisFileTemplate.opsForHash().get(ownerRegCode,  fileIdentifier))));
//      report.setReportFileHandler(dataHandler);
        xRoadMessage.getAttachments().add(new XRoadAttachment(fileIdentifier, dataHandler));
      } else {
        MetricsPost naitajad = report.addNewReportMetrics();
        if (activity.equalsIgnoreCase("SAVE")) {
          naitajad.setReportStatusCl(ReportStatusCl.TKA_TEGEVUSNAITAJA_STAATUS_TKATN_STAATUS_SIS);
        } else if (activity.equalsIgnoreCase("SUBMIT")) {
          naitajad.setReportStatusCl(ReportStatusCl.TKA_TEGEVUSNAITAJA_STAATUS_TKATN_STAATUS_ESI);
        }

        MetricsGroups metricsGroups = MetricsGroups.Factory.newInstance();
        if (dataElementNode.get("majandustegevuseTeateTabel").get("value").size() > 0) {
          MetricsGroup majandustegevuseTeateMetricsGroup = metricsGroups.addNewMetricsGroup();
          majandustegevuseTeateMetricsGroup.setGroupCl(GroupCl.PERFORMANCE_REPORT_METRICS_GROUP_STUDY_PROGRAMME_GROUPS);
          Metrics majandustegevuseTeateMetrics = majandustegevuseTeateMetricsGroup.addNewMetrics();
          dataElementNode.get("majandustegevuseTeateTabel").get("value").forEach(item -> {
            Metric metric = majandustegevuseTeateMetrics.addNewMetric();
            metric.setActivityLicenceCl(item.get("klOkLiik").asText());
            if (!item.get("klOpperuhm").asText("").equals("")) {
              metric.setStudyProgrammeGroupCl(item.get("klOpperuhm").asText());
            }
            if (!item.get("klKategooria").asText("").equals("")) {
              metric.setRightToDriveCategoryCl(item.get("klKategooria").asText());
            }
            if (!item.get("klEkTase").asText("").equals("")) {
              metric.setStateLanguageCategoryCl(item.get("klEkTase").asText());
            }
            metric.setStudentCount(item.get("oppijateArv").asInt());
            metric.setDiplomaCount(item.get("tunnistusteArv").asInt());
            metric.setUpTo8(item.get("kuni8").asInt());
            metric.setUpTo26(item.get("kuni26").asInt());
            metric.setUpTo80(item.get("kuni80").asInt());
            metric.setUpTo240(item.get("kuni240").asInt());
            metric.setOver240(item.get("yle240").asInt());
          });
        }

        if (dataElementNode.get("tegevuslubaTabel").get("value").size() > 0) {
          MetricsGroup tegevuslubaMetricsGroup = metricsGroups.addNewMetricsGroup();
          tegevuslubaMetricsGroup.setGroupCl(GroupCl.PERFORMANCE_REPORT_METRICS_GROUP_ACTIVITY_LICENCE_DOMAINS);
          Metrics tegevuslubaMetrics = tegevuslubaMetricsGroup.addNewMetrics();
          dataElementNode.get("tegevuslubaTabel").get("value").forEach(item -> {
            Metric metric = tegevuslubaMetrics.addNewMetric();
            metric.setActivityLicenceCl(item.get("klOkLiik").asText());
            if (!item.get("klOpperuhm").asText("").equals("")) {
              metric.setStudyProgrammeGroupCl(item.get("klOpperuhm").asText());
            }
            if (!item.get("klKategooria").asText("").equals("")) {
              metric.setRightToDriveCategoryCl(item.get("klKategooria").asText());
            }
            if (!item.get("klEkTase").asText("").equals("")) {
              metric.setStateLanguageCategoryCl(item.get("klEkTase").asText());
            }
            metric.setStudentCount(item.get("oppijateArv").asInt());
            metric.setDiplomaCount(item.get("tunnistusteArv").asInt());
            metric.setUpTo8(item.get("kuni8").asInt());
            metric.setUpTo26(item.get("kuni26").asInt());
            metric.setUpTo80(item.get("kuni80").asInt());
            metric.setUpTo240(item.get("kuni240").asInt());
            metric.setOver240(item.get("yle240").asInt());
          });
        }
        naitajad.setMetricsGroups(metricsGroups);
      }

      PostInstitutionsResponse response = ehis2XRoadService.postInstitutions(xRoadMessage, personalCode, null, ownerRegCode);

      if (response.isSetMessage() || response.isSetMessages()) {
        setEhis2MessageToJsonMessages(jsonNode, response.getMessages(), response.getMessage(), false);
        return jsonNode;
      }

      if (response.isSetPerformanceReport()) {
        if (response.getPerformanceReport().isSetReportUid()) {
          ((ObjectNode) jsonNode.get("header")).put("identifier",
              response.getPerformanceReport().getReportUid());
        }
        ((ObjectNode) jsonNode.get("header")).putObject("parameters").put("fileSubmit", false);
        setMtsysTegevusnaitajaTaotlus(year, educationalInstitutionsId, jsonNode,
            response.getPerformanceReport().getReportUid(),
            response.getPerformanceReport().getMetricsGroups().getMetricsGroupList(),
            personalCode, ownerRegCode);

        if (activity.equalsIgnoreCase("SUBMIT")) {
          ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
          ((ArrayNode) jsonNode.get("body").get("messages")).add("submitted_notice");
          ((ObjectNode) jsonNode.get("messages")).putObject("submitted_notice")
              .put("message_type", "NOTICE").putObject("message_text")
              .put("et", "Tegevusnäitajad on esitatud!");
        } else {
          ((ArrayNode) jsonNode.get("body").get("messages")).add("saved_notice");
          ((ObjectNode) jsonNode.get("messages")).putObject("saved_notice")
              .put("message_type", "NOTICE").putObject("message_text")
              .put("et", "Tegevusnäitajad salvestatud. Aruande esitamiseks vajutage nupule 'Esita'!");
        }
      }

      logForDrupal.setMessage("EHIS2 - postInstitutions.v1 (saveMetrics) teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e);
      setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getMtsysEsitaTegevusNaitaja(Long identifier, Long educationalInstitutionsId,
      String personalCode, String ownerRegCode) {
    ObjectNode jsonNode;
    try {
      jsonNode = getMtsysTegevusNaitajaTaotlus("MTSYS_TEGEVUSNAITAJAD_ARUANNE",
            identifier, null, educationalInstitutionsId, personalCode, ownerRegCode);
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());
      jsonNode = getMtsysTegevusNaitaja("MTSYS_TEGEVUSNAITAJAD", identifier.toString(),
          personalCode, educationalInstitutionsId, ownerRegCode);
      ((ArrayNode) jsonNode.get("body").get("messages")).add("error_message");
      ((ObjectNode) jsonNode.get("messages")).putObject("error_message")
          .put("message_type", "ERROR").putObject("message_text")
          .put("et", "Tehniline viga!");
    }
    return jsonNode;
  }

  public ObjectNode deleteDocument(Integer identifier, String personalCode) {
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
      String personalCode) throws Exception {
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
      ObjectNode klfOppekavaOppetasemed = getKlfNode("oppekavaOppetasemed", false);
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
      ObjectNode klfOppekavaRyhmad = getKlfNode("opperyhmad", false);
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
          aadress.setAdsAadress(item.get("address").asText());
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
        .mtsysLaeTegevusluba(request, personalCode);

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
        .mtsysTegevusluba(response.getTaotlusId(), personalCode);

    setTegevuslubaStepAndmedXJSONData(jsonNode, getKlfNode("failiTyybid", false), mtsysTegevuslubaResponse,
        null);
  }

  private void setMtsysTegevusnaitajaTaotlus(Long year, Long educationalInstitutionsId,
      ObjectNode jsonNode, String reportUid, Collection<MetricsGroup> metricsGroupCollection,
      String personalCode, String ownerRegCode) throws Exception{
    ObjectNode dataElementsNode = ((ObjectNode) jsonNode.get("body").get("steps"))
        .putObject("step_aruanne").putObject("data_elements");

    dataElementsNode.putObject("aasta").put("value", year);
    dataElementsNode.putObject("oppeasutusId").put("value", educationalInstitutionsId);

    try {
      GetInstitutionsRequest request = GetInstitutionsRequest.Factory.newInstance();
      request.setEducationalInstitutionUid(educationalInstitutionsId.toString());
      request.setAction(Action.GET_PERFORMANCE_REPORT_FILE);
      if (reportUid != null) {
        request.addNewGetPerformanceReportFile().setReportUid(reportUid);
      } else {
        request.addNewGetPerformanceReportFile().setReportYear(year.intValue());
      }

      GetInstitutionsResponse fileResponse = ehis2XRoadService.getInstitutions(request, personalCode, null, ownerRegCode);

      if (fileResponse.isSetMessages()) {
        setEhis2MessageToJsonMessages(jsonNode, fileResponse.getMessages());
      }

      if (fileResponse.isSetFile()) {
        String redisHK = "mtsys_tegevusnaitajad_aruanne_eeltaidetud_" + educationalInstitutionsId + "_" + year;
        dataElementsNode.putObject("eeltaidetudCSV").putArray("value").addObject()
            .put("file_name", "tegevusnaitajad.csv")
            .put("file_identifier", redisHK);
        redisFileTemplate.opsForHash().put(ownerRegCode, redisHK, Base64.getEncoder().encodeToString(FileCopyUtils.copyToByteArray(fileResponse.getFileHandler().getInputStream())));
        redisFileTemplate.expire(ownerRegCode, redisFileExpire, TimeUnit.MINUTES);
      } else {
        dataElementsNode.putObject("eeltaidetudCSV").put("hidden", true).putNull("value");
      }

    } catch (Exception e) {
      log.error(e.getMessage(), e);
      dataElementsNode.putObject("eeltaidetudCSV").put("hidden", true).putNull("value");
    }

    dataElementsNode.putObject("majandustegevuseTeateTabel").put("hidden", true).putArray("value");
    dataElementsNode.putObject("tegevuslubaTabel").put("hidden", true).putArray("value");

    ObjectNode tegevusloaLiigidNode = getKlfNode("tegevusloaLiigid", true);
    ObjectNode eestiKeeleTasemedNode = getKlfNode("eestiKeeleTasemed", true);
    ObjectNode soidukiKategooriadNode = getKlfNode("soidukiKategooriad", true);
    ObjectNode opperyhmad = getKlfNode("opperyhmad", true);

    metricsGroupCollection.forEach(s -> {
      if (s.getGroupCl().equals(GroupCl.PERFORMANCE_REPORT_METRICS_GROUP_ACTIVITY_LICENCE_DOMAINS)) {
        ((ObjectNode) dataElementsNode.get("tegevuslubaTabel")).put("hidden", false);

        s.getMetrics().getMetricList().forEach(item -> {
          String nimetus = tegevusloaLiigidNode.get(item.getActivityLicenceCl()).get("et").asText();
          if (item.isSetStateLanguageCategoryCl()) {
            nimetus += " - " + eestiKeeleTasemedNode.get(item.getStateLanguageCategoryCl()).get("et").asText();
          }
          if (item.isSetRightToDriveCategoryCl()) {
            nimetus += " - " + soidukiKategooriadNode.get(item.getRightToDriveCategoryCl()).get("et").asText();
          }

          ((ArrayNode) dataElementsNode.get("tegevuslubaTabel").get("value")).addObject()
              .put("nimetus", nimetus)
              .put("oppijateArv", item.getStudentCount())
              .put("tunnistusteArv", item.getDiplomaCount())
              .put("kuni8", item.getUpTo8())
              .put("kuni26", item.getUpTo26())
              .put("kuni80", item.getUpTo80())
              .put("kuni240", item.getUpTo240())
              .put("yle240", item.getOver240())
              .put("kokku", 0)
              .put("klOkLiik", item.getActivityLicenceCl())
              .put("klOpperuhm", item.getStudyProgrammeGroupCl())
              .put("klKategooria", item.getRightToDriveCategoryCl())
              .put("klEkTase", item.getStateLanguageCategoryCl());
        });
      } else if (s.getGroupCl().equals(GroupCl.PERFORMANCE_REPORT_METRICS_GROUP_STUDY_PROGRAMME_GROUPS)) {
        ((ObjectNode) dataElementsNode.get("majandustegevuseTeateTabel")).put("hidden", false);

        s.getMetrics().getMetricList().forEach(item ->
            ((ArrayNode) dataElementsNode.get("majandustegevuseTeateTabel").get("value")).addObject()
                .put("nimetus", opperyhmad.get(item.getStudyProgrammeGroupCl()).get("et").asText())
                .put("oppijateArv", item.getStudentCount())
                .put("tunnistusteArv", item.getDiplomaCount())
                .put("kuni8", item.getUpTo8())
                .put("kuni26", item.getUpTo26())
                .put("kuni80", item.getUpTo80())
                .put("kuni240", item.getUpTo240())
                .put("yle240", item.getOver240())
                .put("kokku", 0)
                .put("klOkLiik", item.getActivityLicenceCl())
                .put("klOpperuhm", item.getStudyProgrammeGroupCl())
                .put("klKategooria", item.getRightToDriveCategoryCl())
                .put("klEkTase", item.getStateLanguageCategoryCl()));
      }
    });
  }
  private ObjectNode getKlfNode(String hashKey, boolean isEHIS2d) throws Exception {
    return getKlfNode(hashKey, isEHIS2d, 0);
  }
  private ObjectNode getKlfNode(String hashKey, boolean isEHIS2, int timesTried) throws Exception {
    ObjectNode result = (ObjectNode) redisTemplate.opsForHash().get(MTSYSKLF_KEY, hashKey);
    ObjectNode failSafe = (ObjectNode) redisTemplate.opsForHash().get(MTSYSKLF_KEY, "failSafe");
    if (result == null || failSafe == null || failSafe.get(hashKey) == null
       || (!isEHIS2 && !failSafe.get(hashKey).get("ehis1").asBoolean())
       || (isEHIS2 && !failSafe.get(hashKey).get("ehis2").asBoolean())) {
      if (timesTried > 4) {
        throw new Exception("Ei saanud kätte EHIS1/EHIS2 klassifikaatoreid, proovitud 5 korda!");
      }

      getMtsysKlf();
      timesTried++;
      return getKlfNode(hashKey, isEHIS2, timesTried);
    }

    return result;
  }

  private void createTegevuslubaXJSON(String formName, Long identifier, String ownerRegCode,
      String personalCode, ObjectNode jsonNode) {
    jsonNode.putObject("header")
        .put("endpoint", "EHIS")
        .put("form_name", formName)
        .putNull("current_step")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("VIEW");

    ((ObjectNode) jsonNode.get("header")).putArray("agents").addObject()
        .put("person_id", personalCode)
        .putNull("role")
        .put("owner_id", ownerRegCode)
        .putNull("educationalInstitutions_id");

    ((ObjectNode) jsonNode.get("header")).putObject("parameters");

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages").put("default", "default");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(ownerRegCode);
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

    stepAndmedDataElements.putObject("menetlejaKommentaar")
        .put("required", false)
        .put("hidden", true)
        .putArray("value");

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
    if (!klOkLiik.equals(18098L) && klfFailiTyybid != null) {
      Iterator<Entry<String, JsonNode>> fileTypes = klfFailiTyybid.fields();
      while (fileTypes.hasNext()) {
        Entry<String, JsonNode> fileType = fileTypes.next();
        fileType.getValue().get("okLiik").forEach(i -> {
          if (klOkLiik.equals(i.get("klOkLiik").asLong())) {
            //EDU-82 Eemaldada turvatöötaja tegevusloalt PPA arvamus
            if(klOkLiik.equals(18053L) && fileType.getKey().equals("18080")) {}
            else {
              dokumendidValue.addObject()
                      .put("liik", i.get("required").asBoolean() ?
                              fileType.getValue().get("et").asText() + " *" :
                              fileType.getValue().get("et").asText())
                      .put("klLiik", Long.valueOf(fileType.getKey()));
            }
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

      ((ObjectNode) stepAndmedDataElements.get("menetlejaKommentaar"))
          .put("hidden", !response.getTegevusloaAndmed().isSetKlStaatus()
              || response.getTegevusloaAndmed().getKlStaatus().intValue() != 15669);
      ((ArrayNode) stepAndmedDataElements.get("menetlejaKommentaar").get("value")).removeAll()
          .addObject().put("nimetus", response.getTegevusloaAndmed().getMenetlejaKommentaar());

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

  private void setEhis2MessageToJsonMessages(ObjectNode jsonNode, Messages messages) {
    setEhis2MessageToJsonMessages(jsonNode, messages, null, true);
  }

  private void setEhis2MessageToJsonMessages(ObjectNode jsonNode, Messages messages, Message message, boolean readOnly) {
    if (readOnly) {
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
    }

    if (message != null) {
      ((ArrayNode) jsonNode.get("body").get("messages")).add(message.getCode());
      ((ObjectNode) jsonNode.get("messages")).putObject(message.getCode())
          .put("message_type", message.getType().equalsIgnoreCase("SUCCESS")
              || message.getType().equalsIgnoreCase("INFO") ? "NOTICE" : message.getType())
          .putObject("message_text")
          .put("et", message.isSetField() ? "'" + message.getField() + "': " + message.getText() : message.getText());
    }

    if (messages != null) {
      messages.getMessageList().forEach(s -> {
        ((ArrayNode) jsonNode.get("body").get("messages")).add(s.getCode());
        ((ObjectNode) jsonNode.get("messages")).putObject(s.getCode())
            .put("message_type", s.getType().equalsIgnoreCase("SUCCESS")
                || s.getType().equalsIgnoreCase("INFO") ? "NOTICE" : s.getType())
            .putObject("message_text")
            .put("et", s.isSetField() ? "'" + s.getField() + "': " + s.getText() : s.getText());
      });
    }
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
