package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.model.LogForDrupal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;

public class Worker {

  @Autowired
  protected RedisTemplate<String, Object> redisTemplate;

  protected JsonNodeFactory nodeFactory = JsonNodeFactory.instance;

  protected SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd.MM.yyyy");

  protected LogForDrupal logForDrupal = new LogForDrupal(null, "notice",
      new Timestamp(System.currentTimeMillis()), null,
      null, null, null, null);

  protected void setXdzeisonError(Logger logger, ObjectNode jsonNode, Exception e) {
    logger.error(e, e);

    logForDrupal.setSeverity("ERROR");
    logForDrupal.setMessage(e.getMessage());

    Long timestamp = System.currentTimeMillis();

    ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
    ((ArrayNode) jsonNode.get("body").get("messages")).add("error_" + timestamp);
    ((ObjectNode) jsonNode.get("messages")).putObject("error_" + timestamp)
        .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
  }
}
