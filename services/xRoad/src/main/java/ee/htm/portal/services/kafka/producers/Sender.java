package ee.htm.portal.services.kafka.producers;

import java.util.ArrayList;
import java.util.List;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Created by vallsind on 4.04.2018.
 */
@Component
public class Sender {

  private static final Logger LOGGER = LoggerFactory.getLogger(Sender.class);

  @Autowired
  private KafkaTemplate<String, Object> kafkaTemplate;

  public void send(String topic, String key, Object payload) {
    LOGGER.info("-----------------------------------");
    LOGGER.info("sending key='{}', payload='{}', xRoadService='{}' to topic='{}'", key,
        payload.toString(), payload.getClass().getName(), topic);

    List<Header> headers = new ArrayList<>();
    headers.add(new RecordHeader("xRoadService", payload.getClass().getName().getBytes()));

    ProducerRecord<String, Object> record = new ProducerRecord<>(topic, null, key, payload,
        headers);
    kafkaTemplate.send(record);
  }
}
