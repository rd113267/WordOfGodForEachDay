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

jest.setTimeout(30000);

describe('Test endpoint for bible files', () => {
  it('should be true', async () => {
    //expect(true).toEqual(true);
    const rootURL = 'https://raw.githubusercontent.com/moulie415/WordOfGodForEachDay/master/files/';
    for (let i = 0; i < 66; i++) {
      const bibleUrl = `${rootURL}bible/${sequence[i]}/${bookInfo[sequence[i]].length}.mp3`;
      // console.log(bibleUrl);
      const request = await fetch(bibleUrl);
      expect(request.status).toEqual(200);
    }
  });
});
