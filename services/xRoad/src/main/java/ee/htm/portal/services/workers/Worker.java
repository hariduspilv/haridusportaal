package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import ee.htm.portal.services.kafka.producers.Sender;
import ee.htm.portal.services.model.LogForDrupal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;

public class Worker {

  @Autowired
  protected Sender sender;

  @Autowired
  protected RedisTemplate<String, Object> redisTemplate;

  @Value("${kafka.topic.logs}")
  protected String logsTopic;

  protected JsonNodeFactory nodeFactory = JsonNodeFactory.instance;

  protected SimpleDateFormat simpleDateFormat = new SimpleDateFormat("YYYY-MM-dd");

  protected LogForDrupal logForDrupal = new LogForDrupal(null, "notice",
      new Timestamp(System.currentTimeMillis()), null,
      null, null, null, null);
}
