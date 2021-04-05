import { FormItemOption } from '@app/_assets/formItem';
import { SortDirection } from '@app/_core/models/enums/sort-direction.enum';
import { Language } from '@app/_core/models/interfaces/language.enum';
import { Entity } from '@app/_core/models/interfaces/main';
import { MappedStudy } from './models/mapped-study';
import { MappedStudyFilters } from './models/mapped-study-filters';
import { Study } from './models/study';
import { StudyListViewFilterQueryResponse } from './models/study-list-view-filter-query-response';
import { StudyListViewQueryParameters } from './models/study-list-view-query-parameters';
import { StudyListViewRequestParameters } from './models/study-list-view-request-parameters';

export class StudyUtility {

  private static joinArrayToString(elements: (string | number)[]): string {
    return elements.join(', ');
  }

  private static mapOptionTypesToFormItemOptions(options: Entity[]): FormItemOption[] {
    return options.map(entity => ({ key: entity.entityLabel, value: entity.entityId }));
  }

  private static extractYearFromDateString(date: string) {
    return date?.split('.').pop();
  };

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
    };
  };

  public static generateStudyListViewRequestParameters(parameters: StudyListViewQueryParameters):
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
      dateFrom: this.extractYearFromDateString(parameters.alates),
      dateFromEnabled: !!parameters.alates,
      dateTo: this.extractYearFromDateString(parameters.kuni),
      dateToEnabled: !!parameters.kuni,
      highlightedStudyEnabled: false,
      sortField: 'created',
      indicatorSort: false,
      sortDirection: SortDirection.DESC,
      nidEnabled: false,
      limit: 24,
      offset: 0,
      lang: Language.et,
    };
  };


}
