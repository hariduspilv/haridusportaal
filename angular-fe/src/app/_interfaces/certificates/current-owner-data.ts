export interface CurrentOwnerData {
  firstName: string;
  idCode: string;
  lastName: string;
}

export interface FormattedCurrentOwnerData extends CurrentOwnerData {
  firstName: string;
  idCode: string;
  lastName: string;
  isNewIdCode: boolean;
  isNewFirstName: boolean;
  isNewLastName: boolean;
}
