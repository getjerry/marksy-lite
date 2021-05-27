import { CodeComponent } from './codeRenderer';

export function renderIntermediateTree(treeWrap = { tree: [] }, options = {}, context = undefined) {
  const tracker = {
    tree: null,
    elements: null,
    nextElementId: null,
    toc: null,
    currentId: [],
  };
  tracker.tree = [];
  tracker.elements = {};
  tracker.context = context;
  tracker.toc = [];
  tracker.nextElementId = 0;
  tracker.currentId = [];

  if (!treeWrap?.tree) {
    throw new Error('No intermediate tree');
  }

  function getTocPosition(toc, level) {
    let currentLevel = toc.children;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!currentLevel.length || currentLevel[currentLevel.length - 1].level === level) {
        return currentLevel;
      }
      currentLevel = currentLevel[currentLevel.length - 1].children;
    }
  }

  const specialRenderers = {
    code: ({ code, language }) => {
      if (language === 'marksy') {
        try {
          const components = Object.keys(options.components).map(key => options.components[key]);
          const mockedReact = (tag, props = {}, ...children) => {
            const componentProps =
              components.indexOf(tag) >= 0
                ? Object.assign(props || {}, {
                    // eslint-disable-next-line no-plusplus
                    key: tracker.nextElementId++,
                    context: tracker.context,
                  })
                : props;

            return options.createElement(tag, componentProps, children);
          };

          return (
            // eslint-disable-next-line no-new-func
            new Function('h', ...Object.keys(options.components), `return ${code}`)(
              mockedReact,
              ...components
            ) || null
          );
        } catch (e) {
          //
        }
        return null;
      }
      if (options.elements?.code) {
        return null;
      }
      return CodeComponent(options)({ code, language });
    },
    codespan: (props, children, elementId) => {
      if (options.elements?.codespan) {
        return null;
      }
      return options.createElement(
        'code',
        {
          key: elementId,
          context: tracker.context,
          ...props,
        },
        children
      );
    },
    heading: ({ text, level, key }) => {
      // eslint-disable-next-line no-param-reassign
      tracker.currentId = tracker.currentId.slice(0, level - 1);
      tracker.currentId.push(text.replace(/\s/g, '-').toLowerCase());

      const id = tracker.currentId.join('-');
      const lastToc = tracker.toc[tracker.toc.length - 1];

      if (!lastToc || lastToc.level > level) {
        tracker.toc.push({
          id,
          title: text,
          level,
          children: [],
        });
      } else {
        const tocPosition = getTocPosition(lastToc, level);

        tocPosition.push({
          id,
          title: text,
          level,
          children: [],
        });
      }

      // eslint-disable-next-line no-use-before-define
      return parseTreeNode({
        tag: `h${level}`,
        props: {
          id,
          key,
        },
        children: text,
      });
    },
  };

  function parseTreeNode(astNode) {
    if (typeof astNode === 'string' || !astNode) {
      return astNode;
    }
    if (Array.isArray(astNode)) {
      return astNode.map(node => parseTreeNode(node));
    }

    if (typeof astNode === 'object') {
      // eslint-disable-next-line no-plusplus
      const elementId = tracker.nextElementId++;

      // Type can be null
      const type = astNode.tag;
      let customTagRenderer = null;

      const props = astNode.props || {};
      let children = null;

      if (astNode.children) {
        children = Array.isArray(astNode.children)
          ? astNode.children.map(node => parseTreeNode(node))
          : astNode.children;
      }

      // Type is null
      if (!type) {
        return children;
      }

      if (specialRenderers[type]) {
        const result = specialRenderers[type](props, children);
        if (result) {
          return result;
        }
      }

      if (options.elements?.[type]) {
        customTagRenderer = options.elements[type];
      }

      return options.createElement(
        customTagRenderer || type,
        {
          key: elementId,
          context: tracker.context,
          ...props,
        },
        children
      );
    }
    throw new Error(`unknown type of astNode: ${typeof astNode}/ ${astNode}`);
  }

  const tree = treeWrap.tree.map(parseTreeNode);
  return { tree, toc: tracker.toc };
}
