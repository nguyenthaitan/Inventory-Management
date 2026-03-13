import { KafkaService } from './kafka.service';

// we don't actually import kafkajs here; we just mock the producer shape
const mockProducer = {
  send: jest.fn().mockResolvedValue([{ topicName: 'foo' }]),
  disconnect: jest.fn().mockResolvedValue(undefined),
};

describe('KafkaService', () => {
  let svc: KafkaService;

  beforeEach(() => {
    svc = new KafkaService(mockProducer as any);
    jest.clearAllMocks();
  });

  it('should send event objects as JSON', async () => {
    const event = { type: 'x', payload: { foo: 'bar' } };
    const result = await svc.publish('t', [{ value: event }]);
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 't',
      messages: [{ value: JSON.stringify(event) }],
    });
    expect(result).toEqual([{ topicName: 'foo' }]);
  });

  it('should handle multiple events and optional keys', async () => {
    const event1 = { type: 'a', payload: 1 };
    const event2 = { type: 'b', payload: 'x' };
    await svc.publish('t', [{ value: event1 }, { key: 'k', value: event2 }]);
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 't',
      messages: [
        { value: JSON.stringify(event1) },
        { key: 'k', value: JSON.stringify(event2) },
      ],
    });
  });

  it('disconnects on destroy', async () => {
    await svc.onModuleDestroy();
    expect(mockProducer.disconnect).toHaveBeenCalled();
  });
});
