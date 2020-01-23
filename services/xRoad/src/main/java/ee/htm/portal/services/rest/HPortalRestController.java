package ee.htm.portal.services.rest;

import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.workers.AriregWorker;
import ee.htm.portal.services.workers.EeIsikukaartWorker;
import ee.htm.portal.services.workers.EisWorker;
import ee.htm.portal.services.workers.KutseregisterWorker;
import ee.htm.portal.services.workers.MtsysWorker;
import ee.htm.portal.services.workers.VPTWorker;
import java.math.BigInteger;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
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

  @Autowired
  MtsysWorker mtsysWorker;

  @Autowired
  EisWorker eisWorker;

  @Autowired
  AriregWorker ariregWorker;

  @RequestMapping(value = "/getDocuments/{identifier}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getDocuments(@PathVariable("identifier") String identifier) {
    if (identifier.length() == 8) {
      new Thread(() -> mtsysWorker.getMtsystegevusLoad(identifier)).start();
    } else {
      new Thread(() -> vptWorker.getDocuments(identifier)).start();
    }

    return new ResponseEntity<>("{\"MESSAGE\":\"WORKING\"}", HttpStatus.OK);
  }

  @RequestMapping(value = {"/getDocument/{formName}/{personalCode}"},
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getDocument(
      @PathVariable("formName") String formName,
      @PathVariable("personalCode") String personalCode,
      @RequestParam(value = "identifier", required = false) String identifier,
      @RequestParam(value = "year", required = false) Long year,
      @RequestParam(value = "educationalInstitutionsId", required = false) Long educationalInstitutionsId) {
    if (formName.startsWith("VPT_ESITATUD")) {
      return new ResponseEntity<>(vptWorker.getDocument(formName, identifier), HttpStatus.OK);
    } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA")) {
      return new ResponseEntity<>(
          mtsysWorker.getMtsysTegevusluba(formName, Long.valueOf(identifier), personalCode),
          HttpStatus.OK);
    } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSNAITAJAD")) {
      return new ResponseEntity<>(
          mtsysWorker
              .getMtsysTegevusNaitaja(formName, Long.valueOf(identifier), personalCode),
          HttpStatus.OK);
    } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_TAOTLUS")) {
      return new ResponseEntity<>(
          mtsysWorker
              .getMtsysTegevuslubaTaotlus(formName, Long.valueOf(identifier), personalCode),
          HttpStatus.OK);
    } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSNAITAJAD_ARUANNE")) {
      return new ResponseEntity<>(mtsysWorker
          .getMtsysTegevusNaitajaTaotlus(formName,
              NumberUtils.isDigits(identifier) ? Long.valueOf(identifier) : null,
              year, educationalInstitutionsId, personalCode), HttpStatus.OK);
    } else if (formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_LOPETAMINE_TAOTLUS")
        || formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_MUUTMINE_TAOTLUS")
        || formName.equalsIgnoreCase("MTSYS_TEGEVUSLUBA_SULGEMINE_TAOTLUS")) {
      return new ResponseEntity<>(mtsysWorker
          .getMtsysEsitaTegevusluba(formName, Long.valueOf(identifier), personalCode),
          HttpStatus.OK);
    }

    LOGGER.error("Tundmatu request formName - " + formName);
    return new ResponseEntity<>("{\"ERROR\":\"Tehniline viga!\"}", HttpStatus.NOT_FOUND);
  }

  @RequestMapping(value = "/postDocument",
      method = RequestMethod.POST,
      produces = "application/json;charset=UTF-8",
      consumes = "application/json;charset=UTF-8")
  public ResponseEntity<?> postDocument(@RequestBody ObjectNode requestJson) {
    if (requestJson.get("header").get("form_name").asText().equalsIgnoreCase("VPT_TAOTLUS")) {
      return new ResponseEntity<>(vptWorker.postDocument(requestJson), HttpStatus.OK);
    } else if (requestJson.get("header").get("form_name").asText()
        .equalsIgnoreCase("MTSYS_TEGEVUSLUBA_TAOTLUS")) {
      return new ResponseEntity<>(mtsysWorker.postMtsysTegevusluba(requestJson), HttpStatus.OK);
    } else if (requestJson.get("header").get("form_name").asText()
        .equalsIgnoreCase("MTSYS_TEGEVUSNAITAJAD_ARUANNE")) {
      return new ResponseEntity<>(mtsysWorker.postMtysTegevusNaitaja(requestJson), HttpStatus.OK);
    } else if (requestJson.get("header").get("form_name").asText()
        .equalsIgnoreCase("MTSYS_TEGEVUSLUBA_LOPETAMINE_TAOTLUS")
        || requestJson.get("header").get("form_name").asText()
        .equalsIgnoreCase("MTSYS_TEGEVUSLUBA_MUUTMINE_TAOTLUS")
        || requestJson.get("header").get("form_name").asText()
        .equalsIgnoreCase("MTSYS_TEGEVUSLUBA_SULGEMINE_TAOTLUS")) {
      return new ResponseEntity<>(mtsysWorker.postMtsysEsitaTegevusluba(requestJson),
          HttpStatus.OK);
    }

    LOGGER.error("Tundmatu request JSON - " + requestJson);
    return new ResponseEntity<>("{\"ERROR\":\"Tehniline viga!\"}", HttpStatus.NOT_FOUND);
  }

  @RequestMapping(value = "/getDocumentFile/{documentId}/{personalCode}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getDockumentFile(
      @PathVariable("documentId") String documentId,
      @PathVariable("personalCode") String personalCode,
      @RequestParam(value = "identifier", required = false) String identifier) {
    if (documentId.startsWith("VPT_")) {
      return new ResponseEntity<>(vptWorker.getDocumentFile(documentId, personalCode),
          HttpStatus.OK);
    } else if (documentId.startsWith("mtsysFile_")) {
      return new ResponseEntity<>(mtsysWorker.getDocumentFile(documentId, Long.valueOf(identifier),
          personalCode), HttpStatus.OK);
    }

    LOGGER.error("Tundmatu request documentId - " + documentId);
    return new ResponseEntity<>("{\"ERROR\":\"Tehniline viga!\"}", HttpStatus.NOT_FOUND);
  }

  @RequestMapping(value = "/kodanikKutsetunnistus/{personalCode}/{invalidBoolean}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getKodanikKutsetunnistus(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("invalidBoolean") boolean invalidBoolean,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        kutseregisterWorker.getKodanikKutsetunnistus(personalCode, invalidBoolean, timestamp),
        HttpStatus.OK);
  }

  @RequestMapping(value = "/eeIsikukaart/{personalCode}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getEeIsikukaart(
      @PathVariable("personalCode") String personalcode,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        eeIsikukaartWorker.getEeIsikukaart(personalcode, timestamp), HttpStatus.OK);
  }

  @RequestMapping(value = "/GDPRLog/{personalCode}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getGDPRLog(@PathVariable("personalCode") String personalcode) {
    return new ResponseEntity<>(eeIsikukaartWorker.getGDPRLog(personalcode), HttpStatus.OK);
  }

  @RequestMapping(value = "/mtsysKlfTeenus",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getMtsysKlfTeenus() {
    return new ResponseEntity<>(mtsysWorker.getMtsysKlf(), HttpStatus.OK);
  }

  @RequestMapping(value = "/testsessioonidKod/{personalCode}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getTestsessioonidKod(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        eisWorker.getTestsessioonidKod(personalCode, timestamp), HttpStatus.OK);
  }

  @RequestMapping(value = "/testidKod/{personalCode}/{testSessionId}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getTestidKod(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("testSessionId") BigInteger testSessionId,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        eisWorker.getTestidKod(personalCode, testSessionId, timestamp), HttpStatus.OK);
  }

  @RequestMapping(value = "/eTunnistusKod/{personalCode}/{tunnistusId}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getETunnistusKod(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("tunnistusId") BigInteger tunnistusId,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        eisWorker.getETunnistusKod(personalCode, tunnistusId, timestamp), HttpStatus.OK);
  }

  @RequestMapping(value = "/eTunnistusKehtivus/{personalCode}/{tunnistusNr}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getETunnistusKehtivus(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("tunnistusNr") String tunnistusNr,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        eisWorker.getETunnistusKehtivus(personalCode, tunnistusNr, timestamp), HttpStatus.OK);
  }

  @RequestMapping(value = "/esindusOigus/{personalCode}/{countryCode}/{requestTimestamp}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getEsindusOigus(
      @PathVariable("personalCode") String personalCode,
      @PathVariable("countryCode") String countryCode,
      @PathVariable("requestTimestamp") Long timestamp) {
    return new ResponseEntity<>(
        ariregWorker.getEsindusOigus(personalCode, countryCode, timestamp), HttpStatus.OK);
  }

  @RequestMapping(value = "/getEducationalInstitution/{identifier}/{institutionId}/{personalCode}",
      method = RequestMethod.GET,
      produces = "application/json;charset=UTF-8")
  public ResponseEntity<?> getEducationalInstitution(
      @PathVariable("identifier") Long identifier,
      @PathVariable("institutionId") String institutionId,
      @PathVariable("personalCode") String personalCode) {
    return new ResponseEntity<>(
        mtsysWorker.getMtsysOppeasutus(identifier, institutionId, personalCode), HttpStatus.OK);
  }

  @RequestMapping(value = "/postEducationalInstitution/{personalCode}",
      method = RequestMethod.POST,
      produces = "application/json;charset=UTF-8",
      consumes = "application/json;charset=UTF-8")
  public ResponseEntity<?> postEducationalInstitution(
      @PathVariable("personalCode") String personalCode,
      @RequestBody ObjectNode requestJson) {
    return new ResponseEntity<>(mtsysWorker.postMtsysLaeOppeasutus(requestJson, personalCode),
        HttpStatus.OK);
  }
}
