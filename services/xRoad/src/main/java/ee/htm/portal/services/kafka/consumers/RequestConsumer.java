package ee.htm.portal.services.kafka.consumers;

import java.util.concurrent.CountDownLatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Created by vallsind on 4.04.2018.
 */
@Component
public class RequestConsumer {

  private static final Logger LOGGER = LoggerFactory.getLogger(RequestConsumer.class);

  private CountDownLatch latch = new CountDownLatch(1);

  @KafkaListener(id = "requestConsumer", topics = "${kafka.topic.request}")
  public void receive(@Payload String value, @Header(KafkaHeaders.RECEIVED_MESSAGE_KEY) String key,
      @Header(value = "xRoadService", required = false) byte[] service) {
    LOGGER.info("-----------------------------------");
    LOGGER.info("receved payload='key: {}, value: {}, xRoadService: {}'", key, value,
        service != null ? new String(service) : null);

    latch.countDown();
  }

  public CountDownLatch getLatch() {
    return latch;
  }
}
