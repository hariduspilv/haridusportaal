package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.MtsysKlfTeenusResponseDocument.MtsysKlfTeenusResponse;
import java.math.BigInteger;
import java.sql.Timestamp;
import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

@Service
public class MtsysWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(MtsysWorker.class);

  private static final String MTSYSKLF_KEY = "klassifikaator";

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
}
