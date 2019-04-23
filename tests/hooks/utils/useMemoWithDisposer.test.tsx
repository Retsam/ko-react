import React from "react";
// import { act } from "react-dom/test-utils";
import useMemoWithDisposer from "../../../src/hooks/utils/useMemoWithDisposer";
import { mount } from "../../enzyme";

test("memoizes values", () => {
    const memoizedFunc = jest.fn();
    type TestProps = Record<"a" | "b", number>;
    const TestComponent = ({a}: TestProps) => {
        useMemoWithDisposer(
            memoizedFunc,
            () => {/*dispose*/},
            [a],
        );
        return <div></div>;
    };
    const com = mount(<TestComponent a={1} b={2} />);
    expect(memoizedFunc).toHaveBeenCalledTimes(1);
    // Change memoized prop
    com.setProps({a: 2});
    expect(memoizedFunc).toHaveBeenCalledTimes(2);
    // Change non-memoized prop
    com.setProps({b: 2});
    expect(memoizedFunc).toHaveBeenCalledTimes(2);
});

test("disposes previously memoized values", () => {
    const disposerFunc = jest.fn();
    type TestProps = Record<"a", string>;
    const TestComponent = ({a}: TestProps) => {
        useMemoWithDisposer(
            () => a,
            disposerFunc,
            [a],
        );
        return <div></div>;
    };
    const com = mount(<TestComponent a={"Initial value"} />);
    expect(disposerFunc).not.toHaveBeenCalled();

    com.setProps({a: "New val"});
    expect(disposerFunc).toHaveBeenCalledWith("Initial value");

    com.setProps({a: 3});
    expect(disposerFunc).toHaveBeenCalledWith("New val");
    expect(disposerFunc).toHaveBeenCalledTimes(2);
});

test("disposes last memoized value on unmount", () => {
    const disposerFunc = jest.fn();
    type TestProps = Record<"a", string>;
    const TestComponent = ({a}: TestProps) => {
        useMemoWithDisposer(
            () => a,
            disposerFunc,
            [a],
        );
        return <div></div>;
    };
    const com = mount(<TestComponent a={"Initial value"} />);
    expect(disposerFunc).not.toHaveBeenCalled();

    com.unmount();
    expect(disposerFunc).toHaveBeenCalledTimes(1);
    expect(disposerFunc).toHaveBeenCalledWith("Initial value");
});
