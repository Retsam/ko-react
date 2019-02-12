import ko from "knockout";
import { StatelessComponent, ComponentClass, Component, PureComponent, ReactNode } from "react";

/**
 * HOC-implementation of a knockout-react bridge.
 * @deprecated in favor of the hooks API, which is less invasive
 */
export default function observe<P>(componentClass: StatelessComponent<P> | ComponentClass<P>) {
    if(isStatelessComponent<P>(componentClass)) {
        componentClass = componentClassForStatelessComponent(componentClass);
    }

    return (class extends componentClass {
        private __ko_react_computed?: KnockoutComputed<ReactNode>; // tslint:disable-line variable-name

        // Override the render function with one that uses a computed to track observables
        render() {
            if(this.__ko_react_computed) this.__ko_react_computed.dispose();

            let firstRun = true;
            // Each instance of this computed is only run once, to track dependencies.
            // When any dependency changes, the computed is going to get thrown away and a
            // new computed will be responsible
            this.__ko_react_computed = ko.computed(() => {
                if(!firstRun) { return; }
                firstRun = false;

                return super.render.call(this);
            });

            this.__ko_react_computed.subscribe(() => this.forceUpdate());

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
