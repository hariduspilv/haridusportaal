package ee.htm.portal.services.model;

public class EeIsikukaartRequest {

  private String personalIdCode;
  private String format;
  private String uuidString;

  public EeIsikukaartRequest(String personalIdCode) {
    this.personalIdCode = personalIdCode;
    this.format = "xml";
  }

  public EeIsikukaartRequest(String personalIdCode, String uuidString) {
    this.personalIdCode = personalIdCode;
    this.format = "xml";
    this.uuidString = uuidString;
  }

  public EeIsikukaartRequest(String personalIdCode, String format, String uuidString) {
    this.personalIdCode = personalIdCode;
    this.format = format;
    this.uuidString = uuidString;
  }

  public String getPersonalIdCode() {
    return personalIdCode;
  }

  public void setPersonalIdCode(String personalIdCode) {
    this.personalIdCode = personalIdCode;
  }

  public String getFormat() {
    if (format == null) {
      this.format = "xml";
    }
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public String getUuidString() {
    return uuidString;
  }

  public void setUuidString(String uuidString) {
    this.uuidString = uuidString;
  }
}
