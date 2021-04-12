type NodeType = string;
// eslint-disable-next-line no-undef
type NodeProps = unknown;
// eslint-disable-next-line no-use-before-define
type NodeChildren = Array<MarksyIntermediateTree | string | NodeChildren>;
export type MarksyIntermediateTree = {
  tag: NodeType;
  props: NodeProps;
  children: NodeChildren;
};
