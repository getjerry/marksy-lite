import marked from 'marked';
import he from 'he';

function createRenderer(tracker) {
  const renderer = new marked.Renderer();

  function populateInlineContent(content = '') {
    if (typeof content !== 'string') {
      return content;
    }
    const contentArray = content.split(/(\{\{.*?\}\})/);
    const extractedElements = contentArray
      .map(text => {
        const elementIdMatch = text.match(/\{\{(.*)\}\}/);
        if (elementIdMatch) {
          tracker.tree.splice(tracker.tree.indexOf(tracker.elements[elementIdMatch[1]]), 1);
          return tracker.elements[elementIdMatch[1]];
        }
        if (text !== '') {
          return he.decode(text);
        }

        return null;
      })
      .filter(one => one !== null && one !== undefined);

    return extractedElements;
  }

  function buildElement(tag, props = {}, children, addIdAsKey = true) {
    // eslint-disable-next-line no-plusplus, no-param-reassign
    const elementId = tracker.nextElementId++;
    let processedChildren = null;
    const processedProps = props;

    if (children) {
      processedChildren = Array.isArray(children)
        ? children.map(populateInlineContent).filter(one => one !== null && one !== undefined)
        : populateInlineContent(children);
    }
    if (addIdAsKey && processedProps) {
      processedProps.key = `md_${elementId}`;
    }

    // eslint-disable-next-line no-param-reassign
    tracker.elements[elementId] = {
      tag,
      ...(processedProps === null || processedProps === undefined ? {} : { props: processedProps }),
      ...(processedChildren === null || processedChildren === undefined
        ? {}
        : { children: processedChildren }),
    };
    // [tag, processedProps, processedChildren];
    tracker.tree.push(tracker.elements[elementId]);
    return `{{${elementId}}}`;
  }

  // Notice: need post process when render
  renderer.code = (code, language) => buildElement('code', { code, language }, null);

  renderer.html = html =>
    buildElement(
      'div',
      {
        dangerouslySetInnerHTML: {
          __html: html,
        },
      },
      null,
      true
    );

  renderer.paragraph = text => buildElement('p', null, text);

  renderer.blockquote = text => buildElement('blockquote', null, text);

  renderer.link = (href, title, text) => buildElement('a', { href, title }, text);

  renderer.br = () => buildElement('br');

  renderer.hr = () => buildElement('hr');

  renderer.strong = text => buildElement('strong', null, text);

  renderer.del = text => buildElement('del', null, text);

  renderer.em = text => buildElement('em', null, text);

  // Notice: need post process when render
  renderer.heading = (text, level) => buildElement('heading', { text, level }, null);

  renderer.list = (body, ordered) => buildElement(ordered ? 'ol' : 'ul', null, body);

  renderer.listitem = text => buildElement('li', null, text);

  renderer.table = (header, body) =>
    buildElement('table', null, [
      buildElement('thead', null, header),
      buildElement('tbody', null, body),
    ]);

  renderer.thead = content => buildElement('thead', null, content);

  renderer.tbody = content => buildElement('tbody', null, content);

  renderer.tablerow = content => buildElement('tr', null, content);

  renderer.tablecell = (content, flag) => {
    const tag = flag.header ? 'th' : 'td';
    return buildElement(tag, { className: flag.align ? `text-${flag.align}` : undefined }, content);
  };

  renderer.codespan = text => buildElement('codespan', null, text, 'codespan');

  renderer.image = (href, title, text) => buildElement('img', { src: href, alt: text });

  return renderer;
}

export function compileToIntermediateTree(content, options = {}, markedOptions = {}, context = {}) {
  const tracker = {
    tree: null,
    elements: null,
    nextElementId: null,
    toc: null,
    currentId: [],
  };
  const renderer = createRenderer(tracker, options, {});

  tracker.tree = [];
  tracker.elements = {};
  tracker.toc = [];
  tracker.nextElementId = 0;
  tracker.context = context;
  tracker.currentId = [];
  marked(content, { renderer, smartypants: true, ...markedOptions });

  return { tree: tracker.tree };
}
