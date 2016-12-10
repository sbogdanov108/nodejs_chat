const expect = require('expect');
const {isRealString} = require('./../utils/validation');

describe('isRealString', () => {
  it('should reject non-string values', () => {
    var res = isRealString(111);

    expect(res).toBe(false);
  });

  it('should reject string with only spaces', () => {
    var res = isRealString('          ');

    expect(res).toBe(false);
  });

  it('should allow string with non-space characters', () => {
    var res = isRealString('   some string   ');

    expect(res).toBe(true);
  });
});