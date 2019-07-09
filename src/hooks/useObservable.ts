import useSubscription from "hooks/useSubscription";
import useForceUpdate from "hooks/utils/useForceUpdate";

// Building this type so that this hook can be used with computeds, or observables that have been
//  cast to be readonly
export type ReadonlyObservable<T> = Pick<KnockoutObservable<T>, "subscribe" | "peek">;

/**
 * Reads and subscribes to the value of a single observable,
 *  triggering a rerender if the value inside the observable changes
 */
function useObservable<T>(observable: ReadonlyObservable<T>) {
    useSubscription(observable, useForceUpdate());

    return observable.peek();
}

export default useObservable;
