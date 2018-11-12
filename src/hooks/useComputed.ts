import ko from "knockout";
import { useState, useLayoutEffect } from "react";

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
