import ko from "knockout";
import React, { useState } from "react";
import { renderHook, render, screen, fireEvent } from "@testing-library/react";
import useComputed from "../../src/hooks/useComputed";
import { act } from "react-dom/test-utils";
import {
    disableActEnvironment,
    createRenderStream,
} from "@testing-library/react-render-stream";

test("can compute JSX based on observables", () => {
    const firstName = ko.observable("Bob");
    const lastName = ko.observable("Ross");

    const { result } = renderHook(() =>
        useComputed(
            () => (
                <div>
                    {firstName()} {lastName()}
                </div>
            ),
            [],
        ),
    );

    render(result.current);
    expect(screen.getByText("Bob Ross")).toBeTruthy();

    act(() => {
        lastName("Jones");
    });

    render(result.current);
    expect(screen.getByText("Bob Jones")).toBeTruthy();
});

test("can be used with closure values", () => {
    const { result } = renderHook(() => {
        const [count, setCount] = useState(0);
        return {
            // @ts-expect-error - testing this case, but the types consider the deps array mandatory
            view: useComputed(() => (
                <div onClick={() => setCount(count + 1)}>Value is {count}</div>
            )),
            setCount,
        };
    });

    render(result.current.view);
    fireEvent.click(screen.getByText("Value is 0"));

    render(result.current.view);
    expect(screen.getByText("Value is 1")).toBeTruthy();
});

test("doesn't call the render or computed function unnecessarily with deps", () => {
    let renderCount = 0;
    let computedCount = 0;
    const plus = ko.observable(0);

    const { result } = renderHook(() => {
        renderCount++;
        const [count, setCount] = useState(0);
        return {
            view: useComputed(() => {
                computedCount++;
                return (
                    <div onClick={() => setCount(count + 1)}>
                        Value is {count + plus()}
                    </div>
                );
            }, [count]),
            setCount,
        };
    });

    render(result.current.view);
    expect(renderCount).toBe(1);
    expect(computedCount).toBe(1);
    expect(screen.getByText("Value is 0")).toBeTruthy();

    // Update observable state
    act(() => {
        plus(2);
    });

    render(result.current.view);
    expect(renderCount).toBe(2);
    expect(computedCount).toBe(2);
    expect(screen.getByText("Value is 2")).toBeTruthy();

    // Update non-observable state
    fireEvent.click(screen.getByText("Value is 2"));

    render(result.current.view);
    expect(renderCount).toBe(3);
    expect(computedCount).toBe(3);
    expect(screen.getByText("Value is 3")).toBeTruthy();
});

describe("renderStreamTests", () => {
    // This can also be done with `using` syntax, but this was a big pain for transpilation
    let disposable: { cleanup: () => void };
    beforeAll(() => {
        disposable = disableActEnvironment();
    });
    afterAll(() => {
        disposable.cleanup();
    });

    test("doesn't call the render or computed function unnecessarily", async () => {
        const message = ko.observable("Initial");
        const computedSpy = jest.fn();
        const Component = () => {
            return useComputed(() => {
                computedSpy();
                return <div>{message()}</div>;
            }, []);
        };

        const { render, takeRender, totalRenderCount } = createRenderStream({
            snapshotDOM: true,
        });

        await render(<Component />);

        message("Uno");
        // Defer so that the two computed updates aren't batched together
        await new Promise(resolve => setTimeout(resolve, 0));
        // Test that these two computed updates *are* batched together
        message("Deux");
        message("三");

        {
            const { withinDOM } = await takeRender();
            withinDOM().getByText("Initial");
        }
        {
            const { withinDOM } = await takeRender();
            withinDOM().getByText("Uno");
        }
        {
            const { withinDOM } = await takeRender();
            withinDOM().getByText("三");
        }
        expect(computedSpy).toHaveBeenCalledTimes(4);
        expect(totalRenderCount()).toBe(3);
    });
});
