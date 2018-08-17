package ee.htm.portal.services.kafka.producers;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Created by vallsind on 4.04.2018.
 */
@Component
public class Sender {

  private static final Logger LOGGER = Logger.getLogger(Sender.class);

  @Autowired
  private KafkaTemplate<String, Object> kafkaTemplate;

  public void send(String topic, String key, Object payload, String xRoadService) {
    LOGGER.info("-----------------------------------");
    LOGGER.info(String.format("sending key='%s', payload='%s', xRoadService='%s' to topic='%s'",
        key, payload.toString(), xRoadService, topic));

//    List<Header> headers = new ArrayList<>();
//    headers.add(new RecordHeader("xRoadService", xRoadService.getBytes()));

//    ProducerRecord<String, Object> record = new ProducerRecord<>(topic, null, key, payload,
//        headers);
    kafkaTemplate.send(topic, key, payload);
  }
}
