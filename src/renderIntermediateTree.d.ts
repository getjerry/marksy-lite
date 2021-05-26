import { MarksyIntermediatePack } from '../index';
import * as React from 'react';

type Toc = {
  id: string,
  title: string,
  level: number,
  children?: [],
}

declare const renderIntermediateTree: (treeWrap: MarksyIntermediatePack) => { tree: React.ReactNode, toc: Toc };
export { renderIntermediateTree };
