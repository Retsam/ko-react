import ko from "knockout";
import React, { ComponentClass } from "react";
import { Root, createRoot } from "react-dom/client";

export interface ReactComponentBindingValue {
    Component: ComponentClass;
    props: any;
    // Deprecated
    params?: any;
}

// Using a symbol out of paranoia to avoid conflicting with anything else on the context
const reactRootKey = Symbol();

type ContextWithReactRoot = KnockoutBindingContext & {
    [reactRootKey]?: Root;
};

const bindingHandler: KnockoutBindingHandler<
    HTMLElement,
    ReactComponentBindingValue
> = {
    init(
        element,
        _valueAccessor,
        _allBindings,
        _vm,
        context: ContextWithReactRoot,
    ) {
        ko.utils.domNodeDisposal.addDisposeCallback(element, () =>
            context[reactRootKey]?.unmount(),
        );
        return { controlsDescendantBindings: true };
    },
    /**
     * The main logic goes into update so that it will properly rerender if an observable is read inside the data-bind
     */
    update(
        element,
        valueAccessor,
        _allBindings,
        _vm,
        context: ContextWithReactRoot,
    ) {
        const { props, Component, params } = ko.unwrap(valueAccessor());
        if (!Component) {
            throw new Error(
                "No component provided to reactComponent bindingHandler",
            );
        }
        // The whole props could be an observable
        // props || params for backwards compatibility
        const unwrappedProps = ko.unwrap(props) || ko.unwrap(params);
        // Ignore dependencies to avoid unwanted subscriptions to observables
        //   inside render functions
        const root = (context[reactRootKey] = createRoot(element));
        ko.ignoreDependencies(() => {
            root.render(React.createElement(Component, unwrappedProps));
        });
    },
};

const noop = () => {
    /* noop */
};
const registrars = {
    register() {
        ko.bindingHandlers.reactComponent = bindingHandler;
    },
    registerShorthandSyntax(bindingHandlerName = "reactComponent") {
        const existingPreprocessNode =
            (ko.bindingProvider.instance as any).preprocessNode || noop;
        (ko.bindingProvider.instance as any).preprocessNode = function (
            node: Node,
        ) {
            if (node.nodeType === 8) {
                const match = node.nodeValue!.match(
                    /^\s*react\s*:\s*([\w.]+)\s+((.|\n)+?)\s*$/,
                );
                if (match) {
                    const div = document.createElement("div");
                    // prettier-ignore
                    const [/* wholeMatch */, Component, props] = match;
                    div.dataset.bind = `${bindingHandlerName}: { Component: ${Component}, props: ${props} }`;
                    node.parentNode!.replaceChild(div, node);

                    // Tell Knockout about the new nodes so that it can apply bindings to them
                    return [div];
                }
            }
            return existingPreprocessNode(node);
        };
    },
};

export default { bindingHandler, ...registrars };
