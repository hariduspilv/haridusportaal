package ee.htm.portal.services.jRoad;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

import ee.htm.portal.services.kafka.consumers.RequestConsumer;
import ee.htm.portal.services.kafka.producers.Sender;
import ee.htm.portal.services.model.EeIsikukaartRequest;
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
  private static String TEST_TOPIC1 = "test_topic1";
  private static String TEST_TOPIC2 = "test_topic2";

  @Autowired
  private Sender sender;

  @Autowired
  private RequestConsumer requestConsumer;

  @Autowired
  private KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

  @ClassRule
  public static KafkaEmbedded embeddedKafka = new KafkaEmbedded(1, true, TEST_TOPIC, TEST_TOPIC1,
      TEST_TOPIC2);

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
    EeIsikukaartRequest request = new EeIsikukaartRequest("38304110000");
    sender.send(TEST_TOPIC, String.valueOf(System.currentTimeMillis()), request, "eeIsikukaart");

    await().atMost(10, TimeUnit.SECONDS).until(() -> requestConsumer.getMessageCount() == 1);
    assertThat(requestConsumer.getMessageCount()).isGreaterThan(0);
  }
}
