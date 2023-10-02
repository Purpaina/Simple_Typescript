import { Expose, Type } from 'class-transformer';
import { Person } from './people';

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

  get people(): Person[] {
    return this._group;
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
      sortOn: Group.SortableFields;
      direction: 'ascending' | 'descending';
    }[],
  ) {
    const getValue: ((entry: Person) => Date | string | number)[] =
      sortLayers.map((entry) => {
        switch (entry.sortOn) {
          case 'dob':
            return (entry: Person) => entry.dob;
          case 'first_name':
            return (entry: Person) => entry.name.first;
          case 'last_name':
            return (entry: Person) => entry.name.last;
          case 'middle_name':
            return (entry: Person) => entry.name.middle ?? '';
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

    // Should probably return a new Group with the items sorted instead of sorting
    // within the class but oh well.
    this._group = this._group.sort(sortFunction);
  }

  /**
   * Generate a string for debugging purposes.
   *
   * @returns A string to log the group
   */
  toString(): string {
    const longestNameLength = this._group.reduce((currentMax, nextPerson) => {
      const workingMax = nextPerson.formattedName().length;
      return workingMax > currentMax ? workingMax : currentMax;
    }, 0);

    return this._group
      .map((entry) => {
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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Group {
  export const sortableFieldsList = [
    'dob',
    'dob_year',
    'dob_month',
    'dob_day',
    'first_name',
    'middle_name',
    'last_name',
  ] as const;

  export type SortableFields = (typeof sortableFieldsList)[number];
}
