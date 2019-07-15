import ko from "knockout";
import React from "react";
import { reactComponentBindingHandler } from "../../src/index";
import { setupKoTest } from "../koTestUtils";

reactComponentBindingHandler.register();
reactComponentBindingHandler.registerShorthandSyntax();

const Greeter = ({name = "World"}: {name: string}) => (
    <div>Hello, {name}</div>
);
const ObservableGreeter = ({name}: {name: KnockoutObservable<string>}) => ( // tslint:disable-line variable-name
    <div>Hello, {name()}</div>
);

test("renders the component", () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(`
        <div data-bind="reactComponent: { Component: Greeter }"></div>
    `, vm);
    expect(element.textContent).toBe("Hello, World");
});

test("accepts props", () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(`
        <div data-bind="reactComponent: { Component: Greeter, props: { name: 'Mark' } }"></div>
    `, vm);
    expect(element.textContent).toBe("Hello, Mark");
});

test("accepts params for backwards compatibility", () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(`
        <div data-bind="reactComponent: { Component: Greeter, params: { name: 'Mark' } }"></div>
    `, vm);
    expect(element.textContent).toBe("Hello, Mark");
});

test("props can be an observable", () => {
    const vm = {
        Greeter,
        props: ko.observable({name: "Susan"}),
    };
    const element = setupKoTest(`
        <div data-bind="reactComponent: { Component: Greeter, props: props }"></div>
    `, vm);
    expect(element.textContent).toBe("Hello, Susan");
    vm.props({name: "Susie"});
    expect(element.textContent).toBe("Hello, Susie");
});
test("props can contain an observable", () => {
    const vm = {
        ObservableGreeter,
        props: { name: ko.observable("John") },
    };
    const element = setupKoTest(`
        <div data-bind="reactComponent: { Component: ObservableGreeter, props: props }"></div>
    `, vm);
    expect(element.textContent).toBe("Hello, John");
    vm.props.name("Jonny");
    // Still John, because changing observables only causes rerenders if
    //   wrapped in useObserve, useComputed, etc.
    expect(element.textContent).toBe("Hello, John");
});

test("renders the component with shorthand notation", () => {
    const vm = {
        Greeter,
    };
    const element = setupKoTest(`
        <div><!-- react: Greeter {name: "Joe"} --></div>
    `, vm);
    expect(element.textContent).toBe("Hello, Joe");
});
