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

  it('should send string messages unchanged', async () => {
    const result = await svc.publish('t', [{ value: 'hello' }]);
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 't',
      messages: [{ value: 'hello' }],
    });
    expect(result).toEqual([{ topicName: 'foo' }]);
  });

  it('should stringify non-string values', async () => {
    await svc.publish('t', [{ value: { a: 1 } }]);
    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: 't',
      messages: [{ value: JSON.stringify({ a: 1 }) }],
    });
  });

  it('disconnects on destroy', async () => {
    await svc.onModuleDestroy();
    expect(mockProducer.disconnect).toHaveBeenCalled();
  });
});
