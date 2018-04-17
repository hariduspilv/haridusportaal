package ee.htm.portal.services;

import com.google.gson.Gson;
import ee.htm.portal.services.kafka.producers.Sender;
import ee.htm.portal.services.model.EeIsikukaartRequest;
import ee.htm.portal.services.model.EeIsikukaartResponse;
import ee.htm.portal.services.model.Error;
import ee.htm.portal.services.model.Logs;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PoCWorker {

  private static final Logger LOGGER = LoggerFactory.getLogger(PoCWorker.class);

  @Autowired
  Sender sender;

  @Value("${kafka.topic.response}")
  private String responseTopic;

  @Value("${kafka.topic.logs}")
  private String logsTopic;

  public void MessageWorker(String key, String value, String xRoadService) {
    if (!value.substring(0, 1).equalsIgnoreCase("{")) {
      value = value.split(";")[5];
      value = value.substring(5, value.length() - 1);
    }

    if (xRoadService == null) {
      xRoadService = "eeIsikukaart";
    }

    Gson gson = new Gson();
    EeIsikukaartRequest request = gson.fromJson(value, EeIsikukaartRequest.class);

    Logs logs = new Logs(xRoadService, "notice", new Timestamp(System.currentTimeMillis()), null,
        xRoadService + " teenuselt andmete pärimine õnnestus.", "user", "requestId", null);
    EeIsikukaartResponse response = new EeIsikukaartResponse(request.getPersonalIdCode());

    try {
      if (request.getPersonalIdCode().equalsIgnoreCase("38304110000")) {
        response.setDateOfBirth(new SimpleDateFormat("dd.MM.yyyy").parse("11.04.1983"));
      } else if (request.getPersonalIdCode().equalsIgnoreCase("12345678901")) {
        throw new Exception("Insert some exception here!");
      } else {
        response.getError().add(new Error(1, "Sellise isikukoodiga isiku kohta andmed puuduvad."));
      }

      logs.setResponseId("responseId");
    } catch (Exception e) {
      LOGGER.error("Tehniline viga! ", e);

      logs.setSeverity("error");
      logs.setMessage(e.getMessage());

      response.getError().add(new Error(0, "Tehniline viga."));
    }

    logs.setEndTime(new Timestamp(System.currentTimeMillis()));

    sender.send(responseTopic, key, response, xRoadService);
    sender.send(logsTopic, key, logs, xRoadService);
  }
}
