package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nortal.jroad.model.XRoadAttachment;
import com.nortal.jroad.model.XRoadMessage;
import ee.htm.portal.services.client.EisXRoadService;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKehtivusResponseDocument.ETunnistusKehtivusResponse;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKehtivusVastus;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKodResponseDocument.ETunnistusKodResponse;
import ee.htm.portal.services.types.eu.x_road.eis.v4.ETunnistusKodVastus;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestidKodJadaItem;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestidKodVastus;
import ee.htm.portal.services.types.eu.x_road.eis.v4.TestsessioonidKodVastus;
import java.io.IOException;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.List;
import org.apache.log4j.Logger;
import org.apache.xmlbeans.XmlBase64Binary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EisWorker extends Worker {

  private static final Logger LOGGER = Logger.getLogger(EisWorker.class);

  @Autowired
  private EisXRoadService eisXRoadService;

  public ObjectNode getTestsessioonidKod(String personalCode, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EIS - testsessioonid_kod.v1");

    responseNode.put("request_timestamp", timestamp).put("response_timestamp", "")
        .put("key", "testsessioonidKod");

    try {
      TestsessioonidKodVastus response = eisXRoadService.testsessioonidKod("EE" + personalCode);

      responseNode.putObject("value")
          .put("teade", "".equals(response.getTeade()) ? null : response.getTeade())
          .putArray("testsessioonid_kod_jada");

      if (response.getTestsessioonidKodJada() != null
          && !response.getTestsessioonidKodJada().getItemList().isEmpty()) {
        response.getTestsessioonidKodJada().getItemList().forEach(item ->
            ((ArrayNode) responseNode.get("value").get("testsessioonid_kod_jada")).addObject()
                .put("nimi", "".equals(item.getNimi()) ? null : item.getNimi())
                .put("oppeaasta", "".equals(item.getOppeaasta()) ? null : item.getOppeaasta())
                .put("testsessioon_id", item.getTestsessioonId().intValue())
        );
      }

    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash().put(personalCode, "testsessioonidKod", "Tehniline viga!");

      responseNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
      responseNode.remove("value");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "testsessioonidKod", responseNode);

    return responseNode;
  }

  public ObjectNode getTestidKod(String personalCode, BigInteger testSessionId, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EIS - testid_kod.v1");

    responseNode.put("request_timestamp", timestamp).put("response_timestamp", "")
        .put("key", "testidKod_" + testSessionId);

    try {
      TestidKodVastus response = eisXRoadService.testidKod(testSessionId, "EE" + personalCode);

      responseNode.putObject("value")
          .put("teade", "".equals(response.getTeade()) ? null : response.getTeade())
          .put("tunnistus_id", response.isSetTunnistusId() ? response.getTunnistusId() : null)
          .putArray("testid_kod_jada");

      if (response.getTestidKodJada() != null
          && !response.getTestidKodJada().getItemList().isEmpty()) {
        ObjectNode testNode = nodeFactory.objectNode();
        boolean isNextTest = false;
        for (TestidKodJadaItem item : response.getTestidKodJada().getItemList()) {
          if (item.isSetTestNimi()) {
            if (isNextTest) {
              ((ArrayNode) responseNode.get("value").get("testid_kod_jada")).add(testNode);
              testNode = nodeFactory.objectNode();
            }
            testNode.put("test_nimi", item.getTestNimi())
                .put("staatus", "".equals(item.getStaatus()) ? null : item.getStaatus())
                .put("tulemus", "".equals(item.getTulemus()) ? null : item.getTulemus())
                .putArray("osad");
            isNextTest = true;
          } else {
            ((ArrayNode) testNode.get("osad")).addObject()
                .put("osa_nimi", item.isSetOsaNimi() ? item.getOsaNimi() : null)
                .put("osa_kuupaev", item.isSetOsaKuupaev() ?
                    simpleDateFormat.format(item.getOsaKuupaev().getTime())
                    : null)
                .put("osa_koht", item.isSetOsaKoht() ? item.getOsaKoht() : null)
                .put("osa_aadress", item.isSetOsaAadress() ? item.getOsaAadress() : null)
                .put("staatus", "".equals(item.getStaatus()) ? null : item.getStaatus())
                .put("tulemus", "".equals(item.getTulemus()) ? null : item.getTulemus());
          }
        }
        ((ArrayNode) responseNode.get("value").get("testid_kod_jada")).add(testNode);
      }

    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash().put(personalCode, "testidKod_" + testSessionId, "Tehniline viga!");

      responseNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
      responseNode.remove("value");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "testidKod_" + testSessionId, responseNode);

    return responseNode;
  }

  public ObjectNode getETunnistusKod(String personalCode, BigInteger tunnistusId, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EIS - e_tunnistus_kod.v1");

    responseNode.put("request_timestamp", timestamp).put("response_timestamp", "")
        .put("key", "eTunnistusKod_" + tunnistusId);

    try {
      XRoadMessage<ETunnistusKodResponse> responseXRoadMessage = eisXRoadService
          .eTunnistusKod(tunnistusId, "EE" + personalCode);

      ETunnistusKodVastus response = responseXRoadMessage.getContent().getResponse();
      responseNode.putObject("value")
          .put("teade", "".equals(response.getTeade()) ? null : response.getTeade())
          .put("tunnistusenr", response.getTunnistusenr())
          .put("valjastamisaeg", response.getValjastamisaeg() != null ?
              simpleDateFormat.format(response.getValjastamisaeg().getTime()) : null)
          .put("kehtiv", response.getKehtiv() != null ?
              response.getKehtiv().toString() : null);

      getAttachment(responseNode, response.xgetTunnistus(), responseXRoadMessage.getAttachments());

    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash()
          .put(personalCode, "eTunnistusKod_" + tunnistusId, "Tehniline viga!");

      responseNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
      responseNode.remove("value");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "eTunnistusKod_" + tunnistusId, responseNode);

    return responseNode;
  }

  public ObjectNode getETunnistusKehtivus(String personalCode, String tunnistusNr, Long timestamp) {
    ObjectNode responseNode = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EIS - e_tunnistus_kehtivus.v1");

    responseNode.put("request_timestamp", timestamp).put("response_timestamp", "")
        .put("key", "eTunnistusKehtivus_" + tunnistusNr);

    try {
      XRoadMessage<ETunnistusKehtivusResponse> responseXRoadMessage = eisXRoadService
          .eTunnistusKehtivus(personalCode, tunnistusNr, "EE" + personalCode);

      ETunnistusKehtivusVastus response = responseXRoadMessage.getContent().getResponse();
      responseNode.putObject("value")
          .put("teade", "".equals(response.getTeade()) ? null : response.getTeade())
          .put("nimi", response.getNimi())
          .put("tunnistus_nr", response.getTunnistusNr())
          .put("kehtiv", response.getKehtiv() != null ? response.getKehtiv().toString() : null)
          .putArray("eksam_jada");

      if (response.getEksamJada() != null && !response.getEksamJada().getItemList().isEmpty()) {
        response.getEksamJada().getItemList()
            .forEach(item -> ((ArrayNode) responseNode.get("value").get("eksam_jada")).addObject()
                .put("nimetus", item.getNimetus())
                .put("aeg", item.getAeg())
                .put("staatus", item.getStaatus())
                .put("tulemus", item.getTulemus())
                .put("id", item.getId())
                .put("on_osatulemus", item.getOnOsatulemus()));
      }

      getAttachment(responseNode, response.xgetTunnistus(), responseXRoadMessage.getAttachments());

    } catch (Exception e) {
      LOGGER.error(e, e);

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      redisTemplate.opsForHash()
          .put(personalCode, "eTunnistusKehtivus_" + tunnistusNr, "Tehniline viga!");

      responseNode.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
      responseNode.remove("value");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));

    responseNode.put("response_timestamp", System.currentTimeMillis());

    redisTemplate.opsForHash().put(personalCode, "eTunnistusKehtivus_" + tunnistusNr, responseNode);

    return responseNode;
  }

  private void getAttachment(ObjectNode responseNode, XmlBase64Binary xmlBase64Binary,
      List<XRoadAttachment> attachments) throws IOException {
    if (xmlBase64Binary != null) {
      String cid = xmlBase64Binary.getDomNode().getAttributes().getNamedItem("href")
          .getNodeValue();
      cid = cid.startsWith("cid:") ? "<" + cid.substring(4) + ">" : "<" + cid + ">";
      for (XRoadAttachment item : attachments) {
        if (item.getCid().equals(cid)) {
          ((ObjectNode) responseNode.get("value")).putObject("tunnistus")
              .put("filename", item.getDataHandler().getName())
              .put("value", new String(Base64.getEncoder().encode(item.getData())));
        }
      }
    } else {
      ((ObjectNode) responseNode.get("value")).putNull("tunnistus");
    }
  }
}
