import React, { createRef, useRef, type Ref } from "react";
import { describe, expect, test, vi } from "vitest";
import { useMergedRef } from "./use-merged-ref";
import { render } from "@testing-library/react";

function TestComponent({
  refs,
}: {
  refs: React.ForwardedRef<HTMLButtonElement>[];
}) {
  const ref = useRef<HTMLButtonElement>(null);
  return <button ref={useMergedRef(...refs, ref)} type="button" />;
}

describe("useMergedRef", () => {
  test("react 19", () => {
    expect(React.version).toBe("19.0.0");
  });

  test("assigns refs to all given arguments", () => {
    const objectRef = createRef<HTMLButtonElement | null>();
    let fnRefValue: HTMLButtonElement | null = null;
    const fnRef = (node: HTMLButtonElement | null) => {
      fnRefValue = node;
    };

    render(<TestComponent refs={[objectRef, fnRef]} />);
    expect(fnRefValue! instanceof HTMLButtonElement).toBe(true);
    expect(objectRef.current instanceof HTMLButtonElement).toBe(true);
  });

  test("ref callbackが関数を返さないとき、unmount時にref callbackがnullで呼び出される", () => {
    const fnRef = vi.fn();

    const { unmount } = render(<TestComponent refs={[fnRef]} />);
    expect(fnRef).toHaveBeenCalledTimes(1);
    expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));

    unmount();
    expect(fnRef).toHaveBeenCalledTimes(2);
    expect(fnRef).toHaveBeenCalledWith(null);
  });

  test("ref callbackが関数を返すとき、unmount時にref callbackがnullで呼び出されず、代わりにcleanup fnが呼び出される", () => {
    const refCalled: unknown[] = [];
    const cleanupCalled: unknown[] = [];

    const fnRef = (node: HTMLButtonElement | null) => {
      refCalled.push(node);
      // vi.fn()はcleanup関数と見なされないので使えない
      return () => {
        cleanupCalled.push(node);
      };
    };

    const { unmount } = render(<button ref={fnRef} />);
    expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
    expect(cleanupCalled).toEqual([]);

    unmount();
    expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
    expect(cleanupCalled).toEqual([expect.any(HTMLButtonElement)]);
  });
});
