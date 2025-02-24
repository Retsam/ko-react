import { renderHook } from "@testing-library/react";
import useMemoWithDisposer from "../../../src/hooks/utils/useMemoWithDisposer";

test("memoizes values", () => {
    const memoizedFunc = jest.fn();

    const { rerender } = renderHook(
        ({ a }) => {
            useMemoWithDisposer(
                memoizedFunc,
                () => {
                    /*dispose*/
                },
                [a],
            );
        },
        { initialProps: { a: 1, b: 2 } },
    );

    expect(memoizedFunc).toHaveBeenCalledTimes(1);

    // Change memoized prop
    rerender({ a: 2, b: 2 });
    expect(memoizedFunc).toHaveBeenCalledTimes(2);

    // Change non-memoized prop
    rerender({ a: 2, b: 3 });
    expect(memoizedFunc).toHaveBeenCalledTimes(2);
});

test("disposes previously memoized values", () => {
    const disposerFunc = jest.fn();

    const { rerender } = renderHook(
        ({ a }) => {
            useMemoWithDisposer(() => a, disposerFunc, [a]);
        },
        { initialProps: { a: "Initial value" } },
    );

    expect(disposerFunc).not.toHaveBeenCalled();

    rerender({ a: "New val" });
    expect(disposerFunc).toHaveBeenCalledWith("Initial value");

    rerender({ a: "3" });
    expect(disposerFunc).toHaveBeenCalledWith("New val");
    expect(disposerFunc).toHaveBeenCalledTimes(2);
});

test("disposes last memoized value on unmount", () => {
    const disposerFunc = jest.fn();

    const { unmount } = renderHook(
        ({ a }) => {
            useMemoWithDisposer(() => a, disposerFunc, [a]);
        },
        { initialProps: { a: "Initial value" } },
    );

    expect(disposerFunc).not.toHaveBeenCalled();

    unmount();
    expect(disposerFunc).toHaveBeenCalledTimes(1);
    expect(disposerFunc).toHaveBeenCalledWith("Initial value");
});
