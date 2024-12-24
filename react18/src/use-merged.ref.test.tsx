import React, { createRef, useRef, type ForwardedRef } from "react";
import { afterAll, describe, expect, test, vi } from "vitest";
import { useMergedRef } from "./use-merged-ref";
import { render } from "@testing-library/react";

function TestComponent({ refs }: { refs: ForwardedRef<HTMLButtonElement>[] }) {
  const ref = useRef<HTMLButtonElement>(null);
  return <button ref={useMergedRef(...refs, ref)} type="button" />;
}

describe("react 18", () => {
  const consoleMock = vi.spyOn(console, "error");

  afterAll(() => {
    consoleMock.mockRestore();
  });

  test("version", () => {
    expect(React.version).toBe("18.3.1");
  });

  describe("react behavior", () => {
    test("when ref callback does not return a function, ref callback is called with null on unmount", () => {
      const refCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
        // vi.fn() is not considered a cleanup function
      };

      const { unmount } = render(<button ref={fnRef} />);
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);

      unmount();
      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`[]`);
    });

    test("when ref callback returns a function, ref callback is called with null on unmount", () => {
      const refCalled: unknown[] = [];
      const cleanupCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
        return () => {
          cleanupCalled.push(node);
        };
      };

      const { unmount } = render(<button ref={fnRef} />);
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);
      expect(cleanupCalled).toEqual([]);

      unmount();
      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);
      expect(cleanupCalled).toEqual([]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.%s",
          "button",
          "
          at button",
        ],
        [
          "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.",
          "button",
        ],
      ]
    `);
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

    test("when ref callback does not return a function, ref callback is called with null on unmount", () => {
      const refCalled: unknown[] = [];

      const fnRef = (node: HTMLButtonElement | null) => {
        refCalled.push(node);
      };

      const { unmount } = render(<TestComponent refs={[fnRef]} />);
      expect(refCalled).toEqual([expect.any(HTMLButtonElement)]);

      unmount();
      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);
    });

    test("when ref callback returns a function, ref callback is called with null on unmount", () => {
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
      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);
      expect(cleanupCalled).toEqual([]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.%s",
            "button",
            "
            at button",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.",
            "button",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.%s",
            "button",
            "
            at button
            at TestComponent (/Users/elecdeer/Dev/etude/react-19-use-merge-ref/react18/src/use-merged.ref.test.tsx:11:26)",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.",
            "button",
          ],
        ]
      `);
    });

    test("when ref callbacks that return a function and those that do not are mixed, each behaves accordingly", () => {
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

      expect(refCalled).toEqual([expect.any(HTMLButtonElement), null]);
      expect(ref2Called).toEqual([expect.any(HTMLButtonElement), null]);

      expect(cleanupCalled).toEqual([]);

      expect(consoleMock.mock.calls).toMatchInlineSnapshot(`
        [
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.%s",
            "button",
            "
            at button",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.",
            "button",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.%s",
            "button",
            "
            at button
            at TestComponent (/Users/elecdeer/Dev/etude/react-19-use-merge-ref/react18/src/use-merged.ref.test.tsx:11:26)",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.",
            "button",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.%s",
            "button",
            "
            at button
            at TestComponent (/Users/elecdeer/Dev/etude/react-19-use-merge-ref/react18/src/use-merged.ref.test.tsx:11:26)",
          ],
          [
            "Warning: Unexpected return value from a callback ref in %s. A callback ref should not return a function.",
            "button",
          ],
        ]
      `);
    });
  });
});
