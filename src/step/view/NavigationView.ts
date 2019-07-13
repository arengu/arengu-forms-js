import { IStepButtonsModel } from '../model/StepModel';

import { NextButton } from '../part/NextButton';
import { PreviousButton } from '../part/PreviousButton';
import { IButtonCallback } from '../../lib/view/GenericButton';
import { IHTMLView } from '../../base/view/HTMLView';

export abstract class NavigationHelper {
  public static createButtonCallback(listener: INavigationListener): IButtonCallback {
    return function callback(this: void): void {
      listener.onGoToPreviousStep();
    };
  }
}

export interface INavigationListener {
  onGoToPreviousStep(this: this): void;
}

export class NavigationView implements IHTMLView {
  protected readonly previousV: null | PreviousButton;

  protected readonly nextV: NextButton;

  protected rootE: null | HTMLElement;

  protected constructor(buttons: IStepButtonsModel, listener: INavigationListener) {
    this.previousV = buttons.previous !== null
      ? PreviousButton.create(buttons.previous, NavigationHelper.createButtonCallback(listener))
      : null;
    this.nextV = NextButton.create(buttons.next);
    this.rootE = null;
  }

  public static create(buttons: IStepButtonsModel, listener: INavigationListener): NavigationView {
    return new NavigationView(buttons, listener);
  }

  public render(): HTMLElement {
    if (this.rootE !== null) {
      return this.rootE;
    }

    const container = document.createElement('div');
    container.classList.add('af-step-navigation');

    if (this.previousV !== null) {
      const previousE = this.previousV.render();
      container.appendChild(previousE);
    }

    const nextE = this.nextV.render();
    container.appendChild(nextE);

    this.rootE = container;
    return this.rootE;
  }

  public reset(): void {
    this.nextV.reset();
  }

  public enableNext(): void {
    this.nextV.enable();
  }

  public disableNext(): void {
    this.nextV.disable();
  }

  public showLoading(): void {
    this.nextV.showLoading();
  }

  public hideLoading(): void {
    this.nextV.hideLoading();
  }
}
