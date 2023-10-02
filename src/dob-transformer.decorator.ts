import { Transform, TransformOptions } from 'class-transformer';

export function TransformDOB<
  T extends string & keyof U,
  U extends Record<T, unknown>,
>(
  transformOptions?: Omit<TransformOptions, 'toClassOnly' | 'toPlainOnly'>,
): PropertyDecorator {
  return function (target: U, propertyKey: T): void {
    Transform(({ value }: { value: string }) => new Date(value), {
      ...transformOptions,
      toClassOnly: true,
      toPlainOnly: false,
    })(target, propertyKey);

    Transform(({ value }: { value: Date }) => value.toDateString(), {
      ...transformOptions,
      toClassOnly: false,
      toPlainOnly: true,
    })(target, propertyKey);
  } as PropertyDecorator;
}
