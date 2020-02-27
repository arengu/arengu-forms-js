let counter = 400;

export const PREFIX = 'af-uid';

// TODO: check we are generating and using UIDs properly on rendering

export abstract class UID {
  public static create(): string {
    counter += 1;
    return `${PREFIX}-${counter}`;
  }
}
