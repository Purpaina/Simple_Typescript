import 'reflect-metadata';
import { Exclude } from 'class-transformer';
import { TransformDOB } from './dob-transformer.decorator';
import { idManager } from './id-manager';

/**
 * A basic name with an optional middle name
 */
export interface Name {
  first: string;
  middle?: string;
  last: string;
}

/**
 * A single person
 */
export class Person {
  name: Name;
  @TransformDOB()
  dob: Date;
  @Exclude()
  private _id: number;

  constructor(name: Name, dob: Date) {
    this.name = name;
    this.dob = dob;
    this._id = idManager.getNewId();
  }

  get id(): number {
    return this._id;
  }

  formattedName(): string {
    return `${this.name.first}${
      this.name.middle ? ` ${this.name.middle}` : ''
    } ${this.name.last}`;
  }
}
