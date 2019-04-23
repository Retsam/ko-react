import ko from "knockout";
import { useState, useLayoutEffect } from "react";

function useForceUpdate() {
    const [/*val*/, setIncr] = useState(0);
    // Using callback form of setIncr so that the same useForceUpdate function can be called multiple times
    return () => setIncr((val) => val + 1);
}

/**
 * Reads and subscribes to the value of a single observable,
 *  triggering a rerender if the value inside the observable changes
 */
function useObservable<T>(observable: KnockoutObservable<T>): [T, (t: T) => void];
function useObservable<T>(observable: KnockoutReadonlyObservable<T>): [T];
function useObservable<T>(observable: KnockoutObservable<T> | KnockoutReadonlyObservable<T>) {
    const forceUpdate = useForceUpdate();
    // Doing useLayoutEffect so that the subscription happens synchronously with the initial render;
    // eliminates a window in which the observable can go out of sync with the state
    useLayoutEffect(() => {
        const sub = observable.subscribe(forceUpdate);
        return () => sub.dispose();
    }, [observable]);

    const value = observable.peek();
    if (ko.isWriteableObservable(observable)) {
        return [value, (val: T) => observable(val)];
    }
    return [value];
}

export default useObservable;
