package ee.htm.portal.services.kafka.consumers;

import ee.htm.portal.services.PoCWorker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Created by vallsind on 4.04.2018.
 */
@Service
public class RequestConsumer {

  private static final Logger LOGGER = LoggerFactory.getLogger(RequestConsumer.class);

  @Autowired
  private PoCWorker worker;

  private int messageCount = 0;

  @KafkaListener(id = "requestConsumer", topics = "${kafka.topic.request}")
  public void receive(@Payload String value,
      @Header(value = KafkaHeaders.RECEIVED_MESSAGE_KEY, required = false) String key,
      @Header(value = "xRoadService", required = false) byte[] service) {
    LOGGER.info("-----------------------------------");
    LOGGER.info("receved payload='key: {}, value: {}, xRoadService: {}'", key, value,
        service != null ? new String(service) : null);
    worker.MessageWorker(key, value, service != null ? new String(service) : null);
    messageCount++;
  }

  public int getMessageCount() {
    return messageCount;
  }
}
