import includes from 'lodash/includes';
import isNil from 'lodash/isNil';

import {
  IInputView, ISingleOptionValue, IMultiOptionValue, BaseInputView,
} from '../InputView';
import { HTMLHelper } from '../../../lib/view/HTMLHelper';
import { UID } from '../../../lib/UID';
import { InputConfigurator, InputHelper } from './InputHelper';
import { IFieldOptionModel, IChoiceFieldModel } from '../../model/FieldModel';

export enum ChoiceInputType {
  Single = 'radio',
  Multiple = 'checkbox',
}

export interface IOptionInputData {
  readonly uid: string;
  readonly value: string;
}

export interface IOptionLabelData {
  readonly uid: string;
  readonly label: string;
}

export const ChoiceInputRenderer = {
  isDefault(fieldM: IChoiceFieldModel, value: string): boolean {
    const { defaultValue, multiple } = fieldM.config;

    return !isNil(defaultValue)
      && (
        multiple
          ? includes(defaultValue, value)
          : defaultValue === value
      );
  },

  renderOptionInput(fieldM: IChoiceFieldModel, inputV: ChoiceInputView,
    inputData: IOptionInputData): HTMLInputElement {
    const { multiple } = fieldM.config;

    const inputType = multiple ? ChoiceInputType.Multiple : ChoiceInputType.Single;
    const node = document.createElement('input');
    node.type = inputType;

    node.id = inputData.uid;
    node.name = fieldM.id;
    node.value = inputData.value;

    if (this.isDefault(fieldM, inputData.value)) {
      node.setAttribute('checked', 'checked');
    }

    InputConfigurator.addListeners(node, inputV);

    return node;
  },

  renderOptionLabel(uid: string, label: string): HTMLLabelElement {
    const elem = document.createElement('label');
    elem.setAttribute('for', uid);

    const span = document.createElement('span');
    span.textContent = label;

    elem.appendChild(span);

    return elem;
  },

  renderOption(fieldM: IChoiceFieldModel, inputV: ChoiceInputView,
    option: IFieldOptionModel): HTMLDivElement {
    const elem = document.createElement('div');
    elem.classList.add('af-choice-option');

    const uid = UID.create();

    const inputData = { uid, value: option.value };
    const inputE = this.renderOptionInput(fieldM, inputV, inputData);
    elem.appendChild(inputE);

    const labelE = this.renderOptionLabel(uid, option.label);
    elem.appendChild(labelE);

    return elem;
  },

  renderAllOptions(fieldM: IChoiceFieldModel,
    inputV: ChoiceInputView): HTMLDivElement[] {
    const { options } = fieldM.config;

    const renderFn = this.renderOption.bind(this, fieldM, inputV);
    const optionsE = options.map(renderFn);

    return optionsE;
  },

  renderRoot(fieldM: IChoiceFieldModel, inputV: ChoiceInputView): HTMLDivElement {
    const { multiple } = fieldM.config;

    const root = document.createElement('div');
    root.className = multiple ? 'af-choice-multiple' : 'af-choice';

    const options = this.renderAllOptions(fieldM, inputV);
    options.forEach(HTMLHelper.appendChild(root));

    return root;
  },
};

export type IChoiceInputValue = ISingleOptionValue | IMultiOptionValue;

export type IChoiceInputView = IInputView;

export class ChoiceInputView extends BaseInputView implements IChoiceInputView {
  protected readonly multiple: boolean;

  protected readonly rootE: HTMLDivElement;

  protected readonly optionsE: HTMLInputElement[];

  protected constructor(fieldM: IChoiceFieldModel) {
    super();
    this.multiple = fieldM.config.multiple;
    this.rootE = ChoiceInputRenderer.renderRoot(fieldM, this);
    this.optionsE = Array.from(this.rootE.querySelectorAll('input'));
  }

  public static create(fieldM: IChoiceFieldModel): ChoiceInputView {
    return new this(fieldM);
  }

  public getFirstChoice(): ISingleOptionValue {
    const checked = this.optionsE.find(InputHelper.isChecked);
    return checked ? checked.value : undefined;
  }

  public getAllChoices(): IMultiOptionValue {
    const checked = this.optionsE.filter(InputHelper.isChecked);
    return checked.map(InputHelper.getValue);
  }

  public getValue(): IChoiceInputValue {
    return this.multiple ? this.getAllChoices() : this.getFirstChoice();
  }

  public setValue(): void { // eslint-disable-line class-methods-use-this
    throw new Error('Not supported yet');
  }

  public reset(): void {
    this.optionsE.forEach(InputHelper.resetCheck);
  }

  public block(): void {
    this.optionsE.forEach((o) => o.disabled = true);
  }

  public unblock(): void {
    this.optionsE.forEach((o) => o.disabled = false);
  }

  public render(): HTMLDivElement {
    return this.rootE;
  }
}
