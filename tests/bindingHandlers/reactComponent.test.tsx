import ko from "knockout";
import React from "react";
import { reactComponentBindingHandler } from "../../src/index";
import { setupKoTest } from "../koTestUtils";
import { act, waitFor } from "@testing-library/react";

reactComponentBindingHandler.register();
reactComponentBindingHandler.registerShorthandSyntax();

const Greeter = ({ name = "World" }: { name: string }) => (
    <div>Hello, {name}</div>
);
const ObservableGreeter = (
    { name }: { name: KnockoutObservable<string> }, // tslint:disable-line variable-name
) => <div>Hello, {name()}</div>;

test("renders the component", async () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(
        `
        <div data-bind="reactComponent: { Component: Greeter }"></div>
    `,
        vm,
    );
    await waitFor(() => expect(element.textContent).toBe("Hello, World"));
});

test("accepts props", async () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(
        `
        <div data-bind="reactComponent: { Component: Greeter, props: { name: 'Mark' } }"></div>
    `,
        vm,
    );
    await waitFor(() => expect(element.textContent).toBe("Hello, Mark"));
});

test("accepts params for backwards compatibility", async () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(
        `
        <div data-bind="reactComponent: { Component: Greeter, params: { name: 'Mark' } }"></div>
    `,
        vm,
    );
    await waitFor(() => expect(element.textContent).toBe("Hello, Mark"));
});

test("props can be an observable", async () => {
    const vm = {
        Greeter,
        props: ko.observable({ name: "Susan" }),
    };
    const element = setupKoTest(
        `
        <div data-bind="reactComponent: { Component: Greeter, props: props }"></div>
    `,
        vm,
    );
    await waitFor(() => expect(element.textContent).toBe("Hello, Susan"));
    act(() => vm.props({ name: "Susie" }));
    await waitFor(() => expect(element.textContent).toBe("Hello, Susie"));
});
test("props can contain an observable", async () => {
    const vm = {
        ObservableGreeter,
        props: { name: ko.observable("John") },
    };
    const element = setupKoTest(
        `
        <div data-bind="reactComponent: { Component: ObservableGreeter, props: props }"></div>
    `,
        vm,
    );
    await waitFor(() => expect(element.textContent).toBe("Hello, John"));
    act(() => vm.props.name("Jonny"));
    // Still John, because changing observables only causes rerenders if
    //   wrapped in useObserve, useComputed, etc.
    // Hard to test a negative since the changes are a bit asynchronous
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(element.textContent).toBe("Hello, John");
});

test("renders the component with shorthand notation", async () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(
        `
        <div><!-- react: Greeter {name: "Joe"} --></div>
    `,
        vm,
    );
    await waitFor(() => expect(element.textContent).toBe("Hello, Joe"));
});
