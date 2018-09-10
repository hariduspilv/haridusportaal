package ee.htm.portal.services.rest;

import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.workers.EeIsikukaartWorker;
import ee.htm.portal.services.workers.KutseregisterWorker;
import ee.htm.portal.services.workers.VPTWorker;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HPortalRestController {

  private static final Logger LOGGER = Logger.getLogger(HPortalRestController.class);

  @Autowired
  VPTWorker vptWorker;

  @Autowired
  KutseregisterWorker kutseregisterWorker;

  @Autowired
  EeIsikukaartWorker eeIsikukaartWorker;

  @RequestMapping(value = "/postDocument", method = RequestMethod.POST,
      produces = "application/json;charset=UTF-8", consumes = "application/json;charset=UTF-8")
  public ResponseEntity<?> postDocument(@RequestBody ObjectNode requestJson) {
    if (requestJson.get("header").get("form_name").asText().equalsIgnoreCase("VPT_TAOTLUS")) {
      return new ResponseEntity<>(vptWorker.work(requestJson), HttpStatus.OK);
    }

    LOGGER.error("Tundmatu request JSON - " + requestJson);
    return new ResponseEntity<>("{\"ERROR\":\"Tehniline viga!\"}", HttpStatus.NOT_FOUND);
  }

  @RequestMapping(value = "/getDocumentFile/{documentId}/{personalCode}", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getDockumentFile(@PathVariable("documentId") String documentId,
      @PathVariable("personalCode") String personalCode) {
    if (documentId.startsWith("VPT_")) {
      return new ResponseEntity<>(vptWorker.getDocument(documentId, personalCode), HttpStatus.OK);
    }

    LOGGER.error("Tundmatu request documentId - " + documentId);
    return new ResponseEntity<>("{\"ERROR\":\"Tehniline viga!\"}", HttpStatus.NOT_FOUND);
  }

  @RequestMapping(value = "/kodanikKutsetunnistus/{personalCode}/{invalidBoolean}/{requestTimestamp}", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getKodanikKutsetunnistus(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("invalidBoolean") boolean invalidBoolean,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(kutseregisterWorker.work(personalCode, invalidBoolean, timestamp),
        HttpStatus.OK);
  }

  @RequestMapping(value = "/eeIsikukaart/{personalCode}/{requestTimestamp}", method = RequestMethod.GET, produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getEeIsikukaart(@PathVariable("personalCode") String personalcode,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(eeIsikukaartWorker.work(personalcode, timestamp), HttpStatus.OK);
  }
}
