import React, { useRef } from "react";
import { render, screen } from "@testing-library/react";
import useKnockoutBindings from "../../src/reactToKnockout/useKnockoutBindings";

test("can apply knockout bindings to an element", () => {
    const TestComponent = () => {
        const elementRef = useRef<HTMLDivElement>(null);
        useKnockoutBindings(elementRef, {});
        return <div ref={elementRef} data-bind="text: 'Test'" />;
    };

    render(<TestComponent />);
    expect(screen.getByText("Test")).toBeTruthy();
});

test("can apply bindings to an element with data", () => {
    const TestComponent = () => {
        const vm = { text: "Hello" };
        const elementRef = useRef<HTMLDivElement>(null);
        useKnockoutBindings(elementRef, vm);
        return <div ref={elementRef} data-bind="text: text" />;
    };

    render(<TestComponent />);
    expect(screen.getByText("Hello")).toBeTruthy();
});

test("can change the data that is applied to the bindings", () => {
    const TestComponent = ({ text }: { text: string }) => {
        const elementRef = useRef<HTMLDivElement>(null);
        useKnockoutBindings(elementRef, { text });
        return <div ref={elementRef} data-bind="text: text" />;
    };

    const { rerender } = render(<TestComponent text="hello" />);
    expect(screen.getByText("hello")).toBeTruthy();

    rerender(<TestComponent text="there" />);
    expect(screen.getByText("there")).toBeTruthy();
});
