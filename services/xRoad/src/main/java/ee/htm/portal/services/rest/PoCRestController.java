package ee.htm.portal.services.rest;

import ee.htm.portal.services.PoCWorker;
import ee.htm.portal.services.model.EeIsikukaartRequest;
import ee.htm.portal.services.model.ResponseImpl;
import ee.htm.portal.services.storage.RequestStorage;
import ee.htm.portal.services.storage.ResponseStorage;
import java.util.UUID;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PoCRestController {

  private static final Logger LOGGER = Logger.getLogger(PoCRestController.class);

  @Autowired
  PoCWorker poCWorker;

  @Autowired
  ResponseStorage responseStorage;

  @Autowired
  RequestStorage requestStorage;

  @RequestMapping(value = "/eeIsikukaart/{personalCode}", method = RequestMethod.GET)
  public ResponseEntity<?> getIsikukaart(@PathVariable("personalCode") String personalCode) {
    String uuidString = UUID.randomUUID().toString();
    ResponseImpl response = new ResponseImpl(uuidString, "PENDING");

    requestStorage.add(new EeIsikukaartRequest(personalCode, uuidString));
    responseStorage.put(uuidString, response);
    new Thread(() -> poCWorker.messageWorkerREST()).start();

    return new ResponseEntity<ResponseImpl>(response, HttpStatus.OK);
  }

  @RequestMapping(value = "/response/{uuid}", method = RequestMethod.GET)
  public ResponseEntity<?> getResponses(@PathVariable("uuid") String uuidString) {
    return new ResponseEntity<Object>(responseStorage.get(uuidString), HttpStatus.OK);
  }
}
