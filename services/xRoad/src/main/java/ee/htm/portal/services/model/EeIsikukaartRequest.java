package ee.htm.portal.services.model;

public class EeIsikukaartRequest {

  private String personalIdCode;

  public EeIsikukaartRequest(String personalIdCode) {
    this.personalIdCode = personalIdCode;
  }

  public String getPersonalIdCode() {
    return personalIdCode;
  }

  public void setPersonalIdCode(String personalIdCode) {
    this.personalIdCode = personalIdCode;
  }
}
