package ee.htm.portal.services.model;

public class ResponseImpl implements Response {

  private String uuidString;
  private String status;

  public ResponseImpl(String uuidString, String status) {
    this.uuidString = uuidString;
    this.status = status;
  }

  public String getUuidString() {
    return uuidString;
  }

  public void setUuidString(String uuidString) {
    this.uuidString = uuidString;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
