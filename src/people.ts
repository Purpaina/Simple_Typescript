import 'reflect-metadata';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

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
  @Transform(({ value }: { value: string }) => new Date(value))
  dob: Date;
  @Exclude()
  private _id: number;
  @Exclude()
  private static _nextId: number = 0;

  constructor(name: Name, dob: Date) {
    this.name = name;
    this.dob = dob;
    this._id = Person._nextId++;
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

/**
 * A group of people
 */
export class Group {
  @Type(() => Person)
  @Expose({ name: 'group' })
  private _group: Person[];

  constructor(...input: Person[]) {
    this._group = input;
  }

  /**
   * Get the youngest person in the group.
   *
   * @returns The youngest person
   */
  youngest(): Person {
    return this._group.reduce((previousValue, currentValue) =>
      previousValue.dob > currentValue.dob ? previousValue : currentValue,
    );
  }

  /**
   * Get the oldest person in the group.
   *
   * @returns The oldest person
   */
  oldest(): Person {
    return this._group.reduce((previousValue, currentValue) =>
      previousValue.dob < currentValue.dob ? previousValue : currentValue,
    );
  }

  /**
   * Sort the group based on multiple items
   *
   * @param sortLayers An array of sorting options
   */
  sortBy(
    sortLayers: {
      sortOn:
        | 'dob'
        | 'dob_year'
        | 'dob_month'
        | 'dob_day'
        | 'first_name'
        | 'last_name';
      direction: 'ascending' | 'descending';
    }[],
  ) {
    const getValue: ((entry: Person) => Date | string | number)[] =
      sortLayers.map(entry => {
        switch (entry.sortOn) {
          case 'dob':
            return (entry: Person) => entry.dob;
          case 'first_name':
            return (entry: Person) => entry.name.first;
          case 'last_name':
            return (entry: Person) => entry.name.last;
          case 'dob_year':
            return (entry: Person) => entry.dob.getFullYear();
          case 'dob_month':
            return (entry: Person) => entry.dob.getMonth();
          case 'dob_day':
            return (entry: Person) => entry.dob.getDay();
          default:
            throw new Error(`Sort on ${entry.sortOn} not supported.`);
        }
      });

    const sortFunction = (lhs: Person, rhs: Person) => {
      let result = 0;
      for (let i = 0; i < getValue.length; i++) {
        if (getValue[i](lhs) === getValue[i](rhs)) {
          continue;
        }
        switch (sortLayers[i].direction) {
          case 'ascending':
            result = getValue[i](lhs) < getValue[i](rhs) ? -1 : 1;
            break;
          case 'descending':
            result = getValue[i](lhs) > getValue[i](rhs) ? -1 : 1;
            break;
        }
        break;
      }
      return result;
    };
    this._group = this._group.sort(sortFunction);
  }

  /**
   * Generate a string for debugging purposes.
   *
   * @returns A string to log the group
   */
  toLogString(): string {
    const longestNameLength = this._group.reduce((currentMax, nextPerson) => {
      const workingMax = nextPerson.formattedName().length;
      return workingMax > currentMax ? workingMax : currentMax;
    }, 0);

    return this._group
      .map(entry => {
        const formattedName = entry.formattedName();
        return `${entry.id
          .toString()
          .padStart(3, '0')}) ${formattedName}${' '.repeat(
          longestNameLength - formattedName.length,
        )} ${entry.dob.toDateString()}`;
      })
      .join('\n');
  }
}
