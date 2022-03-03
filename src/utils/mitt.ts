import mitt, { Emitter, EventType } from "mitt";
export class Mitt<T extends Record<EventType, unknown>> {
  constructor() {
    Object.assign(this, mitt<T>());
  }
}

export interface Mitt<T> extends Emitter<T> {}

export type MittEvent = Record<EventType, unknown>;
