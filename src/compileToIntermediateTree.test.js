/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import hljs from 'highlight.js/lib/highlight';
import hljsJs from 'highlight.js/lib/languages/javascript';
import hljsXml from 'highlight.js/lib/languages/xml';

// eslint-disable-next-line
import { compileToIntermediateTree } from './compileToIntermediateTree';

hljs.registerLanguage('javascript', hljsJs);
hljs.registerLanguage('xml', hljsXml);

// eslint-disable-next-line
class TestComponent extends Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

TestComponent.propTypes = {
  children: PropTypes.node,
};

TestComponent.defaultProps = {
  children: null,
};

it('should be able to compile text', () => {
  const compiled = compileToIntermediateTree('hello');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile strong text', () => {
  const compiled = compileToIntermediateTree('hello **there**');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile italic text', () => {
  const compiled = compileToIntermediateTree('hello *there*');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile links', () => {
  const compiled = compileToIntermediateTree('[my link](http://example.com)');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile headers', () => {
  const compiled = compileToIntermediateTree(`
# header1
## header2
### header3
#### header4
  `);

  expect(compiled).toMatchSnapshot();
});

it('should handle same name nested headers', () => {
  const compiled = compileToIntermediateTree(`
# header1
## header2
# header3
## header2
  `);

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile ordered list', () => {
  const compiled = compileToIntermediateTree(`
1. foo
2. bar
  `);

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile list', () => {
  const compiled = compileToIntermediateTree(`
- foo
- bar
  `);

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile tables', () => {
  const compiled = compileToIntermediateTree(`
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `);

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile codespans', () => {
  const compiled = compileToIntermediateTree('install with `$ npm install`');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile image', () => {
  const compiled = compileToIntermediateTree('![test](http://some.com/image.png)');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile html', () => {
  const compiled = compileToIntermediateTree('<div>hello</div>');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile multiple html', () => {
  const compiled = compileToIntermediateTree(
    '<div>hello</div>\n<strong>there</strong>\n<em>world</em>'
  );

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile components using H and marksy language', () => {
  const compiled = compileToIntermediateTree('```marksy\nh(Test)\n```');

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile nested lists', () => {
  const compiled = compileToIntermediateTree(`
- Colors
    - Red
    - Blue
- Shape
  - Triangle
  - Rectangle
  `);

  expect(compiled).toMatchSnapshot();
});

it('should be able to combine in compilation', () => {
  const compiled = compileToIntermediateTree(`
# hey

- foo

-bar
  `);

  expect(compiled).toMatchSnapshot();
});

it('should produce TOC', () => {
  const compiled = compileToIntermediateTree(`
# foo

## bar

### baz
  `);

  expect(JSON.stringify(compiled.toc, null, 2)).toMatchSnapshot();
});

it('should allow injecting context to elements', () => {
  const compiled = compileToIntermediateTree(
    `
# foo
  `,
    {},
    {
      foo: 'bar',
    }
  );

  expect(compiled).toMatchSnapshot();
});

it('should be able to compile self-closing tag', () => {
  const compiled = compileToIntermediateTree(`
  ![test](http://some.com/image.png)
  
  <div><br /></div>
  
  <hr/>

  <input type='text' />
  `);

  expect(compiled).toMatchSnapshot();
});
