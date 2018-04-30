import ko from "knockout";
import { StatelessComponent, ComponentClass, Component, PureComponent } from "react";

export default function observe<P>(componentClass: StatelessComponent<P> | ComponentClass<P>) {
    if(isStatelessComponent<P>(componentClass)) {
        componentClass = componentClassForStatelessComponent(componentClass);
    }
    const baseRender = componentClass.prototype.render;
    let renderComputed: KnockoutComputed<void>;
    componentClass.prototype.render = function(this: Component<P>, props: P) {
        // Defer the evaluation so we can reset the prototype
        let firstRender = true;
        renderComputed = ko.computed(() => {
            if(firstRender) {
                firstRender = false;
                return baseRender.call(this);
            }
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
