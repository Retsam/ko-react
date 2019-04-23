import ko from "knockout";
import useForceUpdate from "hooks/utils/useForceUpdate";
import useMemoWithDisposer from "hooks/utils/useMemoWithDisposer";

/**
 * Returns the result of a provided function, causing a rerender whenever
 *  any observables read by the function change.
 * @param func A pure function that reads observables to produce a value,
 *      (does not need to be a ko.computed, and probably shouldn't be)
 */
function useComputed<T>(func: () => T, deps: any[] | undefined) {
    const forceUpdate = useForceUpdate();
    const computed = useMemoWithDisposer(
        () => {
            const c = ko.pureComputed(func);
            c.subscribe(forceUpdate);
            return c;
        },
        (computed) => computed.dispose(),
        deps,
    );
    return computed();
}

export default useComputed;
