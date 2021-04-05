package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nortal.jroad.jaxb.ByteArrayDataSource;
import com.nortal.jroad.model.XRoadAttachment;
import com.nortal.jroad.model.XRoadMessage;
import com.nortal.jroad.model.XmlBeansXRoadMessage;
import ee.htm.portal.services.client.Ehis2XRoadService;
import ee.htm.portal.services.types.eu.x_road.ehis2.ApplicantSubject;
import ee.htm.portal.services.types.eu.x_road.ehis2.Application;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileRequestDocument.GetFileRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetFileResponseDocument.GetFileResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.GetGrantsResponseDocument.GetGrantsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.Grant;
import ee.htm.portal.services.types.eu.x_road.ehis2.GrantFile;
import ee.htm.portal.services.types.eu.x_road.ehis2.GrantFileList;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsRequestDocument.PostGrantsRequest;
import ee.htm.portal.services.types.eu.x_road.ehis2.PostGrantsResponseDocument.PostGrantsResponse;
import ee.htm.portal.services.types.eu.x_road.ehis2.ServiceError;
import java.net.URLConnection;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;
import javax.activation.DataHandler;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.util.StringUtils;

public class OLTWorker extends Worker {

  private static final Logger log = LoggerFactory.getLogger(OLTWorker.class);

  private Ehis2XRoadService ehis2XRoadService;

  private RedisTemplate<String, String> redisFileTemplate;

  public OLTWorker(Ehis2XRoadService ehis2XRoadService, RedisTemplate<String, Object> redisTemplate,
      RedisTemplate<String, String> redisFileTemplate, Long redisExpire, Long redisFileExpire,
      Long redisKlfExpire) {
    super(redisTemplate, redisExpire, redisFileExpire, redisKlfExpire);
    this.ehis2XRoadService = ehis2XRoadService;
    this.redisFileTemplate = redisFileTemplate;
  }

  public boolean hasOLTGrantAccess(String personalCode) {
    boolean ret = false;
    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS2 - getGrants.v1:hasAccessControl");
    logForDrupal.setSeverity("notice");

    try {
      GetGrantsResponse xRaodResponse = ehis2XRoadService
          .hasOLTGrantAccess(personalCode, personalCode);
      if (xRaodResponse.getResponseInfo() != null
          && xRaodResponse.getResponseInfo().getHasAccessList() != null
          && xRaodResponse.getResponseInfo().getHasAccessList().getAccessList().contains("OLT")) {
        ret = true;
      }
      logForDrupal
          .setMessage("EHIS2 - getGrants.v1:hasAccessControl teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());
    return ret;
  }

  public void getDocuments(String personalCode) {
    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS2 - getGrants.v1");
    logForDrupal.setSeverity("notice");

    ObjectNode responseNode = nodeFactory.objectNode();
    responseNode.putArray("documents");
    responseNode.putArray("acceptable_forms");
    responseNode.putArray("drafts");
    responseNode.putArray("messages");

    try {
      if (hasOLTGrantAccess(personalCode)) {
        ((ArrayNode) responseNode.get("acceptable_forms")).addObject()
            .put("form_name", "OLT_TAOTLUS");
      }

      GetGrantsResponse xteeResponse = ehis2XRoadService.getGrantsList(personalCode, personalCode);

      if (xteeResponse.isSetFault()) {
        xteeResponse.getFault().getServiceErrorList().forEach(
            faultMessage -> ((ArrayNode) responseNode.get("messages")).addObject()
                .put("message_type", "ERROR")
                .putObject("message_text").put("et", faultMessage.getMessage()));
      } else if (xteeResponse.isSetGrants()) {
        xteeResponse.getGrants().getGrantList().forEach(s -> {
          ((ArrayNode) responseNode.get("documents")).addObject()
              .put("form_name", "OLT_OTSUS")
              .put("identifier", s.getGrantNumber())
              .put("document_date", ehisDateFormat(s.getSubmitTime()))
              .put("status", s.getStatus());
        });
      }

      logForDrupal.setMessage("EHIS2 - getGrants.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      setError(log, responseNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());
    redisTemplate.opsForHash().put(personalCode, "OLT", responseNode);
    redisTemplate.expire(personalCode, redisExpire, TimeUnit.MINUTES);
  }

  public ObjectNode getDocument(String formName, String personalCode, String grantNumber) {
    ObjectNode responseNode = nodeFactory.objectNode();
    logForDrupal.setType("EHIS2 - getGrants.v1:getGrant");
    createGrantsXJSON(formName, grantNumber, personalCode, responseNode);
    ((ObjectNode) responseNode.get("header")).put("current_step", "step_1");

    try {
      GetGrantsResponse xteeResponse = ehis2XRoadService
          .getGrantWithNumber(grantNumber, personalCode, personalCode);

      ((ObjectNode) responseNode.get("body").get("steps")).putObject("step_1");
      ObjectNode stepDataElementsNode = ((ObjectNode) responseNode.get("body").get("steps")
          .get("step_1")).putObject("data_elements");
      ArrayNode decisionValues = stepDataElementsNode.putObject("application_decision")
          .putArray("value");
      ArrayNode paymentValues = stepDataElementsNode.putObject("grant_payment")
          .putArray("value");
      ArrayNode suspensionValues = stepDataElementsNode.putObject("grant_status_suspension")
          .putArray("value");
      ArrayNode recoveryValues = stepDataElementsNode.putObject("grant_recovery")
          .putArray("value");
      ArrayNode applicationFileValues = stepDataElementsNode.putObject("application_file")
          .putArray("value");
      ArrayNode decisionFileValues = stepDataElementsNode.putObject("decision_file")
          .putArray("value");
      ArrayNode recoveryFileValues = stepDataElementsNode.putObject("recovery_file")
          .putArray("value");

      if (xteeResponse.isSetFault()) {
        setServiceErrors(responseNode, "step_1", xteeResponse.getFault().getServiceErrorList());
      } else {
        Grant grant = xteeResponse.getGrants().getGrantList().get(0);

        if (grant.isSetApplicationDecision()) {
          decisionValues.addObject()
              .put("decision_number", grant.getApplicationDecision().getDecisionNumber())
              .put("decision_date", grant.getApplicationDecision().getDecisionDate() != null
                  ? ehisDateFormat(grant.getApplicationDecision().getDecisionDate()) : null)
              .put("decision", grant.getApplicationDecision().getDecision())
              .put("payment_sum", (float) grant.getApplicationDecision().getPaymentSum() / 100);
        }

        if (grant.isSetGrantPaymentList()) {
          grant.getGrantPaymentList().getGrantPaymentList().forEach(payment -> {
            paymentValues.addObject()
                .put("payment_date", payment.getPaymentDate() != null
                    ? ehisDateFormat(payment.getPaymentDate()) : null)
                .put("payment_sum", (float) payment.getPaymentSum() / 100);
          });
        }

        if (grant.isSetGrantStatusList()) {
          grant.getGrantStatusList().getGrantStatusList().forEach(suspension -> {
            if (suspension.getStatusType().equalsIgnoreCase("GRANT_STATUS:SUSPENSION")) {
              suspensionValues.addObject()
                  .put("valid_from", suspension.getStatusValidFrom() != null
                      ? ehisDateFormat(suspension.getStatusValidFrom()) : null)
                  .put("valid_until", suspension.isSetStatusValidUntil()
                      ? ehisDateFormat(suspension.getStatusValidUntil()) : null)
                  .put("reason", suspension.getReason());
            }
          });
        }

        if (grant.isSetGrantRecoveryList()) {
          grant.getGrantRecoveryList().getGrantRecoveryList().forEach(recovery -> {
            recoveryValues.addObject().put("decision_number", recovery.getId())
                .put("recovery_date", recovery.getRecoveryDate() != null
                    ? ehisDateFormat(recovery.getRecoveryDate()) : null)
                .put("recovery_sum", (float) recovery.getRecoverySum() / 100);
          });
        }

        if (grant.isSetGrantFilesList()) {
          grant.getGrantFilesList().getGrantFileList().forEach(file -> {
            String filename = file.getFileName();
            if (StringUtils.isEmpty(file.getFileName())) {
              filename = grant.getGrantNumber() + "_" + file.getUID();
            }
            if (file.getFileType().equalsIgnoreCase("GRANT_FILE_TYPE:DECISION_APPLICATION")) {
              decisionFileValues.addObject().put("file_name", filename)
                  .put("file_identifier", "OLT_" + grant.getGrantNumber() + "_" + file.getUID());
            } else if (file.getFileType().equalsIgnoreCase("GRANT_FILE_TYPE:DECISION_RECOVERY")) {
              recoveryFileValues.addObject().put("file_name", filename)
                  .put("file_identifier", "OLT_" + grant.getGrantNumber() + "_" + file.getUID());
            } else if (file.getFileType().equalsIgnoreCase("GRANT_FILE_TYPE:APPLICATION")
//              || file.getFileType().equalsIgnoreCase("GRANT_FILE_TYPE:APPLICATION_EXTRA")
            ) {
              applicationFileValues.addObject().put("file_name", filename)
                  .put("file_identifier", "OLT_" + grant.getGrantNumber() + "_" + file.getUID());
            }
          });
        }

        logForDrupal
            .setMessage("EHIS2 - getGrants.v1:getGrant teenuselt andmete pärimine õnnestus.");
      }
    } catch (Exception e) {
      setXdzeisonError(log, responseNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());
    return responseNode;
  }

  public ObjectNode postDocument(ObjectNode jsonNode) {
    String currentStep = jsonNode.get("header").get("current_step").isNull() ? null
        : jsonNode.get("header").get("current_step").asText();
    String personalCode = jsonNode.get("header").get("agents").get(0).get("person_id").asText();

    if (isAcceptableActivityView(jsonNode)) {
      return jsonNode;
    }

    try {
      if (currentStep == null) {
        jsonNode.putObject("body").putObject("steps");
        ((ObjectNode) jsonNode.get("body")).putArray("messages");
        jsonNode.putObject("messages").put("default", "default");

        ((ObjectNode) jsonNode.get("body").get("steps")).putObject("step_type_selection")
            .putObject("data_elements").putObject("grant_type").putNull("value");
        ((ObjectNode) jsonNode.get("body").get("steps").get("step_type_selection"))
            .putArray("messages");

        ((ObjectNode) jsonNode.get("header")).put("current_step", "step_type_selection");
        ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("CONTINUE");

        logForDrupal.setMessage("Grant postDocument step_type_selection json loodud");
      } else if (currentStep.equalsIgnoreCase("step_type_selection")) {
        logForDrupal.setType("EHIS2 - getGrants.v1:getApplicationData");
        String grantType = jsonNode.get("body").get("steps").get("step_type_selection")
            .get("data_elements").get("grant_type").get("value").asText();

        ObjectNode stepApplicationDataElements = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_application").putObject("data_elements");

        GetGrantsResponse xRaodResponse = ehis2XRoadService
            .getApplicationData("GRANT_TYPE:" + grantType, personalCode, personalCode);

        if (xRaodResponse.isSetFault()) {
          setServiceErrors(jsonNode, currentStep, xRaodResponse.getFault().getServiceErrorList());
        } else {
          ((ObjectNode) jsonNode.get("header"))
              .put("identifier", xRaodResponse.getGrants().getGrantList().get(0).getGrantNumber());
          Application grantApplication = xRaodResponse.getGrants().getGrantList().get(0)
              .getApplication();
          stepApplicationDataElements.putObject("person_application_first_name")
              .put("value", grantApplication.getPersonApplicationFirstName());
          stepApplicationDataElements.putObject("person_application_last_name")
              .put("value", grantApplication.getPersonApplicationLastName());
          stepApplicationDataElements.putObject("person_application_id_code")
              .put("value", grantApplication.getPersonApplicationIdCode());
          stepApplicationDataElements.putObject("person_application_native_language")
              .put("value", grantApplication.getNativeLanguage());
          stepApplicationDataElements.putObject("person_application_citizenship")
              .put("value", grantApplication.getCitizenship());
          stepApplicationDataElements.putObject("person_application_email")
              .put("value", grantApplication.getPersonApplicationEmail());
          stepApplicationDataElements.putObject("person_application_phone_number")
              .put("value", grantApplication.getPersonApplicationPhoneNumber());
          stepApplicationDataElements.putObject("person_application_bank_account")
              .put("value", grantApplication.getPersonApplicationBankAccount());

          ArrayNode occupationValues = stepApplicationDataElements.putObject("occupation_data")
              .putArray("value");
          if (grantApplication.isSetOccupationDataList()) {
            grantApplication.getOccupationDataList().getOccupationDataList()
                .forEach(occupationData -> occupationValues.addObject()
                    .put("educational_institute_name", occupationData.getEducationalInstituteName())
                    .put("applicant_occupation", occupationData.getApplicantOccupation())
                    .put("applicant_subjects",
                        occupationData.isSetApplicantSubjects() ?
                            occupationData.getApplicantSubjects().getApplicantSubjectList().stream()
                                .map(ApplicantSubject::getSubject).collect(Collectors.joining(", "))
                            : null)
                    .put("applicant_workload", occupationData.getApplicantWorkload())
                    .put("meets_requirement", occupationData.getMeetsRequirement())
                    .put("contract_begin_date",
                        ehisDateFormat(occupationData.getContractBeginDate())));
          }

          ArrayNode qualificationValues = stepApplicationDataElements
              .putObject("qualification_data")
              .putArray("value");
          if (grantApplication.isSetQualificationDataList()) {
            grantApplication.getQualificationDataList().getQualificationDataList()
                .forEach(qualificationData -> qualificationValues.addObject()
                    .put("qualification", qualificationData.getQualification())
                    .put("curriculum_name", qualificationData.getCurriculumName())
                    .put("educational_institute_name",
                        qualificationData.getEducationalInstituteName())
                    .put("language", qualificationData.getLanguage())
                    .put("qualification_document_number",
                        qualificationData.getQualificationDocumentNumber())
                    .put("qualification_date",
                        ehisDateFormat(qualificationData.getQualificationDate())));
          }

          ArrayNode vocationValues = stepApplicationDataElements.putObject("vocation_data")
              .putArray("value");
          if (grantApplication.isSetVocationDataList()) {
            grantApplication.getVocationDataList().getVocationDataList().forEach(
                vocationData -> vocationValues.addObject()
                    .put("vocation_name", vocationData.getVocationName())
                    .put("vocation_date", ehisDateFormat(vocationData.getVocationDate())));
          }

          ArrayNode extensionsValues = stepApplicationDataElements
              .putObject("application_entry_extensions")
              .putArray("value");
          if (grantApplication.isSetApplicationEntryExtensionsList()) {
            grantApplication.getApplicationEntryExtensionsList().getApplicationEntryExtensionsList()
                .forEach(applicationEntryExtensions -> extensionsValues.addObject()
                    .put("extension_begin_date",
                        ehisDateFormat(applicationEntryExtensions.getExtensionBeginDate()))
                    .put("extension_end_date",
                        ehisDateFormat(applicationEntryExtensions.getExtensionEndDate()))
                    .put("extension_type", applicationEntryExtensions.getExtensionType()));
          }

          stepApplicationDataElements.putObject("additional_info_text").putNull("value");
          stepApplicationDataElements.putObject("additional_info_file").putArray("value");

          ((ObjectNode) jsonNode.get("header")).put("current_step", "step_application");
          ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("SUBMIT");
        }

        logForDrupal.setMessage(
            "EHIS2 - getGrants.v1:getApplicationData teenuselt andmete pärimine õnnestus.");
      } else if (currentStep.equalsIgnoreCase("step_application")) {
        logForDrupal.setType("EHIS2 - postGrants.v1");

        ObjectNode requestDataElement = (ObjectNode) jsonNode.get("body").get("steps")
            .get("step_application").get("data_elements");
        XRoadMessage<PostGrantsRequest> xRoadMessage =
            new XmlBeansXRoadMessage<PostGrantsRequest>(PostGrantsRequest.Factory.newInstance());
        Grant grant = xRoadMessage.getContent().addNewGrant();
        grant.setGrantNumber(jsonNode.get("header").get("identifier").asText());
        grant.setPersonIdCode(personalCode.startsWith("EE") ? personalCode : "EE" + personalCode);
        Application application = grant.addNewApplication();
        application.setPersonApplicationIdCode(
            requestDataElement.get("person_application_id_code").get("value").asText(null));
        application.setPersonApplicationFirstName(
            requestDataElement.get("person_application_first_name").get("value").asText(null));
        application.setPersonApplicationLastName(
            requestDataElement.get("person_application_last_name").get("value").asText(null));
        application.setPersonApplicationEmail(
            requestDataElement.get("person_application_email").get("value").asText(null));
        application.setPersonApplicationPhoneNumber(
            requestDataElement.get("person_application_phone_number").get("value").asText(null));
        application.setPersonApplicationBankAccount(
            requestDataElement.get("person_application_bank_account").get("value").asText(null));
        application
            .setComment(requestDataElement.get("additional_info_text").get("value").asText(null));

        if (requestDataElement.get("additional_info_file").get("value").size() > 0) {
          GrantFileList grantFileList = grant.addNewGrantFilesList();
          requestDataElement.get("additional_info_file").get("value").forEach(item -> {
            GrantFile grantFile = grantFileList.addNewGrantFile();
            grantFile.setFileName(item.get("file_name").asText().replace(" ", "_"));
            grantFile.setContent("cid:" + item.get("file_identifier").asText());
            String guessContentType = URLConnection.guessContentTypeFromName(grantFile.getFileName());
            DataHandler dataHandler = new DataHandler(new ByteArrayDataSource(
                guessContentType == null ? "application/octet-stream" : guessContentType,
                Base64.getDecoder().decode((String) redisFileTemplate.opsForHash()
                    .get(personalCode, item.get("file_identifier").asText()))));
//            grantFile.setContentHandler(dataHandler);
            xRoadMessage.getAttachments().add(new XRoadAttachment(
                item.get("file_identifier").asText(), dataHandler));
          });
        }

        PostGrantsResponse postGrantsResponse = ehis2XRoadService.postGrants(xRoadMessage, personalCode);

        if (postGrantsResponse.isSetFault()) {
          setServiceErrors(jsonNode, currentStep,
              postGrantsResponse.getFault().getServiceErrorList());
        } else {
          ObjectNode stepResponseDataElements = ((ObjectNode) jsonNode.get("body").get("steps"))
              .putObject("step_response").putObject("data_elements");

          Application grantApplication = postGrantsResponse.getGrant().getApplication();
          stepResponseDataElements.putObject("person_application_first_name")
              .put("value", grantApplication.getPersonApplicationFirstName());
          stepResponseDataElements.putObject("person_application_last_name")
              .put("value", grantApplication.getPersonApplicationLastName());
          stepResponseDataElements.putObject("person_application_id_code")
              .put("value", grantApplication.getPersonApplicationIdCode());
          stepResponseDataElements.putObject("person_application_native_language")
              .put("value", grantApplication.getNativeLanguage());
          stepResponseDataElements.putObject("person_application_citizenship")
              .put("value", grantApplication.getCitizenship());
          stepResponseDataElements.putObject("person_application_email")
              .put("value", grantApplication.getPersonApplicationEmail());
          stepResponseDataElements.putObject("person_application_phone_number")
              .put("value", grantApplication.getPersonApplicationPhoneNumber());
          stepResponseDataElements.putObject("person_application_bank_account")
              .put("value", grantApplication.getPersonApplicationBankAccount());

          ArrayNode occupationValues = stepResponseDataElements.putObject("occupation_data")
              .putArray("value");
          if (grantApplication.isSetOccupationDataList()) {
            grantApplication.getOccupationDataList().getOccupationDataList()
                .forEach(occupationData -> occupationValues.addObject()
                    .put("educational_institute_name", occupationData.getEducationalInstituteName())
                    .put("applicant_occupation", occupationData.getApplicantOccupation())
                    .put("applicant_subjects",
                        occupationData.isSetApplicantSubjects() ?
                            occupationData.getApplicantSubjects().getApplicantSubjectList().stream()
                                .map(ApplicantSubject::getSubject).collect(Collectors.joining(", "))
                            : null)
                    .put("applicant_workload", occupationData.getApplicantWorkload())
                    .put("meets_requirement", occupationData.getMeetsRequirement())
                    .put("contract_begin_date",
                        ehisDateFormat(occupationData.getContractBeginDate())));
          }

          ArrayNode qualificationValues = stepResponseDataElements.putObject("qualification_data")
              .putArray("value");
          if (grantApplication.isSetQualificationDataList()) {
            grantApplication.getQualificationDataList().getQualificationDataList()
                .forEach(qualificationData -> qualificationValues.addObject()
                    .put("qualification", qualificationData.getQualification())
                    .put("curriculum_name", qualificationData.getCurriculumName())
                    .put("educational_institute_name",
                        qualificationData.getEducationalInstituteName())
                    .put("language", qualificationData.getLanguage())
                    .put("qualification_document_number",
                        qualificationData.getQualificationDocumentNumber())
                    .put("qualification_date",
                        ehisDateFormat(qualificationData.getQualificationDate())));
          }

          ArrayNode vocationValues = stepResponseDataElements.putObject("vocation_data")
              .putArray("value");
          if (grantApplication.isSetVocationDataList()) {
            grantApplication.getVocationDataList().getVocationDataList().forEach(
                vocationData -> vocationValues.addObject()
                    .put("vocation_name", vocationData.getVocationName())
                    .put("vocation_date", ehisDateFormat(vocationData.getVocationDate())));
          }

          ArrayNode extensionsValues = stepResponseDataElements
              .putObject("application_entry_extensions")
              .putArray("value");
          if (grantApplication.isSetApplicationEntryExtensionsList()) {
            grantApplication.getApplicationEntryExtensionsList().getApplicationEntryExtensionsList()
                .forEach(applicationEntryExtensions -> extensionsValues.addObject()
                    .put("extension_begin_date",
                        ehisDateFormat(applicationEntryExtensions.getExtensionBeginDate()))
                    .put("extension_end_date",
                        ehisDateFormat(applicationEntryExtensions.getExtensionEndDate()))
                    .put("extension_type", applicationEntryExtensions.getExtensionType()));
          }

          stepResponseDataElements.putObject("additional_info_text")
              .put("value", grantApplication.getComment());

          ArrayNode filesValues = stepResponseDataElements.putObject("additional_info_file")
              .putArray("value");
          if (postGrantsResponse.getGrant().isSetGrantFilesList()) {
            postGrantsResponse.getGrant().getGrantFilesList().getGrantFileList().forEach(
                grantFile -> filesValues.addObject().put("file_name", grantFile.getFileName())
                    .put("file_identifier",
                        "OLT_" + postGrantsResponse.getGrant().getGrantNumber() + "_" + grantFile
                            .getUID()));
          }

          ((ObjectNode) jsonNode.get("body").get("steps").get("step_response"))
              .putArray("messages").add("Done");
          ((ObjectNode) jsonNode.get("messages")).putObject("Done")
              .put("message_type", "NOTICE")
              .put("message_code", "grantsSubmitted")
              .putObject("message_text").put("et", "Taotlus Esitatud!");

          ((ObjectNode) jsonNode.get("header")).put("current_step", "step_response");
          ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
        }

        logForDrupal.setMessage(
            "EHIS2 - postGrants.v1 teenuselt andmete pärimine õnnestus.");
      }
    } catch (Exception e) {
      setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getDocumentFile(String documentId, String personalCode) {
    documentId = documentId.replace("OLT_", "");
    String grantNumber = documentId.split("_")[0];
    String uuid = documentId.split("_")[1];
    ObjectNode documentResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS2 - GRANT getFile.v1");
    logForDrupal.setSeverity("notice");

    try {
      GetFileRequest request = GetFileRequest.Factory.newInstance();
      request.setService("OLT");
      request.setParentReference(grantNumber);
      request.setFileReference(uuid);
      GetFileResponse response = ehis2XRoadService.getFile(request, personalCode);

      if (response.isSetFault()) {
        documentResponse.putObject("error").put("message_type", "ERROR").putObject("message_text")
            .put("et", "Tehniline viga!");
      }
      byte[] content = IOUtils.toByteArray(response.getFileHandler().getInputStream());
      documentResponse.put("fileName", response.getFileHandler().getName())
          .put("size", content.length)
          .put("mediaType", response.getFileHandler().getContentType().split(";")[0])
          .put("value", content);

      logForDrupal.setMessage("EHIS2 - GRANT getFile.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      setError(log, documentResponse, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return documentResponse;
  }

  private void createGrantsXJSON(String formName, String identifier, String personalCode,
      ObjectNode jsonNode) {
    jsonNode.putObject("header")
        .put("endpoint", "EHIS2")
        .put("form_name", formName)
        .putNull("current_step")
        .put("identifier", identifier)
        .putArray("acceptable_activity").add("VIEW");

    jsonNode.putObject("body").putObject("steps");
    ((ObjectNode) jsonNode.get("body")).putArray("messages");
    jsonNode.putObject("messages").put("default", "default");

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setSeverity("notice");
  }

  private void setServiceErrors(ObjectNode jsonNode, String step, Collection<ServiceError> errors) {
    AtomicBoolean isFatalError = new AtomicBoolean(true);
    Collection<String> rest400ErrorCodes = Arrays.asList(
        "patchApplicationGrantNumberBadValue", "patchApplicationNoApplicationData",
        "patchApplicationIban", "getApplicationOccupationsNotFound",
        "getApplicationQualificationsNotFound", "getApplicationGrantSubmissionTime",
        "postFileMaxSizeExceeded", "postFileExtensionForbidden",
        "postFileExtensionNotFound", "postFileDuplicateFileName",
        "application.personApplicationEmail.emailValidationFailure",
        "application.personApplicationBankAccount.notNull",
        "application.personApplicationBankAccount.notBlank");
    jsonNode.putObject("messages");

    if (jsonNode.get("body").get("messages") == null) {
      ((ObjectNode) jsonNode.get("body")).putArray("messages");
    }
    if (!StringUtils.isEmpty(step)) {
      ((ObjectNode) jsonNode.get("body").get("steps").get(step)).putArray("messages");
    }

    errors.forEach(e -> {
      if (rest400ErrorCodes.contains(e.getCode())) {
        isFatalError.set(false);
      }
      if (StringUtils.isEmpty(step)) {
        ((ArrayNode) jsonNode.get("body").get("messages")).add(e.getCode());
      } else {
        ((ArrayNode) jsonNode.get("body").get("steps").get(step).get("messages")).add(e.getCode());
      }
      ((ObjectNode) jsonNode.get("messages")).putObject(e.getCode())
          .put("message_type", "ERROR")
          .put("message_code", e.getCode())
          .putObject("message_text").put("et", e.getMessage());
    });

    if (isFatalError.get()) {
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
    }
  }
}
