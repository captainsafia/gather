import { expect } from 'chai';
import { parse } from '../analysis/parse/python/python-parser';
import { LocationSet, slice } from '../analysis/slice/slice';

describe('slices', () => {
  it('statements including the def and use', () => {
    let ast = parse(['a = 1', 'b = a', ''].join('\n'));
    let locations = slice(
      ast,
      new LocationSet({
        first_line: 2,
        first_column: 0,
        last_line: 2,
        last_column: 5,
      })
    );
    expect(locations.items).to.deep.include({
      first_line: 1,
      first_column: 0,
      last_line: 1,
      last_column: 5,
    });
  });

  it('statements including the def and use for funcdefs', () => {
    let ast = parse([
      'def foo():',
      '    print("hi")',
      'a = 1',
      'foo()',
      ''
    ].join('\n'));
    let locations = slice(
      ast,
      new LocationSet({
        first_line: 4, 
        first_column: 0,
        last_line: 4,
        last_column: 5
      })
    );

    // Expect locations.items to contain the location for def foo()
    expect(locations.items).to.deep.include({
      first_line: 1,
      first_column: 0,
      last_line: 2, // Instead this is 3
      last_column: 15 // Instead this is 0
    });
  })

  it('statements including the def and use for class defs', () => {
    let ast = parse([
      'class Foo():',
      '    pass',
      'a = 1',
      'Foo()',
      ''
    ].join('\n'));
    let locations = slice(
      ast,
      new LocationSet({
        first_line: 4, 
        first_column: 0,
        last_line: 4,
        last_column: 5
      })
    );

    // Expect locations.items to contain the location for class Foo
    expect(locations.items).to.deep.include({
      first_line: 1,
      first_column: 0,
      last_line: 2, // Instead this is 3
      last_column: 8 // Instead this is 0
    })
  })

  it('at least yields the statement for a seed', () => {
    let ast = parse(['c = 1', ''].join('\n'));
    let locations = slice(
      ast,
      new LocationSet({
        first_line: 1,
        first_column: 0,
        last_line: 1,
        last_column: 2,
      })
    );
    expect(
      locations.contains({
        first_line: 1,
        first_column: 0,
        last_line: 1,
        last_column: 5,
      })
    ).to.be.true;
  });
});

function log(locations: LocationSet) {
  locations.items.map(loc => {
    console.log(
      `first_line: ${loc.first_line}`,
      `first_column: ${loc.first_column}`,
      `last_line: ${loc.last_line}`,
      `last_column: ${loc.last_column}`,
    )
  })
}