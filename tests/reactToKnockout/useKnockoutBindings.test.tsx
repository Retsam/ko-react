import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import useKnockoutBindings from "../../src/reactToKnockout/useKnockoutBindings";
import { mount } from "../enzyme";

let container: HTMLDivElement;
beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

afterEach(() => {
    document.body.removeChild(container);
    container = null;
});


test("can apply knockout bindings to an element", () => {
    const TestComponent = () => {
        const elementRef = useRef<HTMLDivElement>(null);
        useKnockoutBindings(elementRef, {});
        return <div ref={elementRef} data-bind="text: 'Test'" />;
    };

    const element = mount(<TestComponent />);
    expect(element.text()).toBe("Test");
});

test("can apply bindings to an element with data", () => {
    const TestComponent = () => {
        const vm = { text: 'Hello' };
        const elementRef = useRef<HTMLDivElement>(null);
        useKnockoutBindings(elementRef, vm);
        return <div ref={elementRef} data-bind="text: text" />;
    };

    const element = mount(<TestComponent />);
    expect(element.text()).toBe("Hello");
});

test("can change the data that is applied to the bindings", () => {
    const TestComponent = (props: {text: string}) => {
        const elementRef = useRef<HTMLDivElement>(null);
        useKnockoutBindings(elementRef, props);
        return <div ref={elementRef} data-bind="text: text" />;
    };
    act(() => {
        ReactDOM.render(<TestComponent text="hello" />, container);
    });
    const element = container.querySelector('div');
    expect(element.textContent).toBe('hello');

    act(() => {
        ReactDOM.render(<TestComponent text="there" />, container);
    });
    expect(element.textContent).toBe('there');
});
