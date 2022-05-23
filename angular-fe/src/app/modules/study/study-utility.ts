import {FormItemOption} from '@app/_assets/formItem';
import {SortDirection} from '@app/_core/models/enums/sort-direction.enum';
import {Language} from '@app/_core/models/interfaces/language.enum';
import {Entity} from '@app/_core/models/interfaces/main';
import {ListOffsetParameters} from '@app/_core/models/list-offset-parameters';
import {MappedStudy} from './models/mapped-study';
import {MappedStudyFilters} from './models/mapped-study-filters';
import {MappedStudyPageFieldRightColumn} from './models/mapped-study-page-field-right-column';
import {MappedStudyPageFieldRightColumnStudyData} from './models/mapped-study-page-field-right-column-study-data';
import {Study} from './models/study';
import {StudyListMappedData} from './models/study-list-mapped-data';
import {StudyListViewFilterQueryResponse} from './models/study-list-view-filter-query-response';
import {StudyListViewQueryParameters} from './models/study-list-view-query-parameters';
import {StudyListViewRequestParameters} from './models/study-list-view-request-parameters';
import {StudyPageFieldRightColumn} from './models/study-page-field-right-column';
import {StudyPageFieldRightColumnDataEntity} from './models/study-page-field-right-column-data-entity';
import {YearOption} from './models/year-option';
import {MappedStudyPage} from '@app/modules/study/models/mapped-study-page';
import {getLangCode} from "@app/_core/router-utility";

export class StudyUtility {

  private static joinArrayToString(elements: (string | number)[]): string {
    return elements.join(', ');
  }

  private static mapOptionTypesToFormItemOptions(options: Entity[]): FormItemOption[] {
    return options.map(entity => ({key: entity.entityLabel, value: entity.entityId}));
  }

  /**
   *
   * @param study - a single study list item
   * @returns a joined string of study entities
   */
  private static gatherJoinedInlineFields(study: Study): string[] {
    const flattenedFieldPublicationTypes =
      study.fieldRightColumn.entity.fieldStudy?.entity?.fieldPublicationType
        .map(publication => publication.entity.entityLabel);
    return [
      this.joinArrayToString(study.fieldRightColumn.entity.fieldStudy?.entity?.fieldAuthor),
      this.joinArrayToString(study.fieldRightColumn.entity.fieldStudy?.entity?.fieldYear),
      this.joinArrayToString(flattenedFieldPublicationTypes),
    ];
  }

  private static gatherJoinedRightColumnDataFields(studyData: StudyPageFieldRightColumnDataEntity):
    MappedStudyPageFieldRightColumnStudyData {
    const flattenedFieldPublicationTypes = studyData.fieldPublicationType.map(type => type.entity.entityLabel);
    const flattenedFieldPublicationLanguages =
      studyData.fieldPublicationLang.map(publication => publication.entity.entityLabel);
    return {
      fieldAuthor: this.joinArrayToString(studyData?.fieldAuthor || []),
      fieldAuthorInstitution: this.joinArrayToString(studyData?.fieldAuthorInstitution || []),
      fieldPublicationLang: this.joinArrayToString(flattenedFieldPublicationLanguages || []),
      fieldYear: this.joinArrayToString(studyData?.fieldYear || []),
      fieldOrderer: this.joinArrayToString(studyData?.fieldOrderer || []),
      fieldPublisher: this.joinArrayToString(studyData?.fieldPublisher || []),
      fieldPublicationType: this.joinArrayToString(flattenedFieldPublicationTypes || []),
    };
  }

  /**
   *
   * @returns a year range of 25 years - current year + 25 years for year filters
   */
  private static generateYearRangeOptions(): YearOption[] {
    const emptyValue: YearOption = {key: '', value: 0};
    const yearValues: YearOption[] = [];
    const currentYear: number = new Date().getFullYear();
    for (let year = currentYear + 25; year >= currentYear - 25; year--) {
      yearValues.push({key: `${year}`, value: year});
    }
    return [...yearValues, emptyValue];
  }

  public static mapStudyListViewEntities(entities: Study[]): MappedStudy[] {
    return entities.map((study: Study) => {
      const mappedInlineFields = this.gatherJoinedInlineFields(study).filter((field: string) => field);
      return {
        ...study,
        mappedInlineFields,
      };
    });
  }

  public static flattenStudyListFilterOptions(filterResponse: StudyListViewFilterQueryResponse): MappedStudyFilters {
    return {
      publicationLanguageOptions: this.mapOptionTypesToFormItemOptions(
        filterResponse.data.publicationLanguageOptions.entities),
      publicationTypeOptions: this.mapOptionTypesToFormItemOptions(
        filterResponse.data.publicationTypeOptions.entities),
      studyLabelOptions: this.mapOptionTypesToFormItemOptions(
        filterResponse.data.studyLabelOptions.entities),
      studyTopicsOptions: this.mapOptionTypesToFormItemOptions(
        filterResponse.data.studyTopicsOptions.entities),
      yearRange: this.generateYearRangeOptions(),
    };
  }

  /**
   *
   * @param parameters - query parameters
   * @param offsetParameters extra list parameters for request
   * @returns formatted parameters for http request
   */
  public static generateStudyListViewRequestParameters(
    parameters: StudyListViewQueryParameters, offsetParameters: ListOffsetParameters):
    StudyListViewRequestParameters {
    return {
      titleValue: `%${parameters.tekstiOtsing}%`,
      titleEnabled: !!parameters.tekstiOtsing,
      studyTopicValue: parameters.teema?.split(';'),
      studyTopicEnabled: !!parameters.teema,
      publicationTypeValue: parameters.publikatsiooniLiik?.split(';'),
      publicationTypeEnabled: !!parameters.publikatsiooniLiik,
      publisherValue: parameters.valjaandja?.split(';').map((value) => `%${value}%`),
      publisherEnabled: !!parameters.valjaandja,
      publicationLanguageValue: parameters.publikatsiooniKeel?.split(';'),
      publicationLanguageEnabled: !!parameters.publikatsiooniKeel,
      studyLabelValue: parameters.sildid?.split(';'),
      studyLabelEnabled: !!parameters.sildid?.length,
      dateFrom: parameters.aastaAlates,
      dateFromEnabled: !!parameters.aastaAlates,
      dateTo: parameters.aastaKuni,
      dateToEnabled: !!parameters.aastaKuni,
      highlightedStudyEnabled: false,
      sortField: 'created',
      indicatorSort: false,
      sortDirection: SortDirection.DESC,
      nidEnabled: false,
      limit: offsetParameters?.limit,
      offset: offsetParameters?.offset,
      lang: getLangCode().toUpperCase(),
    };
  }

  /**
   *
   * @param list - current list
   * @param studyListResponseEntities - new request entities from next offset
   * @param loadMoreContent - list data received through loading more
   * @returns offset list response joined with current list
   */
  public static joinResponseWithPreviousValues(
    list: MappedStudy[], studyListResponseEntities: Study[], loadMoreContent?: boolean): MappedStudy[] {
    const mappedStudyListElements = StudyUtility.mapStudyListViewEntities(studyListResponseEntities);
    return loadMoreContent ?
      [...list, ...mappedStudyListElements] :
      mappedStudyListElements;
  }

  public static studyListMappedData(
    list: MappedStudy[], studyListResponseEntities: Study[], loadMoreContent?: boolean): StudyListMappedData {
    return this.listWithHighlight(
      this.joinResponseWithPreviousValues(list, studyListResponseEntities, loadMoreContent));
  }

  private static listWithHighlight(list: MappedStudy[]): StudyListMappedData {
    const highlight = this.extractRandomHighlightedStudy(list);
    return {
      highlight,
      list: highlight ? [highlight, ...list.filter(study => study !== highlight)] : list,
    };
  }

  static mapStudyDetailData(studyDetails: MappedStudyPage): MappedStudyPage {
    return {
      ...studyDetails,
      fieldStudyText: [
        ...studyDetails.fieldAddFile.map((addFile) => ({
          title: addFile.description,
          url: {
            path: addFile.entity.url,
            routed: false,
          },
        })),
        ...studyDetails.fieldStudyText,
      ],
    };
  }

  public static mapStudySidebarBlockData(sidebarData: StudyPageFieldRightColumn): MappedStudyPageFieldRightColumn {
    return {
      fieldLinks: sidebarData?.entity?.fieldAdditionalLinks?.entity?.fieldLinks,
      fieldStudy: this.gatherJoinedRightColumnDataFields(sidebarData?.entity?.fieldStudy?.entity),
    };
  }

  /**
   *
   * @param list
   * @returns a random selection from studies list where fieldCustomBoolean (highlight status) is truthy
   */
  private static extractRandomHighlightedStudy(list: MappedStudy[]): MappedStudy {
    const highlightedStudies = list.filter(study => study.fieldCustomBoolean);
    const selection: number = Math.floor(Math.random() * highlightedStudies.length);
    return highlightedStudies?.length ? highlightedStudies[selection] : null;
  }

}
