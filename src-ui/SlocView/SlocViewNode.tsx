import { HierarchyRectangularNode } from 'd3';
import { Project } from '../project/Project';
import { NodeColors } from './zonColoredHierarchy';

export type ColoredProject = Project & NodeColors;
export type SlocViewNode = HierarchyRectangularNode<ColoredProject>;
