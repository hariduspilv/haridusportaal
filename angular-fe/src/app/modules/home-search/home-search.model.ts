export interface HomeSearch {
  data: {
    CustomElasticQuery: [{
      count: number;
      entities: HomeSearchResult[];
    }];
  };
}

export interface MappedHomeSearch {
  count: number;
  entities: HomeSearchResult[];
  types: Record<string, HomeSearchType>;
}

export interface HomeSearchAutocomplete {
  data: {
    CustomElasticAutocompleteQuery: [{
      Suggestion: string;
    }];
  };
}

export interface HomeSearchResult {
  ContentType: HomeSearchContentType;
  EntityPath: string;
  FieldDuration: string;
  FieldSchoolName: string;
  FieldStudyProgrammeLevel: string;
  Nid: string;
  Title: string;
}

export interface HomeSearchParameters {
  search_term: string;
  lang?: string;
}

export interface HomeSearchType {
  name: string;
  value: boolean;
  sum: number;
}

export enum HomeSearchContentType {
  news = 'news',
  article = 'article',
  event = 'event',
  school = 'school',
  studyprogramme = 'studyprogramme',
  oska_result_page = 'oska_result_page',
  oska_survey_page = 'oska_survey_page',
  oska_main_profession_page = 'oska_main_profession_page',
  oska_field_page = 'oska_field_page',
  oska = 'oska',
}
