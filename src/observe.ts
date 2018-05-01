import ko from "knockout";
import { StatelessComponent, ComponentClass, Component, PureComponent, ReactNode } from "react";

export default function observe<P>(componentClass: StatelessComponent<P> | ComponentClass<P>) {
    if(isStatelessComponent<P>(componentClass)) {
        componentClass = componentClassForStatelessComponent(componentClass);
    }

    return (class extends componentClass {
        private __ko_react_computed?: KnockoutComputed<ReactNode>; // tslint:disable-line variable-name

        // Override the render function with one that uses a computed to track observables
        render() {
            let firstRender = true;
            this.__ko_react_computed = ko.computed(() => {
                // On the first call, call the existing render function and return the results, so they can be returned
                // out of the overridden render function
                if(firstRender) {
                    firstRender = false;
                    return super.render.call(this);
                }
                // On reevaluations due to observable changes, call forceUpdate
                // This will internally trigger a call to render, which will allow the computed to continue to track observables
                this.forceUpdate();
            });
            // Future calls should bypass this logic to avoid setting up the computed more than once
            this.render = super.render;
            return this.__ko_react_computed();
        }

        componentWillUnmount() {
            if(super.componentWillUnmount) { super.componentWillUnmount(); }
            this.__ko_react_computed!.dispose();
        }
    // This cast is necessary due to https://github.com/Microsoft/TypeScript/issues/17293
    } as ComponentClass<P>);
}

function isStatelessComponent<P>(componentClass: any): componentClass is StatelessComponent<P> {
    return (
        typeof componentClass === "function" &&
        (!componentClass.prototype || !componentClass.prototype.render) &&
        !componentClass.isReactClass &&
        !Component.isPrototypeOf(componentClass)
    );
}

function componentClassForStatelessComponent<P>(componentClass: StatelessComponent<P>): ComponentClass<P> {
    return class extends PureComponent<P> {
        static displayName = componentClass.displayName || componentClass.name;
        static contextTypes = componentClass.contextTypes;
        static propTypes = componentClass.propTypes;
        static defaultProps = componentClass.defaultProps;
        render() {
            return componentClass.call(this, this.props, this.context);
        }
    };
}
