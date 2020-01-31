package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.model.LogForDrupal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;

public class Worker {

  @Autowired
  protected RedisTemplate<String, Object> redisTemplate;

  @Value("${redis-expire:30}")
  protected Long redisExpire;

  @Value("${redis-file_expire:30}")
  protected Long redisFileExpire;

  @Value("${redis-klf_expire:1440}")
  protected Long redisKlfExpire;

  protected JsonNodeFactory nodeFactory = JsonNodeFactory.instance;

  private Locale locale = new Locale("et", "EE");

  protected SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd.MM.yyyy", locale);

  protected SimpleDateFormat simpleDateTimeFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss", locale);

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

  protected void setError(Logger logger, ObjectNode jsonNode, Exception e) {
    logger.error(e, e);

    logForDrupal.setSeverity("ERROR");
    logForDrupal.setMessage(e.getMessage());

    jsonNode.putObject("error").put("message_type", "ERROR").putObject("message_text")
        .put("et", "Tehniline viga!");
    jsonNode.remove("value");
  }

  protected String ehisDateFormat(Calendar cal) {
    cal.set(Calendar.HOUR, 12);
    return simpleDateFormat.format(cal.getTime());
  }

  protected String ehisDateTimeFormat(Calendar cal) {
    return simpleDateTimeFormat.format(cal.getTime());
  }
}
