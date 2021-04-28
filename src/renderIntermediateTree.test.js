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

function getRenderedContainer(content) {
  const compile = marksy({ createElement });
  const compiled = compile(content);
  const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);
  return container;
}

function getRenderedContainerWithTwoSteps(content) {
  const compiled = renderIntermediateTree(compileToIntermediateTree(content), { createElement });
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
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('strong text', () => {
    const [container, containerTwo] = getTwoCompiledContainer('hello **there**');
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('italic text', () => {
    const [container, containerTwo] = getTwoCompiledContainer('hello *there*');
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('links', () => {
    const [container, containerTwo] = getTwoCompiledContainer('[my link](http://example.com)');
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('headers', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# header1
## header2
### header3
#### header4
  `);
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should handle same name nested headers', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# header1
## header2
# header3
## header2
  `);
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('ordered list', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
1. foo
2. bar
  `);
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('list', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
- foo
- bar
  `);
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
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('codespans', () => {
    const [container, containerTwo] = getTwoCompiledContainer('install with `$ npm install`');
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('image', () => {
    const [container, containerTwo] = getTwoCompiledContainer('![test](http://some.com/image.png)');
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('html', () => {
    const [container, containerTwo] = getTwoCompiledContainer('<div>hello</div>');
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('multiple html', () => {
    const [container, containerTwo] = getTwoCompiledContainer(
      '<div>hello</div>\n<strong>there</strong>\n<em>world</em>'
    );
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('components using H and marksy language', () => {
    const compile = marksy({
      createElement,
      components: {
        Test() {
          return <div>mip</div>;
        },
      },
    });
    const compiled = compile('```marksy\nh(Test)\n```');
    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
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
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should be able to combine in compilation', () => {
    const [container, containerTwo] = getTwoCompiledContainer(`
# hey

- foo

-bar
  `);
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should produce TOC', () => {
    const compile = marksy({ createElement });
    const compiled = compile(`
# foo

## bar

### baz
  `);

    expect(JSON.stringify(compiled.toc, null, 2)).toMatchSnapshot();
  });

  it('should produce custom tags', () => {
    const compile = marksy({
      createElement,
      elements: {
        h1(props) {
          return <div>{props.children}</div>;
        },
      },
    });
    const compiled = compile(`
# foo
  `);

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should work with Preact', () => {
    const compile = marksy({
      createElement: Preact.h,
      elements: {
        h1(props) {
          return Preact.h('div', null, props.children);
        },
      },
    });
    const compiled = compile(`
# foo
  `);

    expect(preactRenderToString(Preact.h('div', null, compiled.tree))).toMatchSnapshot();
  });

  it('should work with Inferno', () => {
    const compile = marksy({
      createElement: infernoCreateElement,
      elements: {
        h1(props) {
          return infernoCreateElement('div', null, props.children);
        },
      },
    });
    const compiled = compile(`
# foo
  `);

    expect(
      infernoRenderToString(infernoCreateElement('div', null, compiled.tree))
    ).toMatchSnapshot();
  });

  it('should allow injecting context to elements', () => {
    const compile = marksy({
      createElement,
      elements: {
        h1(props) {
          return <div>{props.context.foo}</div>;
        },
      },
    });
    const compiled = compile(
      `
# foo
  `,
      {},
      {
        foo: 'bar',
      }
    );

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should allow overriding inline code element', () => {
    const compile = marksy({
      createElement,
      elements: {
        codespan({ children }) {
          return <span>{children}</span>;
        },
      },
    });
    const compiled = compile('Hello `code`');

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should allow overriding block code element', () => {
    const compile = marksy({
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
    });
    const compiled = compile('```js\ncode\n```');

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should escape code when no highlighting is supplied', () => {
    const compile = marksy({
      createElement,
    });
    const compiled = compile('```js\nconst Foo = () => <div/>\n```');

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should highlight code with highlight.js', () => {
    const compile = marksy({
      createElement,
      highlight(language, code) {
        return hljs.highlight(language, code).value;
      },
    });
    const compiled = compile('```js\nconst foo = "bar"\n```');

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should not crash highlight.js with unsupported language', () => {
    const compile = marksy({
      createElement,
      highlight(language, code) {
        return hljs.highlight(language, code).value;
      },
    });

    const compiled = compile('```unsuppoted_language\nconst foo = "bar"\n```');

    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('self-closing tag', () => {
    const compile = marksy({ createElement });
    const compiled = compile(`
  ![test](http://some.com/image.png)
  
  <div><br /></div>
  
  <hr/>

  <input type='text' />
  `);
    const { container } = render(<TestComponent>{compiled.tree}</TestComponent>);

    expect(container.firstChild).toMatchSnapshot();
  });
});
