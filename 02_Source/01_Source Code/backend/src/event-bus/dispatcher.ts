export interface Event {
  type: string;
  payload: any;
}

export interface Handler {
  supports(type: string): boolean;
  handle(payload: any): Promise<void>;
}

export class Dispatcher {
  private handlers: Handler[] = [];

  register(handler: Handler) {
    this.handlers.push(handler);
  }

  async dispatch(evt: Event) {
    for (const h of this.handlers) {
      if (h.supports(evt.type)) {
        await h.handle(evt.payload);
      }
    }
  }
}
