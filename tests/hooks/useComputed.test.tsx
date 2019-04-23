import ko from "knockout";
import React, { useState } from "react";
import { act } from "react-dom/test-utils";
import useComputed from "../../src/hooks/useComputed";
import { mount } from "../enzyme";

test("can compute JSX based on observables", () => {
    interface ComponentProps { firstName: KnockoutObservable<string>; lastName: KnockoutObservable<string>; }
    const Component = ({firstName, lastName}: ComponentProps) => (
        useComputed(() => (
            <div>{firstName()} {lastName()}</div>
        ))
    );
    const firstName = ko.observable("Bob");
    const lastName = ko.observable("Ross");
    const element = mount(<Component firstName={firstName} lastName={lastName} />);
    expect(element.text()).toBe("Bob Ross");
    act(() => {
        lastName("Jones");
    });
    expect(element.text()).toBe("Bob Jones");
});

test("doesn't call the render or computed function unnecessarily", () => {
    interface ComponentProps { c: KnockoutObservable<number>; }
    let renderCount = 0;
    let computedCount = 0;
    const Component = ({c}: ComponentProps) => {
        renderCount++;
        return useComputed(() => {
            computedCount++;
            return (
            <div>{c()}</div>
            );
        }, []);
    };
    const count = ko.observable(0);
    mount(<Component c={count} />);
    expect(renderCount).toBe(1);
    expect(computedCount).toBe(1);
    act(() => {
        count(count() + 1);
    });
    expect(renderCount).toBe(2);
    expect(computedCount).toBe(2);
});

test("can be used with closure values" , () => {
    const Counter = () => {
        const [count, setCount] = useState(0);
        // NOT passing a dependency array: behaves correctly, but may compute more often than necessary
        return useComputed(() => (
            <div onClick={() => setCount(count + 1)}>Value is {count}</div>
        ));
    };
    const element = mount(<Counter />);
    act(() => {
        element.simulate('click');
    });
    expect(element.text()).toBe("Value is 1");
});

test("doesn't call the render or computed function unnecessarily with deps", () => {
    let renderCount = 0;
    let computedCount = 0;
    const Counter = ({plus}: {plus: KnockoutObservable<number>}) => {
        renderCount++;
        const [count, setCount] = useState(0);
        return useComputed(() => (
            computedCount++,
            <div onClick={() => setCount(count + 1)}>Value is {count + plus()}</div>
        ), [count]);
    };
    const plus = ko.observable(0);
    const element = mount(<Counter plus={plus} />);
    expect(renderCount).toBe(1);
    expect(computedCount).toBe(1);
    expect(element.text()).toBe("Value is 0");

    // Update observable state
    act(() => {
        plus(2);
    });
    expect(renderCount).toBe(2);
    expect(computedCount).toBe(2);
    expect(element.text()).toBe("Value is 2");

    // Update non-observable state
    act(() => {
        element.simulate('click');
    });
    expect(renderCount).toBe(3);
    expect(computedCount).toBe(3);
    expect(element.text()).toBe("Value is 3");
});
