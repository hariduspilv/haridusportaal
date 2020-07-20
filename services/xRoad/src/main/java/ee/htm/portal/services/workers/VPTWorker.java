package ee.htm.portal.services.workers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import ee.htm.portal.services.client.EhisXRoadService;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.FailInfoDto;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.IsikInfoDto;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Message;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.OppimineDto;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.Sugulusaste;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusDokumentDocument.VpTaotlusDokument;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusDokumentResponseDocument.VpTaotlusDokumentResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusEsitamineDocument.VpTaotlusEsitamine;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusEsitamineResponseDocument.VpTaotlusEsitamineResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusIsikudDocument.VpTaotlusIsikud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusIsikudResponseDocument.VpTaotlusIsikudResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusKontaktDocument.VpTaotlusKontakt;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusKontaktResponseDocument.VpTaotlusKontaktResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusOpingudResponseDocument.VpTaotlusOpingudResponse;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusSissetulekudDocument.VpTaotlusSissetulekud;
import ee.htm.portal.services.types.ee.riik.xtee.ehis.producers.producer.ehis.VpTaotlusSissetulekudResponseDocument.VpTaotlusSissetulekudResponse;
import java.sql.Timestamp;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;

public class VPTWorker extends Worker {

  private static final Logger log = LoggerFactory.getLogger(VPTWorker.class);

  private EhisXRoadService ehisXRoadService;

  private RedisTemplate<String, String> redisFileTemplate;

  public VPTWorker(EhisXRoadService ehisXRoadService, RedisTemplate<String, Object> redisTemplate,
      RedisTemplate<String, String> redisFileTemplate, Long redisExpire, Long redisFileExpire,
      Long redisKlfExpire) {
    super(redisTemplate, redisExpire, redisFileExpire, redisKlfExpire);
    this.ehisXRoadService = ehisXRoadService;
    this.redisFileTemplate = redisFileTemplate;
  }

  public void getDocuments(String personalCode) {
    ObjectNode documentsResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - VpTaotlusOpingud.v1");
    logForDrupal.setSeverity("notice");

    documentsResponse.putArray("documents");
    documentsResponse.putArray("acceptable_forms");
    documentsResponse.putArray("drafts");
    documentsResponse.putArray("messages");

    try {
      VpTaotlusOpingudResponse response = ehisXRoadService
          .vptOpingud(personalCode, null, personalCode);

      response.getTaotluseAjaluguList().forEach(
          ajalugu -> ((ArrayNode) documentsResponse.get("documents")).addObject()
              .put("form_name",
                  ajalugu.getOlek().equalsIgnoreCase("Menetluses") ?
                      "VPT_ESITATUD_TAOTLUS"
                      : "VPT_ESITATUD_TAOTLUS_OTSUS")
              .put("identifier", ajalugu.getId())
              .put("document_date",
                  ajalugu.isSetEsitamiseKuupaev() && ajalugu.getEsitamiseKuupaev() != null
                      ? ehisDateFormat((Calendar) ajalugu.getEsitamiseKuupaev()) : null)
              .put("status", ajalugu.getOlek()));

      if (response.getHoiatusDto().getErrorMessagesList().isEmpty()) {
        if (response.isSetTaotluseId() && response.getTaotluseId() != null
            && !response.getTaotluseId().equals("")) {
          ((ArrayNode) documentsResponse.get("drafts")).addObject()
              .put("form_name", "VPT_TAOTLUS")
              .put("identifier", (Long) response.getTaotluseId());
        } else {
          ((ArrayNode) documentsResponse.get("acceptable_forms")).addObject()
              .put("form_name", "VPT_TAOTLUS");
        }
      }

      response.getHoiatusDto().getErrorMessagesList().forEach(
          errorMessage -> ((ArrayNode) documentsResponse.get("messages")).addObject()
              .put("message_type", "ERROR")
              .putObject("message_text").put("et", errorMessage.getKirjeldus()));

      response.getHoiatusDto().getWarningMessagesList().forEach(
          warningMessage -> ((ArrayNode) documentsResponse.get("messages")).addObject()
              .put("message_type", "WARNING")
              .putObject("message_text").put("et", warningMessage.getKirjeldus()));

      response.getHoiatusDto().getSuccessMessagesList()
          .forEach(successMessage -> ((ArrayNode) documentsResponse.get("messages")).addObject()
              .put("message_type", "NOTICE")
              .putObject("message_text").put("et", successMessage.getKirjeldus()));

      logForDrupal.setMessage("EHIS - VpTaotlusOpingud.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      documentsResponse.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    redisTemplate.opsForHash().put(personalCode, "vpTaotlus", documentsResponse);
    redisTemplate.expire(personalCode, redisExpire, TimeUnit.MINUTES);
  }

  public ObjectNode getDocument(String formName, String identifier) {
    ObjectNode documentResponse = nodeFactory.objectNode();

    documentResponse.putObject("header")
        .put("form_name", formName)
        .put("current_step", "step_0")
        .put("identifier", identifier)
        .putArray("acceptable_activity")
        .add("VIEW");

    ObjectNode dataElementsNode = documentResponse.putObject("body").putObject("steps")
        .putObject("step_0").putObject("data_elements");
    dataElementsNode.putObject("application_file").putArray("value")
        .addObject()
        .put("file_name", "taotlus.zip")
        .put("file_identifier", "VPT_TAOTLUS_ZIP_" + identifier);

    if (formName.equalsIgnoreCase("VPT_ESITATUD_TAOTLUS_OTSUS")) {
      dataElementsNode.putObject("decision_file").putArray("value")
          .addObject()
          .put("file_name", "otsus.bdoc")
          .put("file_identifier", "VPT_OTSUS_DDOC_" + identifier);
    }

    return documentResponse;
  }

  public ObjectNode postDocument(ObjectNode jsonNode) {
    String currentStep = jsonNode.get("header").get("current_step").isNull() ? null
        : jsonNode.get("header").get("current_step").asText();
    Long applicationId = jsonNode.get("header").get("identifier").isNull() ? null
        : jsonNode.get("header").get("identifier").asLong();
    String applicantPersonalCode = jsonNode.get("header").get("agents").get(0).get("person_id")
        .asText();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(applicantPersonalCode);
    logForDrupal.setSeverity("notice");

    List<String> acceptableActivity = new ArrayList<>();
    jsonNode.get("header").get("acceptable_activity")
        .forEach(i -> acceptableActivity.add(i.asText()));

    if (acceptableActivity.contains("VIEW")) {
      return jsonNode;
    }

    try {
      if (currentStep == null) {
        jsonNode.putObject("body").putObject("steps");
        ((ObjectNode) jsonNode.get("body")).putArray("messages");
        jsonNode.putObject("messages").put("defualt", "default");

//region NULL
        VpTaotlusOpingudResponse response = ehisXRoadService
            .vptOpingud(applicantPersonalCode, null, applicantPersonalCode);

//region STEP_0 vpTaotlusOpingud response
        ObjectNode stepZeroDataElements = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_0").putObject("data_elements");
        ArrayNode values = stepZeroDataElements.putObject("studies").putArray("value");

        response.getOppimineDtosList().forEach(item ->
            values.addObject()
                .put("institution_id", item.getAsutuseId())
                .put("institution_name", item.getAsutuseNimi())
                .put("type", item.getOppeTyyp())
                .put("type_coded",
                    item.isSetOppeTyypKL() ?
                        (Integer) item.getOppeTyypKL()
                        : null)
                .put("study_programme", item.getOppekavaNimi())
                .put("study_programme_EHISid", item.getOppekavaKood())
                .put("start_date", ehisDateFormat(item.getAlustamiseKuupaev()))
                .put("learning_load", item.getOppekoormusTyyp())
                .put("learning_load_code",
                    item.isSetOppekoormusTyypKL() ?
                        (Integer) item.getOppekoormusTyypKL()
                        : null)
                .put("completion_rate", item.getTaitmiseProtsent())
                .put("academic_leave_start",
                    item.isSetAkadeemilisePuhkuseAlustamiseKuupaev()
                        && item.getAkadeemilisePuhkuseAlustamiseKuupaev() != null ?
                        ehisDateFormat((Calendar) item.getAkadeemilisePuhkuseAlustamiseKuupaev())
                        : null)
                .put("first_semester_end",
                    item.isSetEsimeseSemestriLoppKp() && item.getEsimeseSemestriLoppKp() != null ?
                        ehisDateFormat((Calendar) item.getEsimeseSemestriLoppKp()) : null));

        ((ObjectNode) jsonNode.get("body").get("steps").get("step_0")).putArray("messages");
        setMessages(jsonNode, response.getHoiatusDto().getErrorMessagesList(), "ERROR", null);
        setMessages(jsonNode, response.getHoiatusDto().getWarningMessagesList(), "WARNING",
            "step_0");
        setMessages(jsonNode, response.getHoiatusDto().getSuccessMessagesList(), "NOTICE", null);

        ((ObjectNode) jsonNode.get("header")).put("current_step", "step_0");
//endregion;

        logForDrupal.setType("EHIS - VpTaotlusOpingud.v1");
        logForDrupal
            .setMessage("EHIS - VpTaotlusOpingud.v1 teenuselt andmete pärimine õnnestus.");
//endregion;
      } else if (currentStep.equalsIgnoreCase("step_0")) {
//region STEP_0
//region STEP_1 vpTaotlusIsikud request
        VpTaotlusIsikud request = VpTaotlusIsikud.Factory.newInstance();
        List<OppimineDto> oppimineDtoList = new ArrayList<>();

        jsonNode.get("body").get("steps").get("step_0").get("data_elements").get("studies")
            .get("value").forEach(item -> {
          OppimineDto oppimineDto = OppimineDto.Factory.newInstance();
          Calendar cal = Calendar.getInstance();
          oppimineDto.setAsutuseId(item.get("institution_id").asLong()); //Long
          oppimineDto.setAsutuseNimi(item.get("institution_name").asText()); //String
          oppimineDto.setOppeTyyp(item.get("type").asText()); //String
          if (!item.get("type_coded").isNull()) {
            oppimineDto.setOppeTyypKL(item.get("type_coded").asInt()); //int
          } else {
            oppimineDto.setNilOppeTyypKL();
          }
          oppimineDto.setOppekavaNimi(item.get("study_programme").asText()); //String
          oppimineDto.setOppekavaKood(item.get("study_programme_EHISid").asInt()); //Int
          try {
            cal.setTime(simpleDateFormat.parse(item.get("start_date").asText()));
            oppimineDto.setAlustamiseKuupaev(cal); //Date
          } catch (ParseException e) {
            log.error(e.getMessage(), e.getCause());
          }
          oppimineDto.setOppekoormusTyyp(item.get("learning_load").asText()); //String
          if (!item.get("learning_load_code").isNull()) {
            oppimineDto.setOppekoormusTyypKL(item.get("learning_load_code").asInt()); //Int
          } else {
            oppimineDto.setNilOppekoormusTyypKL();
          }
          oppimineDto.setTaitmiseProtsent(item.get("completion_rate").floatValue()); //Float
          if (!item.get("academic_leave_start").isNull()) {
            try {
              cal.setTime(simpleDateFormat.parse(item.get("academic_leave_start").asText()));
              oppimineDto.setAkadeemilisePuhkuseAlustamiseKuupaev(cal); //Date
            } catch (ParseException e) {
              log.error(e.getMessage(), e.getCause());
            }
          } else {
            oppimineDto.setNilAkadeemilisePuhkuseAlustamiseKuupaev();
          }
          if (!item.get("first_semester_end").isNull()) {
            try {
              cal.setTime(simpleDateFormat.parse(item.get("first_semester_end").asText()));
              oppimineDto.setEsimeseSemestriLoppKp(cal); //Date
            } catch (ParseException e) {
              log.error(e.getMessage(), e.getCause());
            }
          } else {
            oppimineDto.setNilEsimeseSemestriLoppKp();
          }
          oppimineDtoList.add(oppimineDto);
        });

        request.setTaotlejaIsikukood(applicantPersonalCode);
        request.getOppimineDtosList().addAll(oppimineDtoList);
//endregion;

        VpTaotlusIsikudResponse response = ehisXRoadService
            .vpTaotlusIsikud(request, applicantPersonalCode);

//region STEP_1 vpTaotlusIsikud response
        ((ObjectNode) jsonNode.get("header")).put("identifier", response.getTaotluseId());

        ObjectNode stepOneDataElements = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_1").putObject("data_elements");
        stepOneDataElements.putObject("step1h2").put("hidden", !response.getHoolealuneKuva());
        stepOneDataElements.putObject("custody").put("value", false)
            .put("hidden", !response.getHoolealuneKuva());
        ArrayNode familyMembersPopulationRegister = stepOneDataElements
            .putObject("family_members_population_register").putArray("value");
        ArrayNode familyMembersEntered = stepOneDataElements.putObject("family_members_entered")
            .putArray("value");

        AtomicBoolean isSetFamilyMembersEntered = new AtomicBoolean(false);
        response.getIsikInfoDtosList().forEach(item -> {
          if (item.getRahvastikuRegistrist()) {
            familyMembersPopulationRegister.addObject()
                .put("personal_id", item.getIsikukood())
                .put("last_name", item.getPerenimi())
                .put("first_name", item.getEesnimi())
                .put("birth_date", item.isSetSynniaeg() && !item.isNilSynniaeg()
                    ? ehisDateFormat((Calendar) item.getSynniaeg()) : "")
                .put("relationship", item.getSugulusaste().toString())
                .put("family_member", item.getArvestatudPereliikmeks())
                .put("studies", item.getOmandabHaridust())
                .put("data_from_population_register", item.getRahvastikuRegistrist())
                .put("data_from_tax_register", item.getEmtaRegistrist())
                .put("non_resident", item.getEmtaMitteResident());
          } else {
            isSetFamilyMembersEntered.set(true);
            familyMembersEntered.addObject()
                .put("personal_id", item.getIsikukood())
                .put("last_name", item.getPerenimi())
                .put("first_name", item.getEesnimi())
                .put("birth_date", item.isSetSynniaeg() && !item.isNilSynniaeg()
                    ? ehisDateFormat((Calendar) item.getSynniaeg()) : "")
                .put("relationship", item.getSugulusaste().toString())
                .put("family_member", item.getArvestatudPereliikmeks())
                .put("studies", item.getOmandabHaridust())
                .put("data_from_population_register", item.getRahvastikuRegistrist())
                .put("data_from_tax_register", item.getEmtaRegistrist())
                .put("non_resident", item.getEmtaMitteResident());
          }
        });

        stepOneDataElements.putObject("custody_proof")
            .put("required", response.getHoolealuneKuva())
//            .put("hidden", !response.getHoolealuneKuva())
            .putArray("value");
        stepOneDataElements.putObject("family_members_proof")
            .put("required", isSetFamilyMembersEntered.get())
//            .put("hidden", !isSetFamilyMembersEntered.get())
            .putArray("value");

        ((ObjectNode) jsonNode.get("body").get("steps").get("step_1")).putArray("messages");
        setMessages(jsonNode, response.getHoiatusDto().getErrorMessagesList(), "ERROR", null);
        setMessages(jsonNode, response.getHoiatusDto().getWarningMessagesList(), "WARNING",
            "step_1");
        setMessages(jsonNode, response.getHoiatusDto().getSuccessMessagesList(), "NOTICE", null);

        ((ObjectNode) jsonNode.get("header")).put("current_step", "step_1");
        ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("SAVE");
//endregion;

        logForDrupal.setType("EHIS - VpTaotlusIsikud.v1");
        logForDrupal.setMessage("EHIS - VpTaotlusIsikud.v1 teenuselt andmete pärimine õnnestus.");
//endregion;
      } else if (currentStep.equalsIgnoreCase("step_1")) {
//region STEP_1
        ObjectNode stepOneDataElements = (ObjectNode) jsonNode.get("body").get("steps")
            .get("step_1").get("data_elements");

//region STEP_1 custody and entered family members proof validations
        boolean returnStepOne = false;
        ((ObjectNode) jsonNode.get("body").get("steps").get("step_1")).putArray("messages");
//        ((ObjectNode) jsonNode.get("messages")).remove("custody_proof_validation_error");
//        ((ObjectNode) jsonNode.get("messages")).remove("family_members_proof_error");

        if (stepOneDataElements.get("custody").get("value").asBoolean()
            && stepOneDataElements.get("custody_proof").get("value").size() == 0) {
          returnStepOne = true;
          ((ArrayNode) jsonNode.get("body").get("steps").get("step_1").get("messages"))
              .add("custody_proof_validation_error");
          ((ObjectNode) jsonNode.get("messages")).putObject("custody_proof_validation_error")
              .put("message_type", "ERROR").putObject("message_text")
              .put("et",
                  "Eeskoste, asenduskoduteenuse või hooldamise kohta puuduvad andmeid tõendavad dokumendid.");
        }
        if (stepOneDataElements.get("family_members_entered").get("value").size() > 0
            && stepOneDataElements.get("family_members_proof").get("value").size() == 0) {
          returnStepOne = true;
          ((ArrayNode) jsonNode.get("body").get("steps").get("step_1").get("messages"))
              .add("family_members_proof_error");
          ((ObjectNode) jsonNode.get("messages")).putObject("family_members_proof_error")
              .put("message_type", "ERROR").putObject("message_text")
              .put("et", "Lisatud perekonnaliikmete andmeid tõendavad dokumendid puuduvad.");
        }
        if (returnStepOne) {
          return jsonNode;
        }
//endregion;
//region STEP_2 vpTaotlusSissetulekud request
        VpTaotlusSissetulekud request = VpTaotlusSissetulekud.Factory.newInstance();
        request.setTaotlejaIsikukood(applicantPersonalCode);
        request.setTaotluseId(applicationId);
        request.setHoolealune(stepOneDataElements.get("custody").get("value").asBoolean());

        if (stepOneDataElements.get("custody_proof").get("value").size() > 0) {
          List<FailInfoDto> custodyFiles = new ArrayList<>();
          stepOneDataElements.get("custody_proof").get("value").forEach(item -> {
            FailInfoDto failInfoDto = FailInfoDto.Factory.newInstance();
            failInfoDto.setContent(Base64.getDecoder().decode(((String) Objects
                .requireNonNull(redisFileTemplate.opsForHash()
                    .get(applicantPersonalCode, item.get("file_identifier").asText())))));
            failInfoDto.setFailiNimi(item.get("file_name").asText());
            custodyFiles.add(failInfoDto);
          });
          request.getHoolealuneFailidList().addAll(custodyFiles);
        }
        if (stepOneDataElements.get("family_members_proof").get("value").size() > 0) {
          List<FailInfoDto> personFailInfoDtoList = new ArrayList<>();
          stepOneDataElements.get("family_members_proof").get("value").forEach(item -> {
            FailInfoDto failInfoDto = FailInfoDto.Factory.newInstance();
            failInfoDto.setContent(Base64.getDecoder().decode(((String) Objects
                .requireNonNull(redisFileTemplate.opsForHash()
                    .get(applicantPersonalCode, item.get("file_identifier").asText())))));
            failInfoDto.setFailiNimi(item.get("file_name").asText());
            personFailInfoDtoList.add(failInfoDto);
          });
          request.getLisatudFailidList().addAll(personFailInfoDtoList);
        }

        List<IsikInfoDto> isikInfoDtoList = new ArrayList<>();
        stepOneDataElements.get("family_members_population_register").get("value")
            .forEach(item -> setIsikInfoDto(isikInfoDtoList, item));
        stepOneDataElements.get("family_members_entered").get("value")
            .forEach(item -> setIsikInfoDto(isikInfoDtoList, item));
        request.getIsikInfoDtosList().addAll(isikInfoDtoList);
//endregion;

        VpTaotlusSissetulekudResponse response = ehisXRoadService
            .vpTaotlusSissetulekud(request, applicantPersonalCode);

//region STEP_2 vpTaotlusSissetulekud response
        AtomicBoolean isSetNonresident = new AtomicBoolean(false);
        AtomicBoolean isSetDataMissing = new AtomicBoolean(false);

        ObjectNode stepTwoDataElements = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_2").putObject("data_elements");

        ArrayNode familyMembersTaxRegisterDataOK = stepTwoDataElements
            .putObject("family_members_tax_register_data_ok").putArray("value");
        ArrayNode familyMembersTaxRegisterDataMissing = stepTwoDataElements
            .putObject("family_members_tax_register_data_missing").putArray("value");
        ArrayNode familyMembersNonresident = stepTwoDataElements
            .putObject("family_members_nonresident").putArray("value");
        response.getIsikInfoDtosList().forEach(item -> {
          if (item.getEmtaRegistrist()) {
            familyMembersTaxRegisterDataOK.addObject()
                .put("family_member_name", item.getEesnimi() + " " + item.getPerenimi());
          } else if (item.getEmtaMitteResident()) {
            familyMembersNonresident.addObject()
                .put("family_member_name", item.getEesnimi() + " " + item.getPerenimi());
            isSetNonresident.set(true);
          } else {
            familyMembersTaxRegisterDataMissing.addObject()
                .put("family_member_name", item.getEesnimi() + " " + item.getPerenimi());
            isSetDataMissing.set(true);
          }
        });

        stepTwoDataElements.putObject("family_members_income")
            .put("value", response.isSetLisatudIsikuteSissetulek()
                && !response.getLisatudIsikuteSissetulek().equals(0.0f) ?
                (Float) response.getLisatudIsikuteSissetulek() : null)
            .put("required", isSetDataMissing.get())
            .put("hidden", !isSetDataMissing.get());
        stepTwoDataElements.putObject("family_members_income_proof")
            .put("required", isSetDataMissing.get())
            .put("hidden", !isSetDataMissing.get())
            .putArray("value");

        stepTwoDataElements.putObject("family_members_nonresident_income")
            .put("value", response.isSetNonResidentSissetulek()
                && !response.getNonResidentSissetulek().equals(0.0f) ?
                (Float) response.getNonResidentSissetulek() : null)
            .put("required", isSetNonresident.get())
            .put("hidden", !isSetNonresident.get());
        stepTwoDataElements.putObject("family_members_nonresident_income_proof")
            .put("required", isSetNonresident.get())
            .put("hidden", !isSetNonresident.get())
            .putArray("value");

        ((ObjectNode) jsonNode.get("body").get("steps").get("step_2")).putArray("messages");
        setMessages(jsonNode, response.getHoiatusDto().getErrorMessagesList(), "ERROR", null);
        setMessages(jsonNode, response.getHoiatusDto().getWarningMessagesList(), "WARNING",
            "step_2");
        setMessages(jsonNode, response.getHoiatusDto().getSuccessMessagesList(), "NOTICE", null);

        ((ObjectNode) jsonNode.get("header")).put("current_step", "step_2");
//endregion;

        logForDrupal.setType("EHIS - VpTaotlusSissetulekud.v1");
        logForDrupal
            .setMessage("EHIS - VpTaotlusSissetulekud.v1 teenuselt andmete pärimine õnnestus.");
//endregion;
      } else if (currentStep.equalsIgnoreCase("step_2")) {
//region STEP_2
        ObjectNode stepTwoDataElements = (ObjectNode) jsonNode.get("body").get("steps")
            .get("step_2").get("data_elements");

//region STEP_2 validations
        boolean returnToStepTwo = false;
        ((ObjectNode) jsonNode.get("body").get("steps").get("step_2")).putArray("messages");
//        ((ObjectNode) jsonNode.get("messages"))
//            .remove("family_members_income_proof_validation_error");
//        ((ObjectNode) jsonNode.get("messages"))
//            .remove("family_members_nonresident_income_proof_validation_error");

        if (stepTwoDataElements.get("family_members_income_proof").get("required").asBoolean()
            && stepTwoDataElements.get("family_members_income_proof").get("value").size() == 0) {
          returnToStepTwo = true;
          ((ArrayNode) jsonNode.get("body").get("steps").get("step_2").get("messages"))
              .add("family_members_income_proof_validation_error");
          ((ObjectNode) jsonNode.get("messages"))
              .putObject("family_members_income_proof_validation_error")
              .put("message_type", "ERROR").putObject("message_text")
              .put("et",
                  "Lisatud sissetulekute andmeid tõendavad dokumendid puuduvad.");
        }
        if (stepTwoDataElements.get("family_members_nonresident_income_proof")
            .get("required").asBoolean() &&
            stepTwoDataElements.get("family_members_nonresident_income_proof")
                .get("value").size() == 0) {
          returnToStepTwo = true;
          ((ArrayNode) jsonNode.get("body").get("steps").get("step_2").get("messages"))
              .add("family_members_nonresident_income_proof_validation_error");
          ((ObjectNode) jsonNode.get("messages"))
              .putObject("family_members_nonresident_income_proof_validation_error")
              .put("message_type", "ERROR").putObject("message_text")
              .put("et",
                  "Lisatud mitteresidendi sissetulekute andmeid tõendavad dokumendid puuduvad.");
        }
        if (returnToStepTwo) {
          return jsonNode;
        }
//endregion;
//region STEP_3 vpTaotlusKontakt request
        VpTaotlusKontakt request = VpTaotlusKontakt.Factory.newInstance();
        request.setTaotlejaIsikukood(applicantPersonalCode);
        request.setTaotluseId(applicationId);
        if (stepTwoDataElements.get("family_members_income").get("required").asBoolean()) {
          request.setLisatudIsikuteSissetulek(
              stepTwoDataElements.get("family_members_income").get("value").floatValue());
        }
        if (stepTwoDataElements.get("family_members_nonresident_income")
            .get("required").asBoolean()) {
          request.setNonResidentSissetulek(
              stepTwoDataElements.get("family_members_nonresident_income")
                  .get("value").floatValue());
        }
        if (stepTwoDataElements.get("family_members_income_proof").get("value").size() > 0) {
          List<FailInfoDto> addedFiles = new ArrayList<>();
          stepTwoDataElements.get("family_members_income_proof").get("value").forEach(item -> {
            FailInfoDto failInfoDto = FailInfoDto.Factory.newInstance();
            failInfoDto.setContent(Base64.getDecoder().decode(((String) Objects
                .requireNonNull(redisFileTemplate.opsForHash()
                    .get(applicantPersonalCode, item.get("file_identifier").asText())))));
            failInfoDto.setFailiNimi(item.get("file_name").asText());
            addedFiles.add(failInfoDto);
          });
          request.getLisatudFailidList().addAll(addedFiles);
        }
        if (stepTwoDataElements.get("family_members_nonresident_income_proof")
            .get("value").size() > 0) {
          List<FailInfoDto> nonResidentFiles = new ArrayList<>();
          stepTwoDataElements.get("family_members_nonresident_income_proof")
              .get("value").forEach(item -> {
            FailInfoDto failInfoDto = FailInfoDto.Factory.newInstance();
            failInfoDto.setContent(Base64.getDecoder().decode(((String) Objects
                .requireNonNull(redisFileTemplate.opsForHash()
                    .get(applicantPersonalCode, item.get("file_identifier").asText())))));
            failInfoDto.setFailiNimi(item.get("file_name").asText());
            nonResidentFiles.add(failInfoDto);
          });
          request.getNonResidentFailidList().addAll(nonResidentFiles);
        }
//endregion;

        VpTaotlusKontaktResponse response = ehisXRoadService
            .vpTaotlusKontakt(request, applicantPersonalCode);

//region STEP_3 vpTaotlusKontakt response
        ObjectNode step3DataElement = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_3").putObject("data_elements");
        step3DataElement.putObject("confirmation_2")
            .put("value", false)
            .put("hidden", !response.getFailiOigsuseKinnitusKuva())
            .put("required", response.getFailiOigsuseKinnitusKuva());
        step3DataElement.putObject("bank_account_owner")
            .put("value", response.getKontoOmanikuNimi());
        step3DataElement.putObject("bank_account_number")
            .put("value", response.getKontonumber());

        ((ObjectNode) jsonNode.get("body").get("steps").get("step_3")).putArray("messages");
        setMessages(jsonNode, response.getHoiatusDto().getErrorMessagesList(), "ERROR", null);
        setMessages(jsonNode, response.getHoiatusDto().getWarningMessagesList(), "WARNING",
            "step_3");
        setMessages(jsonNode, response.getHoiatusDto().getSuccessMessagesList(), "NOTICE", null);

        ((ObjectNode) jsonNode.get("header")).put("current_step", "step_3");
        ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("SUBMIT");
//endregion;

        logForDrupal.setType("EHIS - VpTaotlusSissetulekud.v1");
        logForDrupal
            .setMessage("EHIS - VpTaotlusSissetulekud.v1 teenuselt andmete pärimine õnnestus.");
//endregion;
      } else if (currentStep.equalsIgnoreCase("step_3")) {
//region STEP_3
//region SUBMIT vpTaotlusEsitamine request
        ObjectNode stepThreeDataElements = (ObjectNode) jsonNode.get("body").get("steps")
            .get("step_3").get("data_elements");
        VpTaotlusEsitamine request = VpTaotlusEsitamine.Factory.newInstance();

        request.setTaotluseId(applicationId);
        request.setTaotlejaIsikukood(applicantPersonalCode);
        request.setKontoOmanikuNimi(stepThreeDataElements.get("bank_account_owner")
            .get("value").asText());
        request.setKontonumber(stepThreeDataElements.get("bank_account_number")
            .get("value").asText());
        request.setEpost(stepThreeDataElements.get("applicant_email").get("value").asText());
        request.setTelefoniNumber(stepThreeDataElements.get("applicant_phone")
            .get("value").asText());
        request.setToetuseMitteSaamiseKinnitus(stepThreeDataElements.get("confirmation_1")
            .get("value").asBoolean());
        request.setFailiOigsuseKinnitus(stepThreeDataElements.get("confirmation_2")
            .get("value").asBoolean());
//endregion;

        VpTaotlusEsitamineResponse response = ehisXRoadService
            .vpTaotlusEsitamine(request, applicantPersonalCode);

//region SUBMIT vpTaotlusEsitamine respone
        ObjectNode submitDataElement = ((ObjectNode) jsonNode.get("body").get("steps"))
            .putObject("step_submit_result").putObject("data_elements");
        submitDataElement.putObject("id").put("value", response.getTaotlusInfoDto().getId());
        submitDataElement.putObject("submit_date").put("value",
            response.getTaotlusInfoDto().isSetEsitamiseKuupaev() ? ehisDateFormat(
                (Calendar) response.getTaotlusInfoDto().getEsitamiseKuupaev()) : null)
            .put("hidden", !response.getTaotlusInfoDto().isSetEsitamiseKuupaev());
        submitDataElement.putObject("status")
            .put("value", response.getTaotlusInfoDto().getOlek());
        submitDataElement.putObject("application_file").putArray("value").addObject()
            .put("file_name", "taotlus.zip")
            .put("file_identifier", "VPT_TAOTLUS_ZIP_" + response.getTaotlusInfoDto().getId());
        submitDataElement.putObject("decision_file").put("hidden",
            (response.getTaotlusInfoDto().getOlek().equalsIgnoreCase("SISESTAMISEL")
                || response.getTaotlusInfoDto().getOlek().equalsIgnoreCase("MENETLUSES")))
            .putArray("value").addObject().put("file_name", "otsus.bdoc")
            .put("file_identifier", "VPT_OTSUS_DDOC_" + response.getTaotlusInfoDto().getId());

        ((ObjectNode) jsonNode.get("body").get("steps").get("step_submit_result"))
            .putArray("messages");
        setMessages(jsonNode, response.getHoiatusDto().getErrorMessagesList(), "ERROR", null);
        setMessages(jsonNode, response.getHoiatusDto().getWarningMessagesList(), "WARNING",
            "step_submit_result");
        setMessages(jsonNode, response.getHoiatusDto().getSuccessMessagesList(), "NOTICE", null);

        ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
        ((ObjectNode) jsonNode.get("header")).put("current_step", "step_submit_result");
//endregion;
//endregion;
      }
    } catch (Exception e) {
      super.setXdzeisonError(log, jsonNode, e);
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return jsonNode;
  }

  public ObjectNode getDocumentFile(String documentId, String personalCode) {
    long applicationId;
    String documentType;
    ObjectNode documentResponse = nodeFactory.objectNode();

    logForDrupal.setStartTime(new Timestamp(System.currentTimeMillis()));
    logForDrupal.setUser(personalCode);
    logForDrupal.setType("EHIS - vpTaotlusDokument.v1");
    logForDrupal.setSeverity("notice");

    try {
      documentId = documentId.replace("VPT_", "");

      if (documentId.contains("OTSUS_DDOC")) {
        documentType = "OTSUS_DIGIDOC";
        applicationId = Long.parseLong(documentId.replace("OTSUS_DDOC_", ""));
      } else {
        documentType = "TAOTLUS_ZIP";
        applicationId = Long.parseLong(documentId.replace(documentType + "_", ""));
      }

      VpTaotlusDokument request = VpTaotlusDokument.Factory.newInstance();
      request.setTaotlejaIsikukood(personalCode);
      request.setDokumendiLiik(documentType);
      request.setTaotluseId(applicationId);
      VpTaotlusDokumentResponse response = ehisXRoadService
          .vpTaotlusDokument(request, personalCode);

      documentResponse.put("fileName", response.getFilename()).put("size", response.getSize())
          .put("mediaType", response.getMediatype()).put("value", response.getByteArrayValue());

      logForDrupal.setMessage("EHIS - vpTaotlusDokument.v1 teenuselt andmete pärimine õnnestus.");
    } catch (Exception e) {
      log.error(e.getMessage(), e.getCause());

      logForDrupal.setSeverity("ERROR");
      logForDrupal.setMessage(e.getMessage());

      documentResponse.putObject("error")
          .put("message_type", "ERROR").putObject("message_text").put("et", "Tehniline viga!");
    }

    logForDrupal.setEndTime(new Timestamp(System.currentTimeMillis()));
    log.info(logForDrupal.toString());

    return documentResponse;
  }

  private void setIsikInfoDto(List<IsikInfoDto> isikInfoDtoList, JsonNode item) {
    IsikInfoDto person = IsikInfoDto.Factory.newInstance();
    person.setIsikukood(item.get("personal_id").asText());
    person.setPerenimi(item.get("last_name").asText());
    person.setEesnimi(item.get("first_name").asText());

    if (!item.get("birth_date").asText("").equals("")) {
      try {
        Calendar cal = Calendar.getInstance();
        cal.setTime(simpleDateFormat.parse(item.get("birth_date").asText()));
        person.setSynniaeg(cal);
      } catch (ParseException e) {
        log.error(e.getMessage(), e.getCause());
      }
    }

    person.setSugulusaste(Sugulusaste.Enum.forString(item.get("relationship").asText()));
    person.setArvestatudPereliikmeks(item.get("family_member").asBoolean());
    person.setOmandabHaridust(item.get("studies").asBoolean());
    person.setRahvastikuRegistrist(item.get("data_from_population_register").asBoolean());
    person.setEmtaRegistrist(item.get("data_from_tax_register").asBoolean());
    person.setEmtaMitteResident(item.get("non_resident").asBoolean());
    isikInfoDtoList.add(person);
  }

  private void setMessages(ObjectNode jsonNode, List<Message> list, String type, String step) {
    if (type.equalsIgnoreCase("ERROR") && !list.isEmpty()) {
      ((ArrayNode) jsonNode.get("header").get("acceptable_activity")).removeAll().add("VIEW");
    }

    list.forEach(item -> {
      long timestamp = System.currentTimeMillis();
      if (StringUtils.isNotBlank(step)) {
        ((ArrayNode) jsonNode.get("body").get("steps").get(step).get("messages"))
            .add(type.toLowerCase() + "_" + timestamp);
      } else {
        ((ArrayNode) jsonNode.get("body").get("messages"))
            .add(type.toLowerCase() + "_" + timestamp);
      }
      ((ObjectNode) jsonNode.get("messages"))
          .putObject(type.toLowerCase() + "_" + timestamp)
          .put("message_type", type.toUpperCase())
          .putObject("message_text")
          .put("et", item.getKirjeldus());
      try {
        TimeUnit.MILLISECONDS.sleep(10L);
      } catch (InterruptedException e) {
        log.error(e.getMessage(), e.getCause());
      }
    });
  }
}
