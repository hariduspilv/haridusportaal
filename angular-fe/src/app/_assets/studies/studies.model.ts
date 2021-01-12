
export interface PersonalDetails {
  isikukood: string;
  synniKp: string;
  eesnimi: string;
  perenimi: string;
  elukohamaa?: string;
  rrElukoht: string;
  kodakondsus?: string;
  elamisluba?: string;
  oppelaenOigus: any[];
}

export interface Curriculum {
  klOppekava?: string;
  oppekavaKood: string;
  oppekavaNimetus: string;
  kvalifikatsiooniVastavus?: string;
  akadKraad?: string;
  kvalDokument?: string;
}

export interface StudyType {
  nimetus: string;
  algusKp: string;
  loppKp?: string;
}

export interface Studies {
  haridustase: string;
  id: string;
  oppeasutus: string;
  oppAlgus: string;
  oppLopp: string;
  nomLopp?: string;
  oppekava: Curriculum[];
  spetsilaiseerumine?: any;
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
  okVahetamine: any[];
  finAllikas: StudyType[];
  akadPuhkus: any[];
  ennistamine: any[];
  puudumised?: any;
  staatus: string;
  tunnistusDiplom?: string;
  kutseKoolitus?: any;
}

export interface StudiesValue {
  isikuandmed: PersonalDetails;
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