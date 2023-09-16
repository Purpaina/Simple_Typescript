import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Group, Person } from './people';
import * as fs from 'fs';
import { Maybe } from './utilities';
import { processCLIArguments } from './cli-arguments';

const inputPath = './input-data/';
const outputPath = './output-data/';

function main(argv: string[]): void {
  const params = processCLIArguments(argv);

  const jsonData = JSON.parse(
    fs.readFileSync(inputPath + (params.inputFile ?? 'input.json'), 'utf-8'),
  );
  const sampleData: Maybe<Person[]> = plainToInstance(
    Person,
    Array.isArray(jsonData) ? (jsonData as unknown[]) : [jsonData as unknown],
  );

  if (!sampleData) {
    return;
  }

  const myGroup = new Group(...sampleData);
  console.log(myGroup.toLogString());
  console.log('---------------------');
  myGroup.sortBy([
    { sortOn: 'first_name', direction: 'ascending' },
    { sortOn: 'dob', direction: 'ascending' },
  ]);
  const printString = myGroup.toLogString();
  const data = instanceToPlain(myGroup);
  console.log(printString);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  fs.writeFileSync(
    `${outputPath}${params.outputFile ?? 'output'}.json`,
    JSON.stringify(data, null, 2),
  );
  fs.writeFileSync(
    `${outputPath}${params.outputFile ?? 'output'}.txt`,
    printString,
  );
}

main(process.argv.slice(2));
