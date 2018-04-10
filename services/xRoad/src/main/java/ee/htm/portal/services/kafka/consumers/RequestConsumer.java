package ee.htm.portal.services.kafka.consumers;

import java.util.concurrent.CountDownLatch;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Created by vallsind on 4.04.2018.
 */
@Component
public class RequestConsumer {

  private static final Logger LOGGER = LoggerFactory.getLogger(RequestConsumer.class);

  private CountDownLatch latch = new CountDownLatch(1);

  @KafkaListener(id = "requestConsumer", topics = "${kafka.topic.request}")
  public void receive(ConsumerRecord<?, ?> consumerRecord) {
    LOGGER.info("receved payload='{}'", consumerRecord.toString());
    latch.countDown();
  }

  public CountDownLatch getLatch() {
    return latch;
  }
}
