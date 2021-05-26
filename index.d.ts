type NodeType = string;

type NodeProps = unknown;
type NodeChildren = Array<MarksyIntermediateTree | string | NodeChildren>;

export type MarksyIntermediateTree = {
  tag: NodeType;
  props: NodeProps;
  children: NodeChildren;
};

export type MarksyIntermediatePack = {
  tree: MarksyIntermediateTree[];
};

type Compiler = (content: string) => any;
type MarksyFunction = (options: any) => Compiler;
declare const marksy: MarksyFunction;
export default marksy;
