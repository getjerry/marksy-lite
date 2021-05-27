/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { Component, createElement } from 'react';
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
  const tree = compileToIntermediateTree(content);
  // console.log(JSON.stringify(tree, 0, 2));
  const compiled = renderIntermediateTree(tree, options || { createElement }, context);
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
    const content = `
# foo

## bar

### baz
  `;
    const compiled = getCompiled(content);
    const compiled2 = getCompiledTwoStep(content);
    expect(JSON.stringify(compiled.toc, null, 2)).toMatchSnapshot();
    expect(compiled.toc).toStrictEqual(compiled2.toc);

    const [container, containerTwo] = getTwoCompiledContainer(content);
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('should produce TOC complex', () => {
    const content = `
# foo

text

## bar

text

# f2

## f3

text
### baz

## f4
  `;
    const compiled = getCompiled(content);
    const compiled2 = getCompiledTwoStep(content);
    expect(JSON.stringify(compiled.toc, null, 2)).toMatchSnapshot();
    expect(compiled.toc).toStrictEqual(compiled2.toc);

    const [container, containerTwo] = getTwoCompiledContainer(content);
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
  it('real article: How to Remove Odors From Car Interiors', () => {
    const content = `You don’t have to just live with the odor when there is an unidentified stink in your car. It will take a little effort, but it is well worth it to be able to get in your car without thinking, “ew, why does it smell like that in here?” All you have to do is find the source, clean it up, then give your car a good cleaning – which it probably needs anyway.
 
### Remove the cause of the odor
 
**Materials Needed**
 
* Paper towels
* Plastic utensil or putty knife
 
**Step 1: Determine where the odor is coming from**. It could be leftover residue from an old milk or juice spill, a half-eaten piece of fruit, or a sippy cup with a little curdled milk left in the bottom.
 
**Step 2: Remove the cause of the odor**. Pick it up with paper towels or scrape it off with a plastic utensil or putty knife.
 
### Clean the odor-causing spill
 
**Materials Needed**
 
* Baking soda
* Bucket
* Dish soap
* Distilled vinegar
* Hot water
* Towels
* Vacuum
* Washcloth or clean sponge
 
**Step 1: Combine 1 cup of vinegar, 1 teaspoon of dish soap, and 1 gallon of hot water in a bucket**.
 
**Step 2: Put on some rubber dishwashing gloves and apply the solution to the source of the odor **.
 
**Step 3: Rub the solution into the spot with a scrub brush or sponge**. Let it work for about half an hour.
 
**Step 4: Soak up the dirty vinegar solution with a towel**.
 
**Step 5: Pour baking soda on the stinky spot**. Apply it as heavily as possible. A 1/4-inch thickness or more is best. Leave it there for as long as possible. Overnight is good but several days is better.
 
**Step 6: Vacuum up the baking soda**. Use a high-powered wet/dry vacuum if possible. If you only have a regular household vacuum, empty the canister or replace the bag before you use it.
 
**Step 7: Repeat steps 5 and 6, if the odor lingers**.
 
**Step 8: Put the windows down and leave the car outdoors, if you can, to let it air out **.
 
### Clean the entire interior of your car
Now it's time to give your car's interior a [thorough cleaning](https://getjerry.com/advice/how-to-do-a-thorough-car-interior-cleaning-by-amber-dowler). At this point, you can also tackle [grease and oil stains](https://getjerry.com/advice/how-to-remove-grease-and-oil-from-a-car-interior-by-mary-kurz), [windows](https://getjerry.com/advice/how-to-clean-the-inside-of-a-car-windshield-by-cheryl-knight), and, once you're done, consider installing [car seat covers](https://getjerry.com/advice/how-to-buy-install-and-clean-car-seat-covers-by-rochelle-miller-hernandez).
 
**Materials Needed**
 
* Automotive carpet and upholstery cleaner (Available in auto parts stores and online.)
* Towels
* Washcloth or clean sponge
* Vacuum
 
**Step 1: Take everything out of the car**. Remove the floor mats, too.
 
**Step 2: Vacuum the entire car, top to bottom**.
 
**Step 3: Clean the carpet, upholstery, and headliner/roof upholstery with automotive carpet and upholstery cleaner**. Follow the manufacturer’s instructions. 

For best results, get an all-purpose cleaning/odor-eliminating solution like [Turtle Wax’s Clean and Fresh Kit](https://www.amazon.com/dp/B072HKH61F?psc=1). It even comes with a special microfiber towel to use.
 
**Step 4: Let the car sit outdoors with the windows open for as long as you can to really air it out**. Do not leave the doors open, though. The dome light might run down the battery.
 
### Mask the odor until it eventually dissipates naturally – sometimes it just takes time
 
**Materials Needed**
 
* Essential oil diffuser
* Odor-absorbing substance
* Upholstery odor remover
 
**Step 1: Spray the upholstery, headliner, and carpet with a spray odor neutralizer**.
 
**Step 2: Use an essential oil diffuser in your car**. You can choose your favorite essential oil fragrance or use a different essential oil each day. [Amazon](https://www.amazon.com/s/ref=nb_sb_ss_i_1_30?url=search-alias%3Dautomotive&field-keywords=essential+oil+diffuser+for+car&sprefix=essential+oil+diffuser+for+car%2Cautomotive%2C208&crid=P9R2ST8MI037) has a nice selection of diffusers to choose from and sells essential oils.
 
**Step 3: Place an odor-absorbing substance near the source of the odor**. You can pick them up at the local discount store or order them online. [MosoNatural](http://mosonatural.com/) sells a very effective product online.
 
We all know how distracting the stink from a little spilled milk can be, so no doubt you'll be glad you have it removed before it gets any worse. A nice-smelling car makes any trip, long or short, that much more pleasant. 
`;
    const [container, containerTwo] = getTwoCompiledContainer(content);
    expect(containerTwo.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });

  it('real article db: How to Remove Odors From Car Interiors', () => {
    const content = `You don’t have to just live with the odor when there is an unidentified stink in your car. It will take a little effort, but it is well worth it to be able to get in your car without thinking, “ew, why does it smell like that in here?” All you have to do is find the source, clean it up, then give your car a good cleaning – which it probably needs anyway.
 
### Remove the cause of the odor
 
**Materials Needed**
 
* Paper towels
* Plastic utensil or putty knife
 
**Step 1: Determine where the odor is coming from**. It could be leftover residue from an old milk or juice spill, a half-eaten piece of fruit, or a sippy cup with a little curdled milk left in the bottom.
 
**Step 2: Remove the cause of the odor**. Pick it up with paper towels or scrape it off with a plastic utensil or putty knife.
 
### Clean the odor-causing spill
 
**Materials Needed**
 
* Baking soda
* Bucket
* Dish soap
* Distilled vinegar
* Hot water
* Towels
* Vacuum
* Washcloth or clean sponge
 
**Step 1: Combine 1 cup of vinegar, 1 teaspoon of dish soap, and 1 gallon of hot water in a bucket**.
 
**Step 2: Put on some rubber dishwashing gloves and apply the solution to the source of the odor **.
 
**Step 3: Rub the solution into the spot with a scrub brush or sponge**. Let it work for about half an hour.
 
**Step 4: Soak up the dirty vinegar solution with a towel**.
 
**Step 5: Pour baking soda on the stinky spot**. Apply it as heavily as possible. A 1/4-inch thickness or more is best. Leave it there for as long as possible. Overnight is good but several days is better.
 
**Step 6: Vacuum up the baking soda**. Use a high-powered wet/dry vacuum if possible. If you only have a regular household vacuum, empty the canister or replace the bag before you use it.
 
**Step 7: Repeat steps 5 and 6, if the odor lingers**.
 
**Step 8: Put the windows down and leave the car outdoors, if you can, to let it air out **.
 
### Clean the entire interior of your car
Now it's time to give your car's interior a [thorough cleaning](https://getjerry.com/advice/how-to-do-a-thorough-car-interior-cleaning-by-amber-dowler). At this point, you can also tackle [grease and oil stains](https://getjerry.com/advice/how-to-remove-grease-and-oil-from-a-car-interior-by-mary-kurz), [windows](https://getjerry.com/advice/how-to-clean-the-inside-of-a-car-windshield-by-cheryl-knight), and, once you're done, consider installing [car seat covers](https://getjerry.com/advice/how-to-buy-install-and-clean-car-seat-covers-by-rochelle-miller-hernandez).
 
**Materials Needed**
 
* Automotive carpet and upholstery cleaner (Available in auto parts stores and online.)
* Towels
* Washcloth or clean sponge
* Vacuum
 
**Step 1: Take everything out of the car**. Remove the floor mats, too.
 
**Step 2: Vacuum the entire car, top to bottom**.
 
**Step 3: Clean the carpet, upholstery, and headliner/roof upholstery with automotive carpet and upholstery cleaner**. Follow the manufacturer’s instructions. 

For best results, get an all-purpose cleaning/odor-eliminating solution like [Turtle Wax’s Clean and Fresh Kit](https://www.amazon.com/dp/B072HKH61F?psc=1). It even comes with a special microfiber towel to use.
 
**Step 4: Let the car sit outdoors with the windows open for as long as you can to really air it out**. Do not leave the doors open, though. The dome light might run down the battery.
 
### Mask the odor until it eventually dissipates naturally – sometimes it just takes time
 
**Materials Needed**
 
* Essential oil diffuser
* Odor-absorbing substance
* Upholstery odor remover
 
**Step 1: Spray the upholstery, headliner, and carpet with a spray odor neutralizer**.
 
**Step 2: Use an essential oil diffuser in your car**. You can choose your favorite essential oil fragrance or use a different essential oil each day. [Amazon](https://www.amazon.com/s/ref=nb_sb_ss_i_1_30?url=search-alias%3Dautomotive&field-keywords=essential+oil+diffuser+for+car&sprefix=essential+oil+diffuser+for+car%2Cautomotive%2C208&crid=P9R2ST8MI037) has a nice selection of diffusers to choose from and sells essential oils.
 
**Step 3: Place an odor-absorbing substance near the source of the odor**. You can pick them up at the local discount store or order them online. [MosoNatural](http://mosonatural.com/) sells a very effective product online.
 
We all know how distracting the stink from a little spilled milk can be, so no doubt you'll be glad you have it removed before it gets any worse. A nice-smelling car makes any trip, long or short, that much more pleasant. 
`;
    const [container, containerTwo] = getTwoCompiledContainer(content);
    expect(containerTwo.firstChild).toMatchSnapshot();
    expect(container.firstChild).toStrictEqual(containerTwo.firstChild);
  });
});
