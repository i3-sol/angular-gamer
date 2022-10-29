import {
  Directive,
  forwardRef,
  inject,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ControlContainer } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  EMPTY,
  filter,
  map,
  NEVER,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { rawValueChanges } from './raw-value-changes';

@Injectable({
  providedIn: 'root',
  useExisting: forwardRef(() => FrFormCacheSessionStorageService),
})
export abstract class FrFormCacheStorageService {
  abstract getValue<T>(cacheKey: string): Observable<T | null>;
  abstract setValue<T>(cacheKey: string, value: T): Observable<void>;
  abstract removeValue(cacheKey: string): Observable<void>;
}

@Injectable({
  providedIn: 'root',
})
export class FrFormCacheSessionStorageService
  implements FrFormCacheStorageService
{
  readonly #cachePrefix = 'SessionFormCacheStorageService.';

  getValue<T>(cacheKey: string): Observable<T | null> {
    try {
      const json = sessionStorage.getItem(this.#cachePrefix + cacheKey);
      if (json != null) {
        const value = JSON.parse(json);
        return of(value);
      }
    } catch {
      // ignore
    }
    return of(null);
  }

  setValue<T>(cacheKey: string, value: T): Observable<void> {
    try {
      const json = JSON.stringify(value);
      sessionStorage.setItem(this.#cachePrefix + cacheKey, json);
    } catch {
      // ignore
    }
    return EMPTY;
  }

  removeValue(cacheKey: string): Observable<void> {
    try {
      sessionStorage.removeItem(this.#cachePrefix + cacheKey);
    } catch {
      // ignore
    }
    return EMPTY;
  }
}

@Directive({
  selector: 'form[formGroup][frFormCacheKey]',
  standalone: true,
})
export class FrFormCacheDirective<T> implements OnInit, OnDestroy {
  readonly #destroyed = new Subject<void>();
  readonly #container = inject(ControlContainer, { self: true });
  readonly #storageService = inject(FrFormCacheStorageService);

  #cacheKey = new BehaviorSubject<string>('');
  @Input() set frFormCacheKey(cacheKey: string) {
    this.#cacheKey.next(cacheKey);
  }

  @Output() cachedValue: Observable<T> = this.#cacheKey.pipe(
    filter((cacheKey) => cacheKey !== ''),
    switchMap((cacheKey) => this.#storageService.getValue<T>(cacheKey)),
    filter((value) => value != null),
    map((value) => value as T),
    takeUntil(this.#destroyed)
  );

  ngOnInit(): void {
    this.#cacheKey
      .pipe(
        filter((cacheKey) => cacheKey !== ''),
        switchMap((cacheKey) => {
          const value$ =
            this.#container.control == null
              ? NEVER
              : rawValueChanges(this.#container.control).pipe(
                  debounceTime(500)
                );
          return combineLatest({ cacheKey: of(cacheKey), value: value$ });
        }),
        switchMap(({ cacheKey, value }) =>
          this.#storageService.setValue(cacheKey, value)
        ),
        takeUntil(this.#destroyed)
      )
      .subscribe();

    this.#destroyed.pipe(switchMap(() => this.#cacheKey)).subscribe({
      next: (cacheKey) => {
        if (cacheKey !== '' && this.#container.control != null) {
          const value = this.#container.control.getRawValue();
          this.#storageService.setValue(cacheKey, value).subscribe();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.#destroyed.next();
    this.#destroyed.complete();
  }
}
