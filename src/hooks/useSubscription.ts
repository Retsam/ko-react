import { useRef, useLayoutEffect } from "react";

/**
 * Executes the provided callback function whenever the observable changes its value
 */
function useSubscription<T>(
    observable: Pick<KnockoutSubscribable<T>, "subscribe">,
    callback: (t: T) => void,
) {
    // By storing the callback in a ref and updating it every render,
    //  we always call the newest version of the callback, avoiding any
    //  stale closure reference issues (without needing a deps array)
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    // Doing useLayoutEffect so that the subscription happens synchronously with the initial render;
    // eliminates a window in which the observable can change without triggering the subscription
    useLayoutEffect(() => {
        const sub = observable.subscribe(t => callbackRef.current(t));
        return () => sub.dispose();
    }, [observable]);
}

export default useSubscription;
