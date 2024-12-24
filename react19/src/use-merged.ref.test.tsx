import React, { createRef, useRef } from "react";
import { afterAll, describe, expect, test, vi } from "vitest";
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

describe("react 19", () => {
  const consoleMock = vi.spyOn(console, "error");

  afterAll(() => {
    consoleMock.mockRestore();
  });

  test("version", () => {
    expect(React.version).toBe("19.0.0");
  });

  describe("react behavior", () => {
    test("When ref callback does not return a function, ref callback is called with null on unmount", () => {
      const refCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
      };

      const { unmount } = render(<button ref={fnRef} />);
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);

      unmount();
      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`[]`);
    });

    test("When ref callback returns a function, ref callback is not called with null on unmount, instead cleanup fn is called", () => {
      const refCalled: unknown[] = [];
      const cleanupCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
        // vi.fn() is not considered as a cleanup function
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

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`[]`);
    });
  });

  describe("useMergedRef", () => {
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

    test("When ref callback does not return a function, ref callback is called with null on unmount", () => {
      const refCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
      };

      const { unmount } = render(<button ref={fnRef} />);
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);

      unmount();
      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`[]`);
    });

    test("When ref callback returns a function, ref callback is not called with null on unmount, instead cleanup fn is called", () => {
      console.log("useMergedRef");
      const refCalled: unknown[] = [];
      const cleanupCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
        return () => {
          cleanupCalled.push(node);
        };
      };

      const { unmount } = render(<TestComponent refs={[fnRef]} />);
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
      expect(cleanupCalled).toEqual([]);

      unmount();
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
      expect(cleanupCalled).toEqual([expect.any(HTMLButtonElement)]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`[]`);
    });

    test("When a mix of ref callbacks that return a function and those that do not, each behaves accordingly", () => {
      const refCalled: unknown[] = [];
      const cleanupCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
        return () => {
          cleanupCalled.push(node);
        };
      };

      const ref2Called: unknown[] = [];
      const fnRef2 = (node: HTMLButtonElement | null) => {
        ref2Called.push(node);
      };

      const { unmount } = render(<TestComponent refs={[fnRef, fnRef2]} />);

      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
      expect(ref2Called).toEqual([expect.any(HTMLButtonElement)]);

      unmount();

      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
      expect(ref2Called).toEqual([expect.any(HTMLButtonElement), null]);

      expect(cleanupCalled).toEqual([expect.any(HTMLButtonElement)]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`[]`);
    });
  });
});
