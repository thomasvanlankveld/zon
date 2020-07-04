import { HierarchyRectangularNode } from 'd3';
import { Project } from '../project/Project';
import { NodeColors } from './color';

export type ColoredProject = Project & NodeColors;
export type LineViewNode = HierarchyRectangularNode<ColoredProject>;
