import ko from "knockout";
import React from "react";
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
        });
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
