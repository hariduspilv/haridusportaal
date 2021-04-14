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

  private static extractYearFromDateString(date: string) {
    return date?.split('.').pop();
  }

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
      dateFrom: this.extractYearFromDateString(parameters.aastaAlates),
      dateFromEnabled: !!parameters.aastaAlates,
      dateTo: this.extractYearFromDateString(parameters.aastaKuni),
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

  // public static generateStudyList(
  //   list: MappedStudy[], studyListResponseEntities: Study[], loadMoreContent?: boolean):
  //   { list: MappedStudy[]; highlight: MappedStudy } {
  //     const joinedList = this.joinResponseWithPreviousValues(list, studyListResponseEntities, loadMoreContent);
  //     const highlight = this.extractRandomHighlightedStudy(joinedList);
  //     return {
  //       highlight,
  //       list: joinedList.filter(study => study !== highlight),
  //     };
  // }
  public static joinResponseWithPreviousValues(
    list: MappedStudy[], studyListResponseEntities: Study[], loadMoreContent?: boolean): MappedStudy[] {
    const mappedStudyListElements = StudyUtility.mapStudyListViewEntities(studyListResponseEntities);
    return loadMoreContent ?
      [...list, ...mappedStudyListElements] :
      mappedStudyListElements;
  }

  public static extractRandomHighlightedStudy(list: MappedStudy[]): MappedStudy {
    const highlightedStudies = list.filter(study => study.fieldStudyTag);
    const selection: number = Math.floor(Math.random() * highlightedStudies.length);
    return highlightedStudies?.length ? highlightedStudies[selection] : null;
  }

}
