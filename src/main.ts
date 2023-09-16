import { instanceToPlain, plainToInstance } from "class-transformer";
import { Group, Person } from "./people";
import * as fs from "fs";
import { Maybe } from "./utilities";
import { processCLIArguments } from "./cli-arguments";

function main(argv: string[]): void {
  const params = processCLIArguments(argv);
  console.log(params);

  const jsonData = JSON.parse(
    fs.readFileSync(`./input-data/${params.inputFile ?? "input.json"}`, "utf-8")
  );
  const sampleData: Maybe<Person[]> = plainToInstance(
    Person,
    Array.isArray(jsonData) ? (jsonData as unknown[]) : [jsonData as unknown]
  );
  if (!sampleData) {
    return;
  }

  const myGroup = new Group(...sampleData);
  console.log(myGroup.toLogString());
  console.log("---------------------");
  myGroup.sortBy([
    { sortOn: "first_name", direction: "ascending" },
    { sortOn: "dob", direction: "ascending" },
  ]);
  console.log(myGroup.toLogString());
  let data = instanceToPlain(myGroup);

  fs.writeFileSync(
    `./output-data/${params.outputFile ?? "output"}.json`,
    JSON.stringify(data, null, 2)
  );
}

main(process.argv.slice(2));
