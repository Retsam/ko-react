import ko from "knockout";
import { renderHook } from "@testing-library/react";
import useSubscription from "../../src/hooks/useSubscription";

test("executes the callback whenever the subscription is fired", () => {
    const subscribable = new ko.subscribable<string>();
    const callbackFn = jest.fn();

    renderHook(() => useSubscription(subscribable, callbackFn));

    expect(callbackFn).not.toHaveBeenCalled();

    subscribable.notifySubscribers("Foo");
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("Foo");

    subscribable.notifySubscribers("Bar");
    expect(callbackFn).toHaveBeenCalledTimes(2);
    expect(callbackFn).toHaveBeenCalledWith("Bar");
});

test("does not cause additional renders when the observable changes", () => {
    const subscribable = new ko.subscribable<string>();
    const renderSpy = jest.fn();
    const callbackFn = jest.fn();

    renderHook(() => {
        renderSpy();
        subscribable.subscribe(callbackFn);
    });

    expect(renderSpy).toHaveBeenCalledTimes(1);

    subscribable.notifySubscribers("Foo");
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledTimes(1);
});

test("correctly handles closure state inside callbacks", () => {
    const callbackFn = jest.fn();
    const subscribable = new ko.subscribable<string>();

    const { rerender } = renderHook(
        ({ prop }) => {
            useSubscription(subscribable, value => {
                callbackFn(`${value} ${prop}`);
            });
        },
        { initialProps: { prop: "initial" } },
    );

    subscribable.notifySubscribers("foo");
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("foo initial");

    rerender({ prop: "updated" });

    subscribable.notifySubscribers("bar");
    expect(callbackFn).toHaveBeenCalledTimes(2);
    expect(callbackFn).toHaveBeenCalledWith("bar updated");
});

test("correctly handles the observable being changed", () => {
    const callbackFn = jest.fn();

    const sub1 = new ko.subscribable<void>();
    const sub2 = new ko.subscribable<void>();

    const { rerender } = renderHook(
        ({ sub }) => useSubscription(sub, callbackFn),
        { initialProps: { sub: sub1 } },
    );

    sub1.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(1);

    sub2.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(1);

    rerender({ sub: sub2 });

    sub1.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(1);

    sub2.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(2);
});

test("disposes the subscription when the component is unmounted", () => {
    const subscribable = new ko.subscribable<string>();
    const callbackFn = jest.fn();

    const { unmount } = renderHook(() =>
        useSubscription(subscribable, callbackFn),
    );

    subscribable.notifySubscribers("Foo");
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("Foo");

    unmount();

    subscribable.notifySubscribers("Bar");
    expect(callbackFn).toHaveBeenCalledTimes(1);
});
