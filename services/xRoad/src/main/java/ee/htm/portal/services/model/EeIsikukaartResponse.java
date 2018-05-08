package ee.htm.portal.services.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class EeIsikukaartResponse extends ResponseImpl implements Response {

  private String personalIdCode;
  private Date dateOfBirth;
  private List<Error> error;

  public EeIsikukaartResponse(String uuidString, String personalIdCode) {
    super(uuidString, "PENDING");
    this.personalIdCode = personalIdCode;
  }

  public String getPersonalIdCode() {
    return personalIdCode;
  }

  public void setPersonalIdCode(String personalIdCode) {
    this.personalIdCode = personalIdCode;
  }

  public Date getDateOfBirth() {
    return dateOfBirth;
  }

  public void setDateOfBirth(Date dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  public List<Error> getError() {
    if (error == null) {
      error = new ArrayList<>();
    }
    return error;
  }

  @Override
  public String toString() {
    return "EeIsikukaartResponse{" +
        "personalIdCode='" + personalIdCode + '\'' +
        ", dateOfBirth=" + dateOfBirth +
        ", error=" + error +
        ", uuidString=" + getUuidString() +
        ", status=" + getStatus() +
        '}';
  }
}
