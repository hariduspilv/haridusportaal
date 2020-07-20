<?php
  class FieldVaryService {
    public $string = '{ "tags": ["fieldArticleTags", "fieldNewsTags", "fieldTag", "fieldMainProfessionTag"], "accordion": ["fieldNewsAccordion", "fieldInfosystemAccordion", "fieldMainProfessionAccordion", "fieldOskaFieldAccordion", "fieldSurveyPageAccordion", "fieldAccordionSection"], "shortDescription": ["fieldShortDescription", "fieldDescriptionSummary", "fieldIntroduction", "fieldBodySummary"], "introductionText": ["fieldIntroductionText", "fieldResultPageIntroduction", "fieldSurveyPageIntroduction"], "content": ["fieldContentText"], "image": ["fieldIntroductionImage", "fieldLogo", "fieldPicture", "fieldMainProfessionPicture", "fieldOskaFieldPicture", "fieldSurveyPagePicture", "fieldImage", "fieldResultPagePicture"], "description": ["fieldNewsDescription", "fieldDescription", "body", "fieldBody"], "duration": ["fieldDuration", "FieldDuration"], "title": ["entityLabel", "FieldSchoolName"], "head": ["fieldStudyProgrammeLevel", "FieldStudyProgrammeLevel", "FieldEducationalInstitutionTy", "contentType"], "educationalInstitution": ["fieldEducationalInstitution"], "address": ["fieldAddress", "FieldAddress"], "teachingLanguage": ["fieldTeachingLanguage", "FieldTeachingLanguage"], "specialClass": ["fieldSpecialClass"], "studentHome": ["fieldStudentHome"], "phone": ["FieldSchoolContactPhone", "fieldSchoolContactPhone", "fieldPhone", "fieldContactPhone"], "email": ["FieldSchoolContactEmail", "fieldSchoolContactEmail", "fieldEmail", "fieldContactEmail"], "webpage": ["FieldSchoolWebpageAddress", "fieldSchoolWebpageAddress", "fieldWebpageLink", "fieldSchoolWebpageAddress"], "url": ["entityUrl", "EntityPath", "entityPath" ], "subtitle": ["fieldSubtitle"], "sidebar": ["fieldInfosystemSidebar", "fieldSidebar", "fieldOskaFieldSidebar", "fieldSurveyPageSidebar", "fieldRightSidebar", "fieldResultPageSidebar"], "fixedLabel": ["fieldFixedLabel"], "indicator": ["reverseOskaMainProfessionOskaIndicatorEntity"], "fillingBar": ["reverseOskaMainProfessionOskaFillingBarEntity"], "video": ["fieldNewsVideo", "fieldOskaVideo", "fieldSurveyPageVideo", "fieldVideo"], "additionalImages": ["fieldAdditionalImages"], "additionalVideos": ["fieldResultPageVideo", "fieldOskaMainProfessionVideo"], "author": ["fieldAuthor"], "person": ["fieldPerson", "fieldContactPerson"], "organizer": ["fieldOrganizer", "fieldContactOrganizer", "fieldOrganization", "fieldContactOrganization"], "links": ["fieldOskaMainProfessionLinks", "fieldEventLink", "fieldOskaWebPage", "fieldNewsLink", "fieldSurveyPageLink", "fieldResultPageLinks"], "group": ["fieldEventGroup"], "attachmentFile": ["fieldOskaMainProfessionFile", "fieldAttachmentFile", "fieldOskaAttachmentFile", "fieldSurveyPageAttachment", "fieldFile", "fieldResultPageFiles"], "graph": ["fieldDynamicGraph"], "infograph": ["fieldInfograph"], "additional": ["fieldAdditional", "fieldPracticalInformation"], "fieldPros": ["fieldOskaFieldPros"], "fieldCons": ["fieldOskaFieldCons"] }';

    function parse($data) {

      if (!$data) {
        return false;
      }

      $fields = json_decode($this->string);
      $tmp = new stdClass();

      foreach($data as $key => $value) {
        $found = false;
        foreach($fields as $field => $search) {
          if(in_array($key, $search)) {
            $found = $field;
          }
        }
        if (!$found) {
          $found = $key;
        }
        $tmp->$found = $value;
      }

      return $tmp;
    }
  }

  $FieldVaryService = new FieldVaryService();
  
?>