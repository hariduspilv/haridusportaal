package ee.htm.portal.services.storage;

import ee.htm.portal.services.model.Response;
import ee.htm.portal.services.model.ResponseImpl;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ResponseStorage {

  private static ResponseStorage instance;
  private static Map<String, Object> responses = new HashMap<>();

  private ResponseStorage() {

  }

  public static ResponseStorage getInstance() {
    if (instance == null) {
      synchronized (ResponseStorage.class) {
        if (instance == null) {
          instance = new ResponseStorage();
        }
      }
    }
    return instance;
  }

  public void put(String key, Object value) {
    if (responses.containsKey(key)) {
      responses.replace(key, value);
    } else {
      responses.put(key, value);
    }
  }

  public void remove(String key) {
    responses.remove(key);
  }

  public Object get(String key) {
    if (responses.isEmpty() || !responses.containsKey(key)) {
      return new ResponseImpl(key, "NOT FOUND!");
    }

    Object result = responses.get(key);
    if (isDone(key)) {
      remove(key);
    }

    return result;
  }

  public void setStatusToOK(String key) {
    ((Response) responses.get(key)).setStatus("OK");
  }

  private boolean isDone(String key) {
    return ((Response) responses.get(key)).getStatus().equalsIgnoreCase("OK");
  }
}
