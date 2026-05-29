export enum Status {
  Idle = 'idle',
  Loading = 'loading',
  Updating = 'updating',
  Resolved = 'resolved',
  Canceled = 'canceled',
  Error = 'error',
}

export enum ErrorType {}

export type FullStatus =
  | {
      status: Exclude<Status, Status.Error>;
    }
  | {
      status: Status.Error;
      error: ErrorType;
      errorMessage: string;
    };

export interface ItemState<T> {
  data: T | null;
  status: FullStatus;
  addedAt: Date | null;
}
