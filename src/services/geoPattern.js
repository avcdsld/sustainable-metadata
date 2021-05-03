import GeoPattern from 'geopattern';

class GeoPatternService {
  generateSvgUri(str) {
    const generator = this.getRandomGenerator(str);
    return GeoPattern.generate(str, { generator }).toDataUri();
  }

  getRandomGenerator(str) {
    // https://github.com/btmills/geopattern/blob/master/tests/test.js
    const generators = [
      'concentricCircles',
      'diamonds',
      'hexagons',
      'mosaicSquares',
      'nestedSquares',
      'octogons',
      'overlappingCircles',
      'overlappingRings',
      'plaid',
      'plusSigns',
      'sineWaves',
      'squares',
      'tessellation',
      'triangles',
      'xes',
    ];
    const max = generators.length;
    const num = Array.from(str).reduce((prev, current) => prev + current.charCodeAt(), 0);
    const generatorNum = Math.floor(num % max + 1);
    return generators[generatorNum];
  }
}

const geoPattern = new GeoPatternService();

export { geoPattern };
