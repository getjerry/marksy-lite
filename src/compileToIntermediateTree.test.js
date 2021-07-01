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

it('should be able to handle title formats', () => {
  const compiled = compileToIntermediateTree(`
# **hey**
  `);

  expect(compiled).toMatchSnapshot();
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
  const compiled = compileToIntermediateTree(content);

  expect(compiled).toMatchSnapshot();
});

it('real article db-lr: How to Remove Odors From Car Interiors', () => {
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
`.replace(/(\r\n|\r)/g, '\n');
  const compiled = compileToIntermediateTree(content);

  expect(compiled).toMatchSnapshot();
});
