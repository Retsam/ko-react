import useSubscription from "hooks/useSubscription";
import useForceUpdate from "hooks/utils/useForceUpdate";

// Building this type so that this hook can be used with computeds, or observables that have been
//  cast to be readonly
export type ReadonlyObservable<T> = Pick<
    KnockoutObservable<T>,
    "subscribe" | "peek"
>;

/**
 * Reads and subscribes to the value of a single observable,
 *  triggering a rerender if the value inside the observable changes
 */
function useObservable<T>(observable: ReadonlyObservable<T>) {
    useSubscription(observable, useForceUpdate());

    try {
        // Passing undocument `true` option to `observable.peek` to force it to read the latest value
        // from the observable, even if it's been rate-limited.
        return (observable.peek as any)(true) as T;
    } catch (e) {
        // The errors seem to get swallowed somewhere in the React machinery, so log them here
        //  (A normal observable probably won't throw an error, but 'the 'observable' might actually be computed)
        // tslint:disable-next-line
        console.error("An error occurred while reading an observable", e);
        throw e;
    }
}

export default useObservable;
