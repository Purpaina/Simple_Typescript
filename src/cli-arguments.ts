import { Maybe } from './utilities';

export interface CLIArguments {
  inputFile?: string;
  outputFile?: string;
  flushOutput: boolean;
}

function getNoParamError(paramName: Maybe<string>): Error {
  return new Error(
    `No parameter passed${paramName ? ` for ${paramName}` : ''}.`,
  );
}

export function processCLIArguments(input: string[]): CLIArguments {
  const output: CLIArguments = { flushOutput: false };
  const checkParams: Partial<Record<keyof CLIArguments, boolean>> = {};
  let isParam = false;
  let paramName: Maybe<keyof CLIArguments> = undefined;
  for (let i = 0; i < input.length; i++) {
    switch (input[i].toLowerCase()) {
      case '-i':
      case '--input':
        if (isParam) {
          throw getNoParamError(paramName);
        }
        isParam = true;
        paramName = 'inputFile';
        break;
      case '-o':
      case '--output':
        if (isParam) {
          throw getNoParamError(paramName);
        }
        isParam = true;
        paramName = 'outputFile';
        break;
      case '-f':
      case '--flushoutput':
        if (checkParams.flushOutput) {
          throw new Error(`Duplicate parameters defined.`);
        }
        output.flushOutput = true;
        checkParams.flushOutput = true;
        break;
      default:
        if (!isParam) {
          throw new Error(`Unknown param passed.`);
        }
        if (paramName == undefined) {
          throw new Error(`Internal error. paramName not defined.`);
        }
        if (checkParams[paramName]) {
          throw new Error(`Duplicate parameters defined.`);
        }
        checkParams[paramName] = true;
        output[paramName] = input[i];
        isParam = false;
    }
  }

  return output;
}
