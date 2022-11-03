import {
  Directive,
  forwardRef,
  HostListener,
  inject,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Provider,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  debounceTime,
  defer,
  distinctUntilChanged,
  EMPTY,
  first,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import { rawValueChanges } from './raw-value-changes';

export type FrFormCacheValue<T> = {
  cacheKey: string;
  value: T | null;
};

@Injectable({
  providedIn: 'root',
  useExisting: forwardRef(() => FrFormCacheSessionStorageService),
})
export abstract class FrFormCacheStorageService {
  abstract getValue<T>(cacheKey: string): Observable<T | null>;
  abstract setValue<T>(cacheKey: string, value: T): Observable<boolean>;
  abstract removeValue(cacheKey: string): Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class FrBaseFormCacheStorageService
  implements FrFormCacheStorageService
{
  readonly #cachePrefix = 'FrFormCacheStorageService.';

  constructor(private readonly storage: Storage) {}

  getValue<T>(cacheKey: string): Observable<T | null> {
    return defer(() => {
      const json = this.storage.getItem(this.#cachePrefix + cacheKey);
      if (json == null) {
        return of(null);
      }

      const value = JSON.parse(json);
      return of(value);
    }).pipe(catchError((_err) => of(null)));
  }

  setValue<T>(cacheKey: string, value: T): Observable<boolean> {
    return defer(() => {
      const json = JSON.stringify(value);
      this.storage.setItem(this.#cachePrefix + cacheKey, json);
      return of(true);
    }).pipe(catchError((_err) => of(false)));
  }

  removeValue(cacheKey: string): Observable<boolean> {
    return defer(() => {
      this.storage.removeItem(this.#cachePrefix + cacheKey);
      return of(true);
    }).pipe(catchError((_err) => of(false)));
  }
}

@Injectable({
  providedIn: 'root',
})
export class FrFormCacheSessionStorageService extends FrBaseFormCacheStorageService {
  constructor() {
    super(sessionStorage);
  }
}

export const provideSessionStorageFormCache = (): Provider[] => [
  FrFormCacheSessionStorageService,
  {
    provide: FrFormCacheStorageService,
    useExisting: FrFormCacheSessionStorageService,
  },
];

@Injectable({
  providedIn: 'root',
})
export class FrFormCacheLocalStorageService extends FrBaseFormCacheStorageService {
  constructor() {
    super(localStorage);
  }
}

export const provideLocalStorageFormCache = (): Provider[] => [
  FrFormCacheLocalStorageService,
  {
    provide: FrFormCacheStorageService,
    useExisting: FrFormCacheLocalStorageService,
  },
];

/**
 * Uses a `FrFormCacheStorageService` to save the value of the attached form under the given cache-key.
 * The cache is update on (debounced) changes of the form
 * or if the directive gets destroyed
 * or the window is unloading.
 *
 * If the form is submitted or resetted the cache is cleared.
 *
 * If the cache-key is changed the current cache-value is emitted via the `cacheValueLoaded` output.
 * The using component can then decide, what to do with it.
 * The event is of type `FrFromCacheValue<T>` and contains the `cacheKey` and the `value`.
 *
 * The directive is exported as `frFormCache`
 * and offers the method `removeValue()` to manually clear the current cache-value.
 *
 * The session-storage is the default storage-service.
 *
 * ```html
 * <form
 *   [formGroup]="form"
 *   frFormCache="cacheKey"
 *   #formCache="frFormCache"
 *   (cacheValueLoaded)="gotCachedValue($event)">
 *   //...
 * </form>
 * ```
 */
@Directive({
  standalone: true,
  selector: 'form[formGroup][frFormCache]',
  exportAs: 'frFormCache',
})
export class FrFormCacheDirective<T> implements OnInit, OnDestroy {
  readonly #destroyed = new Subject<void>();
  readonly #storageService = inject(FrFormCacheStorageService);
  #isSubmitted = false;
  readonly #form = new BehaviorSubject<FormGroup | null>(null);
  readonly #cacheKey = new BehaviorSubject<string | null>(null);
  readonly #formWithCacheKey = combineLatest({
    form: this.#form.asObservable(),
    cacheKey: this.#cacheKey.asObservable(),
  });

  @Input() set frFormCache(form: FormGroup | null) {
    this.#isSubmitted = false;
    this.#form.next(form);
  }
  @Input() set cacheKey(cacheKey: string) {
    this.#isSubmitted = false;
    this.#cacheKey.next(cacheKey === '' ? null : cacheKey);
  }

  @Output() cacheValueLoaded: Observable<FrFormCacheValue<T>> =
    this.#cacheKey.pipe(
      distinctUntilChanged(),
      switchMap((cacheKey) =>
        cacheKey == null
          ? EMPTY
          : this.#storageService
              .getValue<T>(cacheKey)
              .pipe(map((value) => ({ cacheKey, value })))
      ),
      takeUntil(this.#destroyed)
    );

  @HostListener('submit')
  onSubmit(): void {
    this.#isSubmitted = true;
    this.removeValue();
  }

  ngOnInit(): void {
    this.#formWithCacheKey
      .pipe(
        switchMap(({ form, cacheKey }) => {
          return cacheKey == null || form == null
            ? EMPTY
            : rawValueChanges(form).pipe(
                debounceTime(1_000),
                switchMap((value) =>
                  this.#storageService
                    .setValue(cacheKey, value)
                    .pipe(map(() => value))
                )
              );
        }),
        takeUntil(this.#destroyed)
      )
      .subscribe();

    merge(fromEvent(window, 'beforeunload'), this.#destroyed)
      .pipe(
        switchMap(() => {
          const form = this.#form.value;
          const cacheKey = this.#cacheKey.value;
          if (
            form == null ||
            cacheKey == null ||
            !form.dirty ||
            this.#isSubmitted
          ) {
            return EMPTY;
          }

          const value = form.getRawValue();
          return this.#storageService.setValue(cacheKey, value);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.#destroyed.next();
    this.#destroyed.complete();
  }

  removeValue(): void {
    this.#cacheKey
      .pipe(
        first(),
        concatMap((cacheKey) =>
          cacheKey == null ? EMPTY : this.#storageService.removeValue(cacheKey)
        )
      )
      .subscribe();
  }
}
