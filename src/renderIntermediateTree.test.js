/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { createElement, Component } from 'react';
import PropTypes from 'prop-types';
import Preact from 'preact';
import preactRenderToString from 'preact-render-to-string';
import { renderToString as infernoRenderToString } from 'inferno-server';
import { createElement as infernoCreateElement } from 'inferno-create-element';
import { render } from '@testing-library/react';

import hljs from 'highlight.js/lib/highlight';
import hljsJs from 'highlight.js/lib/languages/javascript';
import hljsXml from 'highlight.js/lib/languages/xml';

// eslint-disable-next-line
import marksy, { compileToIntermediateTree, renderIntermediateTree } from './';

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

function getCompiled(content, options, context) {
  const compile = marksy(options || { createElement });
  const compiled = compile(content, {}, context);
  return compiled;
}

function getRenderedContainer(content, options, context) {
  const compiled = getCompiled(content, options, context);
  const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);
  return container;
}

function getCompiledTwoStep(content, options, context) {
  const compiled = renderIntermediateTree(
    compileToIntermediateTree(content),
    options || { createElement },
    context
  );
  return compiled;
}

function getRenderedContainerWithTwoSteps(content, options, context) {
  const compiled = getCompiledTwoStep(content, options, context);
  const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);
  return container;
}

function getTwoCompiledContainer(content) {
  const container = getRenderedContainer(content);
  const containerTwo = getRenderedContainerWithTwoSteps(content);
  return [container, containerTwo];
}

describe('Two step render result should be same with marksy', () => {
  it('text', () => {
    const [container, containerTwo] = getTwoCompiledContainer('hello');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('strong text', () => {
    const [container, containerTwo] = getTwoCompiledContainer('hello **there**');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('italic text', () => {
    const [container, containerTwo] = getTwoCompiledContainer('hello *there*');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('links', () => {
    const [container, containerTwo] = getTwoCompiledContainer('[my link](http://example.com)');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('headers', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# header1
## header2
### header3
#### header4
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should handle same name nested headers', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# header1
## header2
# header3
## header2
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('ordered list', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
1. foo
2. bar
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('list', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
- foo
- bar
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('tables', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('codespans', () => {
    const [container, containerTwo] = getTwoCompiledContainer('install with `$ npm install`');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('image', () => {
    const [container, containerTwo] = getTwoCompiledContainer('![test](http://some.com/image.png)');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('html', () => {
    const [container, containerTwo] = getTwoCompiledContainer('<div>hello</div>');
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('multiple html', () => {
    const [container, containerTwo] = getTwoCompiledContainer(
      '<div>hello</div>\n<strong>there</strong>\n<em>world</em>'
    );
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('components using H and marksy language', () => {
    const options = {
      createElement,
      components: {
        Test() {
          return <div>mip</div>;
        },
      },
    };
    const content = '```marksy\nh(Test)\n```';

    const container = getRenderedContainer(content, options);
    const containerTwo = getRenderedContainerWithTwoSteps(content, options);

    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('nested lists', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
- Colors
    - Red
    - Blue
- Shape
  - Triangle
  - Rectangle
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should be able to combine in compilation', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# hey

- foo

-bar
  `);
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should produce TOC', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# foo

## bar

### baz
  `);

    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should produce custom tags', () => {
    const options = {
      createElement,
      elements: {
        h1(props) {
          return <div>{props.children}</div>;
        },
      },
    };
    const content = `
# foo
  `;

    const container = getRenderedContainer(content, options);
    const containerTwo = getRenderedContainerWithTwoSteps(content, options);

    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should work with Preact', () => {
    const options = {
      createElement: Preact.h,
      elements: {
        h1(props) {
          return Preact.h('div', null, props.children);
        },
      },
    };
    const content = `
# foo
  `;

    const compiled = getCompiled(content, options);
    const compiled2 = getCompiledTwoStep(content, options);

    expect(preactRenderToString(Preact.h('div', null, compiled.tree))).toMatchSnapshot();
    expect(preactRenderToString(Preact.h('div', null, compiled.tree))).toStrictEqual(
      preactRenderToString(Preact.h('div', null, compiled2.tree))
    );
  });

  it('should work with Inferno', () => {
    const options = {
      createElement: infernoCreateElement,
      elements: {
        h1(props) {
          return infernoCreateElement('div', null, props.children);
        },
      },
    };
    const content = `
# foo
  `;

    const compiled = getCompiled(content, options);
    const compiled2 = getCompiledTwoStep(content, options);

    expect(
      infernoRenderToString(infernoCreateElement('div', null, compiled.tree))
    ).toMatchSnapshot();
    expect(infernoRenderToString(infernoCreateElement('div', null, compiled.tree))).toStrictEqual(
      infernoRenderToString(infernoCreateElement('div', null, compiled2.tree))
    );
  });

  it('should allow injecting context to elements', () => {
    const options = {
      createElement,
      elements: {
        h1(props) {
          return <div>{props.context.foo}</div>;
        },
      },
    };
    const content = `
# foo
  `;

    const context = {
      foo: 'bar',
    };

    const container = getRenderedContainer(content, options, context);
    const containerTwo = getRenderedContainerWithTwoSteps(content, options, context);

    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should allow overriding inline code element', () => {
    const options = {
      createElement,
      elements: {
        codespan({ children }) {
          return <span>{children}</span>;
        },
      },
    };
    const content = 'Hello `code`';

    const container = getRenderedContainer(content, options);
    const containerTwo = getRenderedContainerWithTwoSteps(content, options);

    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should allow overriding block code element', () => {
    const options = {
      createElement,
      elements: {
        code({ language, code }) {
          return (
            <div>
              {language}:{code}
            </div>
          );
        },
      },
    };
    const content = '```js\ncode\n```';

    const container = getRenderedContainer(content, options);
    const containerTwo = getRenderedContainerWithTwoSteps(content, options);

    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should escape code when no highlighting is supplied', () => {
    const [container, containerTwo] = getTwoCompiledContainer(
      '```js\nconst Foo = () => <div/>\n```'
    );
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('self-closing tag', () => {
    const [container, containerTwo] = getTwoCompiledContainer(
      `
  ![test](http://some.com/image.png)
  
  <div><br /></div>
  
  <hr/>

  <input type='text' />
  `
    );
    expect(container.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });
});
