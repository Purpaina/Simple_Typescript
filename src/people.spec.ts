import { Name, Person } from './people';

type TestType = { name: Name; dob: Date };

const testData: TestType[] = [
  {
    name: {
      first: 'a',
      middle: 'a',
      last: 'a',
    },
    dob: new Date(2020, 0, 1),
  },
];

// Just a simple test to create a person object
test.each(testData)('create person', ({ name, dob }) => {
  expect(() => {
    new Person(name, dob);
  }).not.toThrow();
});
