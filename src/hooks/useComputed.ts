import ko from "knockout";
import { useState, useLayoutEffect } from "react";

/**
 * Returns the result of a provided function, causing a rerender whenever
 *  any observables read by the function change.
 * @param func A pure function that reads observables to produce a value,
 *      (does not need to be a ko.computed, and probably shouldn't be)
 */
function useComputed<T>(func: () => T) {
    const [ computed ] = useState(() => ko.pureComputed(func));
    const [ value, setValue ] = useState(computed.peek());

    // Doing useLayoutEffect so that the subscription happens synchronously with the initial render;
    // eliminates a window in which the component and computed can go out of sync
    useLayoutEffect(() => {
        computed.subscribe(val => setValue(val));
        return () => computed.dispose();
    }, []);

    return value;
}

export default useComputed;
