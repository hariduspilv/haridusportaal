package ee.htm.portal.services.kafka.consumers;

import org.apache.log4j.Logger;
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

  private static final Logger LOGGER = Logger.getLogger(RequestConsumer.class);

//  @Autowired
//  private PoCWorker worker;

  private int messageCount = 0;

  @KafkaListener(id = "requestConsumer", topics = "${kafka.topic.request}")
  public void receive(@Payload String value,
      @Header(value = KafkaHeaders.RECEIVED_MESSAGE_KEY, required = false) String key,
      @Header(value = "xRoadService", required = false) byte[] service) {
    LOGGER.info("-----------------------------------");
    LOGGER.info(String.format("receved payload='key: {}, value: {}, xRoadService: {}'", key, value,
        service != null ? new String(service) : null));
//    worker.messageWorkerKafka(key, value, service != null ? new String(service) : null);
    messageCount++;
  }

  public int getMessageCount() {
    return messageCount;
  }
}
