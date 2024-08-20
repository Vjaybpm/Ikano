// Import statements if necessary
// e.g., import { putIntoFromToMap } from './path-to-your-function';

import { putIntoFromToMap } from "./from.to.map";

type FromTo = {
  from: string;
  to: string;
}
describe ( 'putIntoFromToMap', () => {
  it ( 'correctly maps from->to relationships', () => {
    const items: FromTo[] = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'C' },
    ];

    const expected = {
      'A': {
        'B': { from: 'A', to: 'B' },
        'C': { from: 'A', to: 'C' },
      },
      'B': {
        'C': { from: 'B', to: 'C' },
      },
    };

    const result = putIntoFromToMap ( items, item => item.from, item => item.to );

    expect ( result ).toEqual ( expected );
  } );
} );
