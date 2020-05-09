/**
 * @format
 */

import 'react-native';
import fetch from 'node-fetch';
import React from 'react';
import Home from '../app/Home';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import bookInfo, { sequence } from '../app/bibleRef';
import { getRandomInt } from '../app/helpers';

jest.setTimeout(120000);

// describe('Test endpoint for bible files', () => {
//   it('should be true', async () => {
//     // const rootURL = 'https://raw.githubusercontent.com/moulie415/WordOfGodForEachDay/master/files/';
//     // for (let i = 0; i < 66; i++) {
//     //   const bibleUrl = `${rootURL}bible/${sequence[i]}/${bookInfo[sequence[i]].length}.mp3`;
//     //   const request = await fetch(bibleUrl);
//     //   if (request.status !== 200) {
//     //     console.log(bibleUrl);
//     //   }
//     //   expect(request.status).toEqual(200);
//     // }
//   // });
// });

describe('Test random number helper function', () => {
  it('should be true', () => {
    for (let i = 0; i < 50; i++) {
      const random = getRandomInt(1, 5);
      expect(random).toBeLessThan(6);
      expect(random).toBeGreaterThan(0);
    }
  });
});
