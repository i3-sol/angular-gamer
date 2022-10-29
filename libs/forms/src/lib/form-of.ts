import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type BaseFormControlType =
  | null
  | symbol
  | boolean
  | string
  | number
  | bigint
  | Date;
export type BaseFormGroupType = object;
export type BaseFormArrayType<T> = readonly T[] | T[];
export type BaseFormType =
  | BaseFormControlType
  | BaseFormGroupType
  | BaseFormArrayType<unknown>;

export type FormControlOf<T extends BaseFormControlType> = FormControl<T>;

export type FormGroupOf<T extends BaseFormGroupType> = FormGroup<FormOf<T>>;

export type FormArrayOf<T extends BaseFormType> = T extends BaseFormControlType
  ? FormArray<FormControlOf<T>>
  : T extends BaseFormArrayType<infer E>
  ? E extends BaseFormType
    ? FormArray<FormArrayOf<E>>
    : never
  : T extends BaseFormGroupType
  ? FormArray<FormGroupOf<T>>
  : never;

/**
 * Map a value type to corresponding form type.
 * - primtive and Date => FormControl
 * - array => FormArray
 * - object => FormGroup
 *
 * type Value = {
 *   str: string;
 *   obj: {
 *     num: number;
 *   };
 *   arr: { elm: string }[];
 * };
 * const fb = new FormBuilder().nonNullable;
 * const valueForm: FormGroupOf<Value> = fb.group<FormOf<Value>>({
 *   str: fb.control(''),
 *   obj: fb.group({
 *     num: fb.control(0),
 *   }),
 *   arr: fb.array([{ elm: '' }].map((e) => fb.group({ elm: fb.control(e.elm) }))),
 * });
 * const value: Value = valueForm.getRawValue();
 */
export type FormOf<T extends BaseFormGroupType> = {
  [K in keyof T]: T[K] extends BaseFormControlType
    ? FormControlOf<T[K]>
    : T[K] extends BaseFormArrayType<infer E>
    ? E extends BaseFormType
      ? FormArrayOf<E>
      : never
    : T[K] extends BaseFormGroupType
    ? FormGroupOf<T[K]>
    : never;
};
