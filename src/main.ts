import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as fs from 'fs';
import { Group, Person } from './people';

const inputPath = './input-data/';
const outputPath = './output-data/';

function main(): void {
  // Pull the raw JSON data from the file
  const jsonData = JSON.parse(
    fs.readFileSync(inputPath + 'input.json', 'utf-8'),
  );

  // Use class transformer to convert data
  const people = plainToInstance(
    Person,
    Array.isArray(jsonData) ? (jsonData as unknown[]) : [jsonData as unknown],
  );

  // We don't have data so we have nothing else to process
  if (!people) {
    return;
  }

  // Pass the array of people to create a group of people
  const groupOfPeople = new Group(...people);

  try {
    const sortOptions = JSON.parse(
      fs.readFileSync(inputPath + 'sort.json', 'utf-8'),
    );
    groupOfPeople.sortBy(sortOptions);
  } catch (e) {
    console.log(e);
  }

  // Log it to the console
  console.log(groupOfPeople.toLogString());

  // Make the directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Convert the object to plain for storing the output
  const groupPlain = instanceToPlain(groupOfPeople);

  // Write it out
  fs.writeFileSync(
    outputPath + `output.json`,
    JSON.stringify(groupPlain, null, 2),
  );
}

main();
