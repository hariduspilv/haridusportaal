package ee.htm.portal.services.rest;

import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.client.EhisV6XRoadService;
import ee.htm.portal.services.kafka.producers.Sender;
import ee.htm.portal.services.model.Error;
import ee.htm.portal.services.model.Logs;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudResponseDocument.VpTaotlusOpingudResponse;
import java.sql.Timestamp;
import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class VpTaotlusRestController {

  private static final Logger LOGGER = Logger.getLogger(VpTaotlusRestController.class);

  @Resource
  EhisV6XRoadService ehisV6XRoadService;

  @Autowired
  Sender sender;

  @Value("${kafka.topic.logs}")
  private String logsTopic;

  @RequestMapping(value = "/vpTaotlusOpingud/{personalCode}/{taotlusId}/{userId}", method = RequestMethod.GET)
  public ResponseEntity<?> getVpTaotlusOpingud(@PathVariable("personalCode") String personalCode,
      @PathVariable("taotlusId") String taotlusId, @PathVariable("userId") String userId) {
    VpTaotlusOpingudResponse response;
    Logs logs = new Logs("vpTaotlusOpingud", "notice", new Timestamp(System.currentTimeMillis()),
        null, "vpTaotlusOpingud teenuselt andmete pärimine õnnestus.", userId, "requestId", null);

    if (taotlusId.equalsIgnoreCase("-")) {
      taotlusId = null;
    }

    try {
      response = ehisV6XRoadService.vptOpingud(personalCode, taotlusId, userId);
    } catch (XRoadServiceConsumptionException e) {
      LOGGER.error(e, e);

      logs.setSeverity("error");
      logs.setMessage(e.getFaultString());
      logs.setResponseId("responseId");
      logs.setEndTime(new Timestamp(System.currentTimeMillis()));
      sender.send(logsTopic, null, logs, "vpTaotlusOpingud");

      return new ResponseEntity<Error>(new Error(0, "Tehniline viga."), HttpStatus.OK);
    }

    logs.setEndTime(new Timestamp(System.currentTimeMillis()));
    logs.setResponseId("responseId");
    sender.send(logsTopic, null, logs, "vpTaotlusOpingud");

    return new ResponseEntity<VpTaotlusOpingudResponse>(response, HttpStatus.OK);
  }

}
