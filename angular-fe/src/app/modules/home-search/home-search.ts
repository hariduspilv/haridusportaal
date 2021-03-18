import { BreadcrumbsItem } from '@app/_assets/breadcrumbs';
import { HomeSearch, HomeSearchContentType, HomeSearchResult, HomeSearchType, MappedHomeSearch } from './home-search.model';

export class HomeSearchUtility {
  public static mergeHomeSearchContentTypesAndCollectCounts(results: HomeSearch, types: string[],
                                                            contentTypes: Record<string, HomeSearchType>): MappedHomeSearch {
    const mappedResults: HomeSearchResult[] = results.data.CustomElasticQuery[0].entities.map((elem: HomeSearchResult) => {
      if (types.includes(elem.ContentType)) elem.ContentType = HomeSearchContentType.oska;
      if (contentTypes[elem.ContentType]) contentTypes[elem.ContentType].sum += 1;
      return elem;
    });
    return { entities: mappedResults, count: results.data.CustomElasticQuery[0].count, types: contentTypes };
  }

  public static constructCrumbs(searchTerm: string) {
    const breadcrumbs: BreadcrumbsItem[] = [
      {
        title: 'Avaleht',
        link: '/',
      },
    ];
    if (searchTerm) {
      breadcrumbs.push({
        title: `Otsingu "${searchTerm}" tulemused`,
      });
    } else {
      breadcrumbs.push({
        title: 'Otsing',
      });
    }
    return breadcrumbs;
  }

  public static updateParams(currentParams: Record<string, string | string[]>,
                             key: string, param: string | string[]): Record<string, string | string[]> {
    return Object.assign({}, { ...currentParams, [key]: param });
  }
}
