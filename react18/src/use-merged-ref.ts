import { Ref, useCallback, type RefCallback } from "react";

type PossibleRef<T> = Ref<T> | undefined;

type RefCleanup<T> = ReturnType<RefCallback<T>>;

export function assignRef<T>(ref: PossibleRef<T>, value: T): RefCleanup<T> {
  if (typeof ref === "function") {
    return ref(value);
  } else if (typeof ref === "object" && ref !== null && "current" in ref) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

export function mergeRefs<T>(...refs: PossibleRef<T>[]) {
  // React 19はref callbackが関数を返す場合、それをcleanup関数として扱う
  // cleanup関数がある場合、unmount時にそれを呼び出し、ref callbackを引数nullで呼び出さなくなる

  // RefCallbackが関数を返している場合、React 18を使用しているプロジェクトではref(null)がスキップされないが、
  // useMergedRefを介する場合にはref(null)がスキップされる

  const cleanupMap = new Map<PossibleRef<T>, RefCleanup<T> | null>();

  return (node: T | null) => {
    if (node !== null) {
      refs.forEach((ref) => {
        cleanupMap.set(ref, assignRef(ref, node) ?? null);
      });
    } else {
      refs.forEach((ref) => {
        const cleanup = cleanupMap.get(ref);
        if (cleanup) {
          cleanup();
        } else {
          assignRef(ref, null);
        }
      });
      cleanupMap.clear();
    }
  };
}

export function useMergedRef<T>(...refs: PossibleRef<T>[]) {
  return useCallback(mergeRefs(...refs), refs);
}
