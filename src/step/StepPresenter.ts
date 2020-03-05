import keyBy from 'lodash/keyBy';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

import { InvalidFields, FieldError } from '../error/InvalidFields';

import { ValidateFields, IStepValidationResult } from './interactor/StepValidator';

import { Messages } from '../lib/Messages';

import { IStepModel } from './model/StepModel';
import { IFieldModel, IFieldValue } from '../field/model/FieldModel';
import { IFieldPresenter } from '../field/presenter/presenter/FieldPresenter';
import { IStepView, StepView } from './view/StepView';
import { AppErrorCode } from '../error/ErrorCodes';
import { ArenguError } from '../error/ArenguError';
import { IUserValues, IFormData } from '../form/model/SubmissionModel';
import { IComponentModel } from '../component/ComponentModel';
import { ComponentHelper } from '../component/ComponentHelper';
import { NextButtonPresenter, INextButtonPresenter } from '../block/navigation/next/NextButtonPresenter';
import { IFormDeps } from '../form/FormPresenter';
import { ComponentPresenter, IComponentPresenterListener, IComponentPresenter } from '../component/ComponentPresenter';
import { ISocialFieldPresenter } from '../field/presenter/presenter/SocialFieldPresenter';
import { IPresenter } from '../core/BaseTypes';

export interface IStepPresenterListener {
  onGotoPreviousStep?(this: this, stepP: IStepPresenter): void;
  onSocialLogin?(this: this, stepP: IStepPresenter, compP: ISocialFieldPresenter): void;
}

export interface IStepPresenter extends IPresenter {
  getStepId(): string;

  showLoading(this: this): void;
  hideLoading(this: this): void;

  blockComponents(this: this): void;
  unblockComponents(this: this): void;

  onShow(this: this): void;
  onHide(this: this): void;

  isDynamic(this: this): boolean;
  updateStep(this: this, data: IFormData): void;

  hasFlow(this: this): boolean;
  validate(this: this): Promise<IStepValidationResult>;
  getUserValues(this: this): Promise<IUserValues>;

  setError(msg: string): void;
  clearError(): void;

  handleAnyError(this: this, err: Error): void;
}

export interface IPairFieldIdValue {
  readonly fieldId: string;
  readonly value: IFieldValue;
}

export interface IFieldPresenterCreator {
  (fieldM: IFieldModel): IFieldPresenter;
}

export interface IComponentCreator {
  (compM: IComponentModel): IComponentPresenter;
}

export const StepPresenterHelper = {
  async getValue(fieldP: IFieldPresenter): Promise<IPairFieldIdValue> {
    return {
      fieldId: fieldP.getFieldId(),
      value: await fieldP.getValue(),
    };
  },

  hasValue(pair: IPairFieldIdValue): boolean {
    return !isNil(pair.value) && !isEmpty(pair.value);
  },
}

export class StepPresenter implements IStepPresenter, IComponentPresenterListener {
  protected readonly stepM: IStepModel;
  protected readonly messages: Messages

  protected readonly compsP: IComponentPresenter[];

  protected readonly invalidFields: Set<string>;
  protected readonly fieldsP: IFieldPresenter[];
  protected readonly dynFieldsP: IFieldPresenter[];
  protected readonly fieldsPI: Record<string, IFieldPresenter>; // indexed by fieldId

  protected readonly nextsP: INextButtonPresenter[];

  protected readonly stepV: IStepView;
  protected readonly stepL: IStepPresenterListener;

  protected socialP?: ISocialFieldPresenter;

  protected constructor(stepM: IStepModel, formD: IFormDeps, stepL: IStepPresenterListener) {
    this.stepM = stepM;
    this.messages = formD.messages;

    this.compsP = stepM.components.map((cM) => ComponentPresenter.create(formD, cM));
    this.compsP.forEach((cP) => cP.listen(this));

    this.invalidFields = new Set();
    this.fieldsP = this.compsP.filter(ComponentHelper.isFieldPresenter);
    this.dynFieldsP = this.fieldsP.filter((fP): boolean => fP.isDynamic());
    this.fieldsPI = keyBy(this.fieldsP, (fP) => fP.getFieldId());


    this.nextsP = this.compsP.filter(NextButtonPresenter.matches);

    const compsE = this.compsP.map((cP) => cP.render());
    this.stepV = StepView.create(stepM, compsE);
    this.stepL = stepL;
  }

  public static create(stepM: IStepModel, formD: IFormDeps, stepL: IStepPresenterListener): IStepPresenter {
    return new StepPresenter(stepM, formD, stepL);
  }

  public getStepId(): string {
    return this.stepM.id;
  }

  public getFieldPresenter(fieldId: string): IFieldPresenter {
    const fieldP = this.fieldsPI[fieldId];

    if (isNil(fieldP)) {
      throw new Error('Field not found');
    }

    return fieldP;
  }

  public render(): HTMLElement {
    return this.stepV.render();
  }

  public isDynamic(this: this): boolean {
    return this.dynFieldsP.length > 0;
  }

  public updateStep(this: this, data: IFormData): void {
    this.dynFieldsP.forEach((sP): void => sP.updateField(data));
  }

  public hasFlow(this: this): boolean {
    return this.stepM.onNext;
  }

  public getActiveFields(): IFieldPresenter[] {
    return this.socialP ? [this.socialP] : this.fieldsP;
  }

  public async validate(): Promise<IStepValidationResult> {
    const fieldsP = this.getActiveFields();

    return ValidateFields.execute(fieldsP);
  }

  /**
   * Returns a map with all the data provided by the user in this step
   */
  public async getUserValues(): Promise<IUserValues> {
    const indexedValues: IUserValues = {};

    const fieldsP = this.getActiveFields();

    const proms = fieldsP.map((fP) => StepPresenterHelper.getValue(fP));

    const allValues = await Promise.all(proms);
    const validValues = allValues.filter((v) => StepPresenterHelper.hasValue(v));

    validValues.forEach((pair): void => {
      indexedValues[pair.fieldId] = pair.value;
    });

    return indexedValues;
  }

  public showLoading(): void {
    this.nextsP.forEach((nP) => nP.showLoading());
  }

  public hideLoading(): void {
    this.nextsP.forEach((nP) => nP.hideLoading());
  }

  public unblockComponents(): void {
    this.compsP.forEach((cP) => cP.unblock && cP.unblock());
  }

  public blockComponents(): void {
    this.compsP.forEach((cP) => cP.block && cP.block());
  }

  public onShow(): void {
    this.socialP = undefined;
    this.compsP.forEach((cP) => cP.onShow && cP.onShow());
  }

  public onHide(): void {
    this.clearError();
    this.compsP.forEach((cP) => cP.onHide && cP.onHide());
  }

  public handleFieldError(err: FieldError): void {
    const { fieldId } = err;

    const fieldP = this.getFieldPresenter(fieldId);
    fieldP.handleFieldError(err);
  }

  public handleInvalidFields(err: InvalidFields): void {
    return err.fields.forEach((fE) => this.handleFieldError(fE));
  }

  public handleFieldErrors(errs: FieldError[]): void {
    return errs.forEach((fE) => this.handleFieldError(fE));
  }

  public handleArenguError(err: ArenguError): void {
    const msg = this.messages.fromError(err);
    this.setError(msg);
  }

  public handleAnyError(err: Error): void {
    if (err instanceof InvalidFields) {
      this.handleInvalidFields(err);
    } else if (err instanceof ArenguError) {
      this.handleArenguError(err);
    } else {
      this.setError(err.message);
    }
  }

  public reset(): void {
    this.compsP.forEach((cP) => cP.reset());
    // TODO: call errorView.reset directly
  }

  public hasInvalidFields(): boolean {
    return this.invalidFields.size > 0;
  }

  public setError(msg: string): void {
    this.stepV.setError(msg);
  }

  public clearError(): void {
    this.stepV.clearError();
  }

  protected notifyInvalidFields(): void {
    const code = AppErrorCode.INVALID_INPUT;
    const msg = this.messages.fromCode(code);
    this.setError(msg);
  }

  public onInvalidField(error: FieldError, message: string, fieldP: IFieldPresenter): void {
    const fieldId = fieldP.getFieldId();

    if (!this.hasInvalidFields()) {
      this.notifyInvalidFields();
    }

    this.invalidFields.add(fieldId);
  }

  public onValidField(fieldP: IFieldPresenter): void {
    const fieldId = fieldP.getFieldId();

    this.invalidFields.delete(fieldId);

    if (!this.hasInvalidFields()) {
      this.clearError();
    }
  }

  public onGoToPrevious(): void {
    this.stepL.onGotoPreviousStep && this.stepL.onGotoPreviousStep(this);
  }

  public onSocialLogin(fieldP: ISocialFieldPresenter): void {
    this.socialP = fieldP;
    this.stepL.onSocialLogin && this.stepL.onSocialLogin(this, fieldP);
  }
}
