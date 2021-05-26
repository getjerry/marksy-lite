import { MarksyIntermediatePack } from '../index';
import * as React from 'react';

export type MarksyTocItem = {
  id: string,
  title: string,
  level: number,
  children?: MarksyTocItem[],
}

declare const renderIntermediateTree: (treeWrap: MarksyIntermediatePack,
                                       options?: unknown,
                                       context?: unknown) => {
  tree: React.ReactNode,
  toc: MarksyTocItem[]
};
export { renderIntermediateTree };
