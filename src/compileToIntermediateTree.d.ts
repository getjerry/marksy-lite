import { MarksyIntermediatePack } from '../index';

declare const compileToIntermediateTree: (content: string, options: unknown, markedOptions: unknown, context: unknown) => { tree: MarksyIntermediatePack };
export { compileToIntermediateTree };
