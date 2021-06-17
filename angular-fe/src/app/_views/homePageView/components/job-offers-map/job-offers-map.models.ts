export interface TootukassaJobOffer {
  FieldName: string;
  FieldJobTime: string[];
  FieldOfferedBy: string;
  FieldAddress: string;
  FieldDate: number;
  FieldURL: string;
  FieldAddressADRID: string;
  Lat: number;
  Lon: number;
}

export interface JobOfferSingleDto {
  title: string;
  fieldAdrid: string;
  fieldDate: number;
  fieldIdNumber: string;
  fieldInstitution: string;
  fieldTime: {
    entity: {
      fieldAtNight: boolean;
      fieldFullTime: boolean;
      fieldInShifts: boolean;
      fieldPartTime: boolean;
    }
  };
  fieldLocation: {
    entity: {
      fieldAddress: string;
      fieldLat: string;
      fieldLong: string
    };
  };
  fieldWebpageLink: {
    uri: string;
  }[];
}

export interface JobOffersDto {
  data: {
    nodeQuery: {
      count: number;
      entities: JobOfferSingleDto[];
    }
  }
}
