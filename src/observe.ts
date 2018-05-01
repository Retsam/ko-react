import ko from "knockout";
import { StatelessComponent, ComponentClass, Component, PureComponent } from "react";

export default function observe<P>(componentClass: StatelessComponent<P> | ComponentClass<P>) {
    if(isStatelessComponent<P>(componentClass)) {
        componentClass = componentClassForStatelessComponent(componentClass);
    }
    // Override the render function with one that uses a computed to track observables
    const baseRender = componentClass.prototype.render;
    let renderComputed: KnockoutComputed<void>;
    componentClass.prototype.render = function(this: Component<P>, props: P) {
        let firstRender = true;
        renderComputed = ko.computed(() => {
            // On the first call, call the existing render function and return the results, so they can be returned
            // out of the overridden render function
            if(firstRender) {
                firstRender = false;
                return baseRender.call(this);
            }
            // On reevaluations due to observable changes, call forceUpdate
            // This will internally trigger a call to render, which will allow the computed to continue to track observables
            this.forceUpdate();
        });
        this.render = baseRender;
        return renderComputed();
    };

    return componentClass;
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
    }
}
