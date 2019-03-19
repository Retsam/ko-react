import ko from 'knockout';
import { RefObject, useLayoutEffect, useMemo } from "react";

/**
 * Allows knockout to be embedded inside react components.  The react component would specify
 * a `data-bind` attribute as normal and this hook is used to apply knockout bindings to the element.
 *
 * NOTE: Currently expects the ref provided to be stable - it shouldn't change to a different element later
 */
const useKnockoutBindings = (elementRef: RefObject<HTMLElement>, vm: any) => {
    const vmObservable = useMemo(() => ko.observable<any>(), []);

    vmObservable(vm);
    useLayoutEffect(() => {
        const el = elementRef.current;
        if(!el) throw new Error("Expected to have an element in the ref");
        ko.applyBindings(vmObservable, el);

    }, [elementRef]); // Maybe should be elementRef.current... but causes bindings to be reapplied
};
export default useKnockoutBindings;
