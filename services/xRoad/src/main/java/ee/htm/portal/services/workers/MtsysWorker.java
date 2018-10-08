package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysTegevuslubaResponseDocument.MtsysTegevuslubaResponse;
import java.math.BigInteger;
import java.sql.Timestamp;
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

  public Object getMtsysTegevusluba(String formName, String identifier, String personalCode) {
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
}
