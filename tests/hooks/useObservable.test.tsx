import ko from "knockout";
import React, { useState } from "react";
import useObservable from "../../src/hooks/useObservable";
import { mount } from "../enzyme";
import { act } from "react-dom/test-utils";

test("can read from an observable", () => {
    const Component = ({text: textObservable}: { text: KnockoutObservable<string> }) => {
        const text = useObservable(textObservable);
        return <h1>{text}</h1>;
    };
    const text = ko.observable("Joe");
    const element = mount(<Component text={text} />);
    expect(element.text()).toBe("Joe");
    act(() => {
        text("James");
    });
    expect(element.text()).toBe("James");
    act(() => {
        text("Jack");
    });
    expect(element.text()).toBe("Jack");
});

test("behaves appropriately if the observable is swapped for a different observable", () => {
    const Child = ({count}: { count: KnockoutObservable<number> }) => {
        const countValue = useObservable(count);
        return <div>{countValue}</div>;
    };
    let setCountObservable: React.Dispatch<React.SetStateAction<KnockoutObservable<number>>>;

    const Parent = () => {
        const [countObservable, _setCountObservable] = useState(() => ko.observable(0));
        // Leak the setter into the enclosing scope so it can be controlled by the test
        setCountObservable = _setCountObservable;
        return <Child count={countObservable} />;
    };
    const element = mount(<Parent/>);
    // Does it display correctly, initially?
    expect(element.text()).toBe("0");

    // Does it update when the observable is replaced?
    const obs = ko.observable(1);
    act(() => {
        setCountObservable(() => obs);
    });
    expect(element.text()).toBe("1");

    // Does it update when the new observable is changed?
    act(() => {
        obs(2);
    });
    expect(element.text()).toBe("2");
});
