import { observe } from "../src/index";
import ko from "knockout";
import React from "react";
import { mount, shallow, StatelessComponent } from "./enzyme";

// tslint:disable variable-name
test("accepts stateless components", () => {
    const TestComponent = observe(() => (
        <div>Test</div>
    ));
    const element = shallow(<TestComponent />);
    expect(element.equals(<div>Test</div>));
});

test("accepts component classes", () => {
    const TestComponent = observe(class extends React.Component {
        render() {
            return <div>Test</div>;
        }
    });
    const element = shallow(<TestComponent />);
    expect(element.equals(<div>Test</div>));
});

test("re-renders when an observable changes", () => {
    const observable = ko.observable("Hello");

    const renderFn = jest.fn(() => (
        <div>{observable()}</div>
    ));
    const TestComponent = observe(renderFn);

    const element = shallow(<TestComponent />);
    expect(element.equals(<div>Hello</div>));
    expect(renderFn).toHaveBeenCalledTimes(1);

    observable("There");
    expect(element.equals(<div>There</div>));
    expect(renderFn).toHaveBeenCalledTimes(2);

    observable("General Kenobi");
    expect(element.equals(<div>General Kenobi</div>));
    expect(renderFn).toHaveBeenCalledTimes(3);
});

test("re-renders on prop changes, as normal", () => {
    interface ChildProps { text: string; }
    const childRenderFn = jest.fn(({text}: ChildProps) => (
        <div>{text}</div>
    ));
    const ChildComponent = observe(childRenderFn as StatelessComponent<ChildProps>);
    const TestComponent = observe(class extends React.Component<{}, {text: string}> {
        constructor(props: {}) {
            super(props);
            this.state = {
                text: "Foo",
            };
        }
        render() {
            return <ChildComponent text={this.state.text} />;
        }
    });

    const component = mount(<TestComponent />);
    expect(childRenderFn).toHaveBeenCalledTimes(1);
    component.setState({ text: "Bar" });
    expect(childRenderFn).toHaveBeenCalledTimes(2);

    expect(component.childAt(0).childAt(0).text()).toBe("Bar");

});

test("tracks observables properly", () => {
    const usingNickname = ko.observable(false);
    const nickname = ko.observable("The Senate");
    const realName = ko.observable("Sheev");

    const renderFn = jest.fn(() => (
        <div>{usingNickname() ? nickname() : realName()}</div>
    )) as StatelessComponent<{}>;
    const TestComponent = observe(renderFn as StatelessComponent<{}>);
    const element = shallow(<TestComponent />);

    expect(element.equals(<div>Sheev</div>)).toBe(true);
    expect(renderFn).toHaveBeenCalledTimes(1);

    nickname("Vader");
    // No re-render, shouldn't be observing the nickname() observable
    expect(renderFn).toHaveBeenCalledTimes(1);

    realName("Anakin");
    expect(renderFn).toHaveBeenCalledTimes(2);

    usingNickname(true);
    expect(renderFn).toHaveBeenCalledTimes(3);
    expect(element.equals(<div>Vader</div>));

});

test("does not re-render child components on observable change", () => {
    const childRenderFn = jest.fn(() => (
        <div>Child</div>
    ));
    const ChildComponent = observe(childRenderFn);

    const parentText = ko.observable("Parent");
    const parentRenderFn = jest.fn(() => (
        <>
            <span>{parentText()}</span>
            <ChildComponent />
        </>
    ));
    const ParentComponent = observe(parentRenderFn);

    mount(<ParentComponent />);
    expect(parentRenderFn).toHaveBeenCalledTimes(1);
    expect(childRenderFn).toHaveBeenCalledTimes(1);

    parentText("Parent Changed");
    expect(parentRenderFn).toHaveBeenCalledTimes(2);
    expect(childRenderFn).toHaveBeenCalledTimes(1);
});

test("stops tracking dependencies on unmount", () => {
    const observable = ko.observable("foo");
    const TestComponent = observe(() => <div>{observable()}</div>);

    const component = shallow(<TestComponent />);

    expect(observable.getSubscriptionsCount()).toBe(1);
    component.unmount();

    expect(observable.getSubscriptionsCount()).toBe(0);

});
