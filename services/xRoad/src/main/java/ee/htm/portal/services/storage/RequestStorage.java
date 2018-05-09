package ee.htm.portal.services.storage;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class RequestStorage {

  private static RequestStorage instance;
  private List<Object> requests = new ArrayList<>();
  private int requestQueueNr = 0;

  private RequestStorage() {
  }

  public static RequestStorage getInstance() {
    if (instance == null) {
      synchronized (RequestStorage.class) {
        if (instance == null) {
          instance = new RequestStorage();
        }
      }
    }
    return instance;
  }

  public void add(Object object) {
    requests.add(object);
  }

  public void remove(Object object) {
    if (requests.isEmpty()) {
      return;
    }

    requests.remove(object);
    requestQueueNr--;
  }

  public Object getObject() {
    Object result = requests.get(requestQueueNr);
    requestQueueNr++;

    return result;
  }
}
