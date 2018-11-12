import ko from "knockout";
import React, { useState } from "react";
import useObservable, { KnockoutReadonlyObservable } from "../../src/hooks/useObservable";
import { mount } from "../enzyme";
import { act } from "react-dom/test-utils";

test("can read from an observable", () => {
    const Component = ({text: textObservable}: { text: KnockoutObservable<string> }) => {
        const [text] = useObservable(textObservable);
        return <h1>{text}</h1>;
    };
    const text = ko.observable("Joe");
    const element = mount(<Component text={text} />);
    expect(element.text()).toBe("Joe");
    act(() => {
        text("James");
    });
    expect(element.text()).toBe("James");
});

test("can write to an observable", () => {
    const Counter = ({counter}: { counter: KnockoutObservable<number> }) => {
        const [count, setCount] = useObservable(counter);
        return (<>
            <div id="count">{count}</div>
            <button id="incr" onClick={() => setCount(count + 1)}>++</button>
        </>);
    };
    const counter = ko.observable(0);
    const element = mount(<Counter counter={counter} />);

    const counterValue = () => element.find("#count").text();

    expect(counterValue()).toBe("0");
    const button = element.find("button");
    button.simulate("click");

    expect(counterValue()).toBe("1");
});

test("can read from a read-only observable", () => {
    const Component = ({text: textObservable}: { text: KnockoutReadonlyObservable<string> }) => {
        // Type annotation so we get a compiler error if the types are wrong.
        const array: [string] = useObservable(textObservable);
        if (array.length !== 1) throw new Error("Unexpectedly received a setter for a readonly observable");
        const [text] = array;
        return <h1>{text}</h1>;
    };
    // Note: this isn't actually typed as readonly (circa @types/knockout#3.4.59)
    // But it can be cast to the KnockoutReadonlyObservable type, and `ko.isWritableObservable` returns false
    // So it has the right runtime behavior
    const readonly = ko.computed(() => "Hello");
    const element = mount(<Component text={readonly} />);
    expect(element.text()).toBe("Hello");
});

test("behaves appropriately if the observable is swapped for a different observable", () => {
    const Child = ({count}: { count: KnockoutObservable<number> }) => {
        const [countValue] = useObservable(count);
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
