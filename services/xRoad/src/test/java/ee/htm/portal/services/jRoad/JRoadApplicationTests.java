package ee.htm.portal.services.jRoad;

import static org.assertj.core.api.Assertions.assertThat;

import ee.htm.portal.services.kafka.consumers.RequestConsumer;
import ee.htm.portal.services.kafka.producers.Sender;
import ee.htm.portal.services.model.Logs;
import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.kafka.test.rule.KafkaEmbedded;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class JRoadApplicationTests {

  private static String TEST_TOPIC = "test_topic";

  @Autowired
  private Sender sender;

  @Autowired
  private RequestConsumer requestConsumer;

  @Autowired
  private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

  @ClassRule
  public static KafkaEmbedded embeddedKafka = new KafkaEmbedded(1, true, TEST_TOPIC);

  @Before
  public void setUp() throws Exception {
    // wait until the partitions are assigned
    for (MessageListenerContainer messageListenerContainer : kafkaListenerEndpointRegistry
        .getListenerContainers()) {
      ContainerTestUtils.waitForAssignment(messageListenerContainer,
          embeddedKafka.getPartitionsPerTopic());
    }
  }

  @Test
  public void testRequestConsumer() throws Exception {
    Logs log = new Logs("type", "severity", new Timestamp(System.currentTimeMillis()),
        new Timestamp(System.currentTimeMillis()), "message", "user", "requestId", "responseId");
    sender.send(TEST_TOPIC, String.valueOf(System.currentTimeMillis()), log);

    requestConsumer.getLatch().await(10000, TimeUnit.MILLISECONDS);
    assertThat(requestConsumer.getLatch().getCount()).isEqualTo(0);
  }
}
