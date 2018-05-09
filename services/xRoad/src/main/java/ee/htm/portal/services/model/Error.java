package ee.htm.portal.services.model;

public class Error {

  private int errorCode;
  private String errorMessage;

  public Error(int errorCode, String errorMessage) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

  public int getErrorCode() {
    return errorCode;
  }

  public void setErrorCode(int errorCode) {
    this.errorCode = errorCode;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  @Override
  public String toString() {
    return "Error{" +
        "errorCode='" + errorCode + '\'' +
        ", errorMessage='" + errorMessage + '\'' +
        '}';
  }
}
