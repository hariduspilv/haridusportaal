
export interface OppelaenOigus {
  oigus: string;
  pohjus: string[];
}

export interface PersonalDetails {
  isikukood: string;
  synniKp: string;
  eesnimi: string;
  perenimi: string;
  elukohamaa?: string;
  rrElukoht: string;
  kodakondsus?: string;
  elamisluba?: string;
  oppelaenOigus: OppelaenOigus;
}

export interface Curriculum {
  klOppekava?: string;
  oppekavaKood: string;
  oppekavaNimetus: string;
  kvalifikatsiooniVastavus?: string;
  akadKraad?: string;
  kvalDokument?: string;
  kestus?: string;
}

export interface StudyType {
  nimetus: string;
  algusKp: string;
  loppKp?: string;
}

export interface CurriculumChange {
  oppekava: string;
  algusKp: string;
  loppKp: string;
}

export interface Studies {
  haridustase: string;
  id: string;
  oppeasutus: string;
  oppAlgus: string;
  oppLopp: string;
  nomLopp?: string;
  oppekava: Curriculum[];
  'spetsilaiseerumine '?: string;
  oppekeel?: string;
  opeklass: string;
  opeParallel?: string;
  klassiLiik?: string;
  klassAste?: string;
  oppevorm: StudyType[];
  koormus: StudyType[];
  kestus: string;
  oppekavataitine: any[];
  ryhmaLiik?: string;
  nimetus?: string;
  koht?: string;
  okVahetamine: CurriculumChange[];
  finAllikas: StudyType[];
  akadPuhkus: any[];
  ennistamine: any[];
  puudumised?: any;
  staatus: string;
  tunnistusDiplom?: string;
  kutseKoolitus?: any;
}

export interface ExternalQualifications {
  oppeasutuseNimiMuusKeeles?: string;
  oppeasutuseNimiTranslit?: string;
  riik?: string;
  oppekavaNimetusOrig?: string;
  oppekavaNimetusEesti?: string;
  oppekavaNominKestus?: string;
  lisaKval?: string;
  dokument?: string;
  kvalVastavus?: string;
  kvalNimetusOrig?: string;
  eqfTase?: string;
  iscedTase?: string;
  valjaandmKp?: string;
  dokumendiNumber?: string;
  enicNaricHinnanguKp?: string;
  enicNaricHinnanguNumber?: string;
  kommentaar?: string;
}

export interface StudiesValue {
  isikuandmed: PersonalDetails;
  valineKvalifikatsioon: ExternalQualifications[];
  oping: Studies[];
}

export interface StudiesError {
  message_text: {
    [key: string]: string
  };
}

export interface StudiesResponse {
  error?: StudiesError;
  value?: StudiesValue;
}