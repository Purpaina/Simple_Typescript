import "reflect-metadata";
import { Exclude, Transform, Type } from "class-transformer";
import { Maybe } from "./utilities";

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
      this.name.middle ? ` ${this.name.middle}` : ""
    } ${this.name.last}`;
  }
}

/**
 * A group of people
 */
export class Group {
  @Type(() => Person)
  private _group: Person[];
  constructor(...input: Person[]) {
    this._group = input;
  }

  /**
   * Get the youngest in the group
   */
  youngest(): Person {
    return this._group.reduce((previousValue, currentValue) =>
      previousValue.dob > currentValue.dob ? previousValue : currentValue
    );
  }

  /**
   * Get the oldest in the group
   */
  oldest(): Person {
    return this._group.reduce((previousValue, currentValue) =>
      previousValue.dob < currentValue.dob ? previousValue : currentValue
    );
  }

  /**
   * Sorts the data and saves in the object.
   *
   * Used as an example. Probably better to split the different sortings out.
   * Like sortByDOB(), sortByFirstName(), and sortByLastName()
   *
   * @param sortOn The item to sort on
   * @param direction The direction to sort on
   */
  sortBy(
    sortLayers: {
      sortOn: "dob" | "first_name" | "last_name";
      direction: "ascending" | "descending";
    }[]
  ) {
    let getValue: ((entry: Person) => Date | String)[] = sortLayers.map(
      (entry) => {
        switch (entry.sortOn) {
          case "dob":
            return (entry: Person) => entry.dob;
            break;
          case "first_name":
            return (entry: Person) => entry.name.first;
            break;
          case "last_name":
            return (entry: Person) => entry.name.last;
            break;
          default:
            throw new Error(`Sort on ${entry.sortOn} not supported.`);
        }
      }
    );
    const sortFunction = (lhs: Person, rhs: Person) => {
      let result = 0;
      for (let i = 0; i < getValue.length; i++) {
        if (getValue[i](lhs) === getValue[i](rhs)) {
          continue;
        }
        switch (sortLayers[i].direction) {
          case "ascending":
            result = getValue[i](lhs) > getValue[i](rhs) ? -1 : 1;
          case "descending":
            result = getValue[i](lhs) < getValue[i](rhs) ? -1 : 1;
        }
        break;
      }
      return result;
    };

    // if (direction === "ascending") {
    //   sortFunction = (lhs: Person, rhs: Person) =>
    //     getValue(lhs) <= getValue(rhs) ? -1 : 1;
    // } else {
    //   sortFunction = (lhs: Person, rhs: Person) =>
    //     getValue(lhs) > getValue(rhs) ? -1 : 1;
    // }

    this._group = this._group.sort(sortFunction);
  }

  /**
   * Generates a string of everyone in the group for logging
   * @returns A loggable string of everyone in the group
   */
  toLogString(): string {
    const longestNameLength = this._group.reduce((currentMax, nextPerson) => {
      const workingMax = nextPerson.formattedName().length;
      return workingMax > currentMax ? workingMax : currentMax;
    }, 0);

    return this._group
      .map((entry) => {
        const formattedName = entry.formattedName();
        return `${entry.id
          .toString()
          .padStart(3, "0")}) ${formattedName}${" ".repeat(
          longestNameLength - formattedName.length
        )} ${entry.dob.toDateString()}`;
      })
      .join("\n");
  }
}
