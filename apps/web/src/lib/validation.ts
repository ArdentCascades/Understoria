/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useCallback, useMemo, useState } from "react";

// Tiny inline-validation toolkit. Two halves:
//
//   1. Pure validator combinators (`required`, `positiveNumber`,
//      `positiveInteger`, `optional`) that take a value and return
//      either `null` (valid) or a `FieldError` carrying an i18n key
//      and optional interpolation values.
//   2. A `useFieldValidation` hook that tracks "has this field been
//      touched yet" so we can hold off showing errors until the
//      member has actually interacted with the field (or attempted
//      to submit).
//
// We intentionally don't bundle a `<Field>` component or rendering
// helper — the existing forms have varied layouts (labels with
// hints, two-column grids, select vs input) and forcing them all
// through one wrapper would balloon the diff. The hook gives the
// state; the forms render it.

export interface FieldError {
  /** i18n key. */
  key: string;
  /** Optional interpolation values for `t(error.key, error.values)`. */
  values?: Record<string, string | number>;
}

export type Validator = (value: string) => FieldError | null;

/** Combine validators left-to-right; return the first error. */
export function combine(...validators: Validator[]): Validator {
  return (value) => {
    for (const v of validators) {
      const err = v(value);
      if (err) return err;
    }
    return null;
  };
}

/** Only run the inner validator when the field is non-empty. Useful
 *  for optional numeric fields ("expires in N days, blank = no
 *  expiry") where empty must NOT be flagged as an error. */
export function optional(inner: Validator): Validator {
  return (value) => (value.trim() === "" ? null : inner(value));
}

export function required(messageKey: string): Validator {
  return (value) =>
    value.trim() === "" ? { key: messageKey } : null;
}

export function positiveNumber(messageKey: string): Validator {
  return (value) => {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) && n > 0 ? null : { key: messageKey };
  };
}

export function positiveInteger(messageKey: string): Validator {
  return (value) => {
    if (!/^[0-9]+$/.test(value.trim())) return { key: messageKey };
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? null : { key: messageKey };
  };
}

export interface UseFieldValidationResult<F extends string> {
  /** Computed error for every field, regardless of touched state.
   *  Use `shouldShowError` to decide whether to render it. */
  errors: Readonly<Record<F, FieldError | null>>;
  /** Whether the field has been blurred or a submit was attempted. */
  touched: Readonly<Record<F, boolean>>;
  /** Convenience: render the field's error iff it's been touched. */
  shouldShowError: (field: F) => boolean;
  /** Wire this to `<input onBlur={() => onBlur('title')}>`. */
  onBlur: (field: F) => void;
  /** Call on submit attempt; marks every field touched so untouched
   *  required fields surface their errors before the handler runs. */
  markAllTouched: () => void;
  /** True iff any field currently has an error. */
  hasErrors: boolean;
}

export function useFieldValidation<F extends string>(
  values: Readonly<Record<F, string>>,
  validators: Readonly<Record<F, Validator>>,
): UseFieldValidationResult<F> {
  const fieldKeys = useMemo(
    () => Object.keys(validators) as F[],
    [validators],
  );

  const [touched, setTouched] = useState<Record<F, boolean>>(() => {
    const t = {} as Record<F, boolean>;
    for (const key of fieldKeys) t[key] = false;
    return t;
  });

  const errors = useMemo(() => {
    const e = {} as Record<F, FieldError | null>;
    for (const key of fieldKeys) {
      e[key] = validators[key](values[key]);
    }
    return e;
  }, [values, validators, fieldKeys]);

  const hasErrors = useMemo(
    () => fieldKeys.some((k) => errors[k] !== null),
    [errors, fieldKeys],
  );

  const onBlur = useCallback((field: F) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const key of fieldKeys) {
        if (!next[key]) {
          next[key] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [fieldKeys]);

  const shouldShowError = useCallback(
    (field: F) => touched[field] && errors[field] !== null,
    [touched, errors],
  );

  return {
    errors,
    touched,
    shouldShowError,
    onBlur,
    markAllTouched,
    hasErrors,
  };
}
