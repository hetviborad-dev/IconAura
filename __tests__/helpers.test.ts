import { getContrastColor, formatAppName } from '../src/utils/helpers';

describe('helpers', () => {
  it('returns black for light backgrounds', () => {
    expect(getContrastColor('#FFFFFF')).toBe('#000000');
  });

  it('returns white for dark backgrounds', () => {
    expect(getContrastColor('#000000')).toBe('#FFFFFF');
  });

  it('capitalizes app names', () => {
    expect(formatAppName('iconaura')).toBe('Iconaura');
  });
});

describe('getCloudinaryImageUrl', () => {
  it('inserts transforms', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    expect(require('../src/utils/helpers').getCloudinaryImageUrl(url, 100, 50)).toContain('/upload/c_fill,w_100,h_50,q_auto,f_auto/');
  });
});
