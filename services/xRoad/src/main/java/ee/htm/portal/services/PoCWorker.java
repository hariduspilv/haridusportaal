package ee.htm.portal.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nortal.jroad.client.exception.XRoadServiceConsumptionException;
import ee.htm.portal.services.client.EhisV6XRoadService;
import ee.htm.portal.services.kafka.producers.Sender;
import ee.htm.portal.services.model.EeIsikukaartRequest;
import ee.htm.portal.services.model.EeIsikukaartResponse;
import ee.htm.portal.services.model.Error;
import ee.htm.portal.services.model.Logs;
import ee.htm.portal.services.storage.RequestStorage;
import ee.htm.portal.services.storage.ResponseStorage;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.EeIsikukaartResponseDocument;
import java.io.IOException;
import java.sql.Timestamp;
import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PoCWorker {

  private static final Logger LOGGER = Logger.getLogger(PoCWorker.class);

  @Autowired
  RequestStorage requestStorage;

  @Autowired
  ResponseStorage responseStorage;

  @Autowired
  Sender sender;

  @Resource
  EhisV6XRoadService ehisV6XRoadService;

  @Value("${kafka.topic.response}")
  private String responseTopic;

  @Value("${kafka.topic.logs}")
  private String logsTopic;

  public void messageWorkerKafka(String key, String value, String xRoadService) {
    if (!value.substring(0, 1).equalsIgnoreCase("{")) {
      value = value.split(";")[5];
      value = value.substring(5, value.length() - 1);
    }

    if (xRoadService == null) {
      xRoadService = "eeIsikukaart";
    }

    ObjectMapper mapper = new ObjectMapper();
    EeIsikukaartRequest request = null;
    try {
      request = mapper.readValue(value, EeIsikukaartRequest.class);
    } catch (IOException e) {
      e.printStackTrace();
    }

    sender.send(responseTopic, key, messageWorker(request, xRoadService), xRoadService);
  }

  public void messageWorkerREST() {
    EeIsikukaartRequest request = (EeIsikukaartRequest) requestStorage.getObject();
    responseStorage.put(request.getUuidString(), messageWorker(request, "eeIsikukaart"));
    requestStorage.remove(request);
    return;
  }

  private EeIsikukaartResponse messageWorker(EeIsikukaartRequest request, String xRoadService) {
    Logs logs = new Logs(xRoadService, "notice", new Timestamp(System.currentTimeMillis()), null,
        xRoadService + " teenuselt andmete pärimine õnnestus.", "user", "requestId", null);
    EeIsikukaartResponse response = new EeIsikukaartResponse(request.getUuidString(),
        request.getPersonalIdCode());

    try {
      if (request.getPersonalIdCode().equalsIgnoreCase("12345678901")) {
        Thread.sleep(30000);
        throw new Exception("Insert some exception here!");
      } else {
        EeIsikukaartResponseDocument.EeIsikukaartResponse xRoadResponse = ehisV6XRoadService
            .eeIsikukaart(request.getPersonalIdCode(), "xml", request.getPersonalIdCode());
        response
            .setDateOfBirth(xRoadResponse.getIsikukaart().getIsikuandmed().getSynniKp().getTime());
      }

      logs.setResponseId("responseId");
    } catch (Exception e) {
      if (e instanceof XRoadServiceConsumptionException) {
        String xRoadError = ((XRoadServiceConsumptionException) e).getFaultString();
        logs.setMessage(xRoadError);
        response.getError().add(new Error(1, xRoadError));
      } else {
        LOGGER.error("Tehniline viga! ", e);
        logs.setSeverity("error");
        logs.setMessage(e.getMessage());
        response.getError().add(new Error(0, "Tehniline viga."));
      }
    }

    logs.setEndTime(new Timestamp(System.currentTimeMillis()));
    sender.send(logsTopic, null, logs, xRoadService);

    response.setStatus("OK");
    return response;
  }
}
