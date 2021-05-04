import { Study } from './study';

export interface MappedStudy extends Study {
  mappedInlineFields?: string[];
}
