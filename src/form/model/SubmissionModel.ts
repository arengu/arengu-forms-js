import { IMetaDataModel } from './MetaDataModel';
import { IFieldValue } from '../../field/model/FieldModel';
import { IHiddenFieldValue } from '../HiddenFields';

export interface IUserValues {
  [key: string]: IFieldValue;
}

export interface IFormData {
  readonly [key: string]: IFieldValue | IHiddenFieldValue;
}

export interface ISubmissionModel {
  readonly formData: IFormData;
  readonly metaData: IMetaDataModel;
}
