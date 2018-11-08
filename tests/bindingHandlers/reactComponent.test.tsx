import ko from "knockout";
import React from "react";
import { reactComponentBindingHandler } from "../../src/index";
import { setupKoTest } from "../koTestUtils";

reactComponentBindingHandler.register();
reactComponentBindingHandler.registerShorthandSyntax();

const Greeter = ({name = "World"}: {name: string}) => ( // tslint:disable-line variable-name
    <div>Hello, {name}</div>
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
        Greeter,
        props: { name: ko.observable("John") },
    };
    const element = setupKoTest(`
        <div data-bind="reactComponent: { Component: Greeter, props: props }"></div>
    `, vm);
    expect(element.textContent).toBe("Hello, John");
    vm.props.name("Jonny");
    expect(element.textContent).toBe("Hello, Jonny");
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
