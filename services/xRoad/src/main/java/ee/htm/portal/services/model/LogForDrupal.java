package ee.htm.portal.services.model;

import java.sql.Timestamp;

public class LogForDrupal {

  private String type;
  private String severity;
  private Timestamp startTime;
  private Timestamp endTime;
  private String message;
  private String user;
  private String requestId;
  private String responseId;

  public LogForDrupal() {
  }

  public LogForDrupal(String type, String severity, Timestamp startTime, Timestamp endTime,
      String message, String user, String requestId, String responseId) {
    this.type = type;
    this.severity = severity;
    this.startTime = startTime;
    this.endTime = endTime;
    this.message = message;
    this.user = user;
    this.requestId = requestId;
    this.responseId = responseId;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getSeverity() {
    return severity;
  }

  public void setSeverity(String severity) {
    this.severity = severity;
  }

  public Timestamp getStartTime() {
    return startTime;
  }

  public void setStartTime(Timestamp startTime) {
    this.startTime = startTime;
  }

  public Timestamp getEndTime() {
    return endTime;
  }

  public void setEndTime(Timestamp endTime) {
    this.endTime = endTime;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public String getRequestId() {
    return requestId;
  }

  public void setRequestId(String requestId) {
    this.requestId = requestId;
  }

  public String getResponseId() {
    return responseId;
  }

  public void setResponseId(String responseId) {
    this.responseId = responseId;
  }

  @Override
  public String toString() {
    return "LogForDrupal{" +
        "type='" + type + '\'' +
        ", severity='" + severity + '\'' +
        ", startTime=" + startTime +
        ", endTime=" + endTime +
        ", message='" + message + '\'' +
        ", user='" + user + '\'' +
        ", requestId='" + requestId + '\'' +
        ", responseId='" + responseId + '\'' +
        '}';
  }
}
