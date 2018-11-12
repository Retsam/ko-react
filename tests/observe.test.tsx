import { observe } from "../src/index";
import ko from "knockout";
import React from "react";
import { mount, shallow, StatelessComponent } from "./enzyme";

test("accepts stateless components", () => {
    const TestComponent = observe(() => (
        <div>Test</div>
    ));
    const element = shallow(<TestComponent />);
    expect(element.equals(<div>Test</div>)).toBe(true);
});

test("accepts component classes", () => {
    const TestComponent = observe(class extends React.Component {
        render() {
            return <div>Test</div>;
        }
    });
    const element = shallow(<TestComponent />);
    expect(element.equals(<div>Test</div>)).toBe(true);
});

test("re-renders when an observable changes", async () => {
    const observable = ko.observable("Hello");

    const renderFn = jest.fn(() => (
        <div>{observable()}</div>
    ));
    const TestComponent = observe(renderFn);

    const element = shallow(<TestComponent />);
    expect(element.equals(<div>Hello</div>)).toBe(true);
    expect(renderFn).toHaveBeenCalledTimes(1);

    observable("There");
    expect(element.update().equals(<div>There</div>)).toBe(true);
    expect(renderFn).toHaveBeenCalledTimes(2);

    observable("General Kenobi");
    expect(element.update().equals(<div>General Kenobi</div>)).toBe(true);
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
    expect(element.update().equals(<div>Vader</div>)).toBe(true);

});

test("can track observables based on props", () => {
    const nickname = ko.observable("The Senate");
    const realName = ko.observable("Sheev");

    interface ChildProps { usingNickname: boolean; }
    const childRenderFn = jest.fn(({usingNickname}: ChildProps) => (
        <div>{usingNickname ? nickname() : realName()}</div>
    ));
    const ChildComponent = observe(childRenderFn as StatelessComponent<ChildProps>);
    const TestComponent = observe(class extends React.Component<{}, ChildProps> {
        constructor(props: {}) {
            super(props);
            this.state = {
                usingNickname: true,
            };
        }
        render() {
            return <ChildComponent {...this.state} />;
        }
    });

    const component = mount(<TestComponent />);
    let callCount = 0;
    expect(childRenderFn).toHaveBeenCalledTimes(++callCount);
    // On initial render, the child computed is subscribed to nickname, since usingNickname is true
    nickname("Vader");
    expect(childRenderFn).toHaveBeenCalledTimes(++callCount);

    // Changing usingNickname, the child computed needs to subscribe to realName, not nickname
    component.setState({ usingNickname: false });
    expect(childRenderFn).toHaveBeenCalledTimes(++callCount);

    realName("Anakin");
    expect(childRenderFn).toHaveBeenCalledTimes(++callCount);
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
    const component2 = shallow(<TestComponent />);

    expect(observable.getSubscriptionsCount()).toBe(2);
    component.unmount();

    expect(observable.getSubscriptionsCount()).toBe(1);

    component2.unmount();
    expect(observable.getSubscriptionsCount()).toBe(0);


});
