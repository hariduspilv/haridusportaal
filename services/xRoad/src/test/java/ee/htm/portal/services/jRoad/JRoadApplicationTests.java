package ee.htm.portal.services.jRoad;

import static org.assertj.core.api.Assertions.assertThat;

import ee.htm.portal.services.kafka.consumers.RequestConsumer;
import ee.htm.portal.services.kafka.producers.Sender;
import java.util.concurrent.TimeUnit;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.rule.KafkaEmbedded;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class JRoadApplicationTests {

  private static String TEST_TOPIC = "test_topic";

  @Autowired
  private Sender sender;

  @Autowired
  private RequestConsumer requestConsumer;

  @ClassRule
  public static KafkaEmbedded embeddedKafka = new KafkaEmbedded(1, true, TEST_TOPIC);

  @Test
  public void testRequestConsumer() throws Exception {
    sender.send(TEST_TOPIC, "Hello test_topic! Hello World!");

    requestConsumer.getLatch().await(10000, TimeUnit.MILLISECONDS);
    assertThat(requestConsumer.getLatch().getCount()).isEqualTo(0);
  }
}
