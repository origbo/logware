/**
 * Basic Test
 * This file contains simple tests that don't depend on any external services
 */

describe('Basic functionality', () => {
  test('Simple addition', () => {
    expect(1 + 1).toBe(2);
  });

  test('String concatenation', () => {
    expect('hello ' + 'world').toBe('hello world');
  });

  test('Array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6]);
  });
});

describe('Async functionality', () => {
  test('Promise resolves correctly', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  test('setTimeout works correctly', (done) => {
    let value = 0;
    
    setTimeout(() => {
      value = 42;
      expect(value).toBe(42);
      done();
    }, 100);
  });
});
