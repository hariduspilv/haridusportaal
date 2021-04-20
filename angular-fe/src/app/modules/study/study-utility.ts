import { FormItemOption } from '@app/_assets/formItem';
import { SortDirection } from '@app/_core/models/enums/sort-direction.enum';
import { Language } from '@app/_core/models/interfaces/language.enum';
import { Entity } from '@app/_core/models/interfaces/main';
import { ListOffsetParameters } from '@app/_core/models/list-offset-parameters';
import { MappedStudy } from './models/mapped-study';
import { MappedStudyFilters } from './models/mapped-study-filters';
import { Study } from './models/study';
import { StudyListViewFilterQueryResponse } from './models/study-list-view-filter-query-response';
import { StudyListViewQueryParameters } from './models/study-list-view-query-parameters';
import { StudyListViewRequestParameters } from './models/study-list-view-request-parameters';
import { YearOption } from './models/year-option';

export class StudyUtility {

  private static joinArrayToString(elements: (string | number)[]): string {
    return elements.join(', ');
  }

  private static mapOptionTypesToFormItemOptions(options: Entity[]): FormItemOption[] {
    return options.map(entity => ({ key: entity.entityLabel, value: entity.entityId }));
  }

  /**
   *
   * @param study - a single study list item
   * @returns a joined string of study entities
   */
  private static gatherJoinedInlineFields(study: Study): string[] {
    const flattenedFieldPublicationTypes =
        study.fieldRightColumn.entity.fieldStudy.entity.fieldPublicationType
          .map(publication => publication.entity.entityLabel);
    return [
      this.joinArrayToString(study.fieldRightColumn.entity.fieldStudy.entity.fieldAuthor),
      this.joinArrayToString(study.fieldRightColumn.entity.fieldStudy.entity.fieldYear),
      this.joinArrayToString(flattenedFieldPublicationTypes),
    ];
  }

  /**
   *
   * @returns a year range of 25 years - current year + 25 years for year filters
   */
  private static generateYearRangeOptions(): YearOption[] {
    const emptyValue: YearOption = { key: '', value: 0 };
    const yearValues: YearOption[] = [];
    const currentYear: number = new Date().getFullYear();
    for (let year = currentYear + 25; year >= currentYear - 25; year--) {
      yearValues.push({ key: `${year}`, value: year });
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
      publisherValue: parameters.valjaandja?.split(';'),
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
      lang: Language.et,
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

  /**
   *
   * @param list
   * @returns a random selection from studies list where fieldCustomBoolean (highlight status) is truthy
   */
  public static extractRandomHighlightedStudy(list: MappedStudy[]): MappedStudy {
    const highlightedStudies = list.filter(study => study.fieldCustomBoolean);
    const selection: number = Math.floor(Math.random() * highlightedStudies.length);
    return highlightedStudies?.length ? highlightedStudies[selection] : null;
  }

}
