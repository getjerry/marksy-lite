import { MarksyIntermediatePack } from '../index';
import * as React from 'react';

type Toc = {
  id: string,
  title: string,
  level: number,
  children?: [],
}

declare const renderIntermediateTree: (treeWrap: MarksyIntermediatePack, options?: unknown, context?: unknown) => { tree: React.ReactNode, toc: Toc };
export { renderIntermediateTree };
