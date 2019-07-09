import ko from "knockout";
import React from "react";
import useSubscription from "../../src/hooks/useSubscription";
import { mount } from "../enzyme";

test("executes the callback whenever the subscription is fired", () => {
    // ko.subscribable is the supertype of observables and computeds
    const subscribable = new ko.subscribable<string>();
    const callbackFn = jest.fn();
    const Component = () => {
        useSubscription(subscribable, callbackFn);

        return <></>;
    };
    mount(<Component />);

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

    const Component = () => {
        renderSpy();
        subscribable.subscribe(callbackFn);
        return <></>;
    };

    mount(<Component />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    subscribable.notifySubscribers("Foo");
    expect(renderSpy).toHaveBeenCalledTimes(1);
});

test("correctly handles closure state inside callbacks", () => {
    const callbackFn = jest.fn();
    const subscribable = new ko.subscribable<string>();

    const Component = ({prop}: {prop: string}) => {
        useSubscription(subscribable, (value) => {
            // Passes the current value of prop to the callback
            callbackFn(`${value} ${prop}`);
        });
        return <></>;
    };
    const element = mount(<Component prop={"initial"} />);

    subscribable.notifySubscribers("foo");
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("foo initial");

    element.setProps({prop: "updated"});

    subscribable.notifySubscribers("bar");
    expect(callbackFn).toHaveBeenCalledTimes(2);
    expect(callbackFn).toHaveBeenCalledWith("bar updated");
});

test("correctly handles the observable being changed", () => {
    const callbackFn = jest.fn();

    const Component = ({sub}: { sub: KnockoutSubscribable<void>; }) => {
        useSubscription(sub, callbackFn);
        return <></>;
    };

    const sub1 = new ko.subscribable<void>();
    const sub2 = new ko.subscribable<void>();

    const element = mount(<Component sub={sub1} />);

    // Triggeres the callback
    sub1.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(1);

    // Does not trigger the callback
    sub2.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(1);

    // Swap the subscribable
    element.setProps({sub: sub2});

    // Does not trigger the callback
    sub1.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(1);

    // Triggers the callback
    sub2.notifySubscribers();
    expect(callbackFn).toHaveBeenCalledTimes(2);
});

test("disposes the subscription when the component is unmounted", () => {
    const subscribable = new ko.subscribable<string>();
    const callbackFn = jest.fn();
    const Component = () => {
        useSubscription(subscribable, callbackFn);

        return <></>;
    };
    const element = mount(<Component />);

    subscribable.notifySubscribers("Foo");
    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(callbackFn).toHaveBeenCalledWith("Foo");

    element.unmount();

    subscribable.notifySubscribers("Bar");
    expect(callbackFn).toHaveBeenCalledTimes(1);
});
