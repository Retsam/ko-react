import ko from "knockout";
import { renderHook } from "@testing-library/react";
import useObservable from "../../src/hooks/useObservable";
import { act } from "react-dom/test-utils";

test("can read from an observable", () => {
    const text = ko.observable("Joe");

    const { result } = renderHook(() => useObservable(text));
    expect(result.current).toBe("Joe");

    act(() => text("James"));
    expect(result.current).toBe("James");

    act(() => text("Jack"));
    expect(result.current).toBe("Jack");
});

test("can read from a computed", () => {
    const firstName = ko.observable("Joe");
    const lastName = ko.observable("Smith");
    const fullName = ko.computed(() => `${firstName()} ${lastName()}`);

    const { result } = renderHook(() => useObservable(fullName));

    expect(result.current).toBe("Joe Smith");

    act(() => lastName("Momma"));

    expect(result.current).toBe("Joe Momma");
});

test("behaves appropriately if the observable is swapped for a different observable", () => {
    const initialObs = ko.observable(0);
    const newObs = ko.observable(1);

    const { result, rerender } = renderHook(({ obs }) => useObservable(obs), {
        initialProps: { obs: initialObs },
    });

    expect(result.current).toBe(0);

    // Test observable swap
    rerender({ obs: newObs });
    expect(result.current).toBe(1);

    // Test update to new observable
    act(() => newObs(2));

    expect(result.current).toBe(2);
});

test("handles rateLimited computeds", () => {
    const obs = ko.observable(1);
    const rateLimited = ko
        .computed(() => obs() + 1)
        .extend({ rateLimit: 1000 });

    obs(2);

    const { result } = renderHook(() => useObservable(rateLimited));
    expect(result.current).toBe(3);
});
