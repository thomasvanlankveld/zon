import foo from './index';

describe('index', () => {
  it('exports foo', () => {
    expect.hasAssertions();

    expect(foo).toStrictEqual('foo');
  });
});
