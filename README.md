# ko-react ![](https://img.shields.io/npm/types/@retsam/ko-react.svg?style=flat)

```
npm install @retsam/ko-react
```

A library for allowing Knockout observables to be used with React components.  Knockout's observable system is very similar to MobX, so in practice this is very much like using `mobx-react`.

This intended as a migration path for legacy Knockout codebases - the knockout html template engine can be replaced  with React templates, while leaving the core Knockout logic intact, allowing for an incremental migration path to React.

This library provides utilities for allowing React components to rerender, driven by observables (like MobX), and a bindingHandler to bridge from ko templates to react components.  There is preliminary support for the reverse - react components to knockout logic - in the form of the `useKnockoutBindings` hook.

## API

### Hooks

#### `useComputed`

A hook version of `ko.pureComputed`, wraps a function, returns the value of evaluating the function, and recomputes the function whenever any observables that are read by the function change.

```tsx
interface FullNameProps {
    firstName: KnockoutObservable<string>,
    lastName: KnockoutObservable<string>
}

// Re-renders if either firstName or lastName change
const Greeter = ({firstName, lastName}: FullNameProps) => useComputed(() => (
    <span>
        Hello, {firstName()} {lastName()}
    </span>
));
```

Can largely be used as a drop-in replacement for the `observe` HOC.

#### `useObservable`

Reads and subscribes to an observable - if the observable's value changes the component re-renders:

```tsx
interface FullNameProps {
    firstName: KnockoutObservable<string>,
    lastName: KnockoutObservable<string>
}

// Re-renders only if firstName changes
const Greeter = ({firstName, lastName}: FullNameProps) => {
    const [fName] = useObservable(firstName)
    return (
        <span>
            Hello, {fName} {lastName()}
        </span>
    );
}
```

#### `useSubscription`

Sets up a subscription to an observable (or any subscribable) - runs the provided callback whenever the observable emits a new value, without triggering a rerender (unless the callback modifies state).  Disposes the subscription when the component is unmounted.

```ts
type PageTitleComponentProps = {
    text: KnockoutObservable<string>,
    prefix: string,
}
const PageTitleComponent = ({}) => {
    const [count, setCount] = useState(0);

    useSubscription(text, newText => {
        // count will always be the latest value, no need for a `deps` array.
        document.title = `${count} - ${newText}`
    });

    return <button onClick={() => setCount(count + 1)}>Click</button>;
}
```

#### 🚧 `useKnockoutBindings` 🚧

While the rest of this library is concerned with bridging from knockout to react, this bindingHandler
provides a mechanism for leveraging knockout nested inside of react.

```tsx
const MessageComponent = ({text}: {text: string}) => {
    const elementRef = useRef<HTMLDivElement>(null);

    const viewModel = { name: text };
    useKnockoutBindings(elementRef, viewModel);

    return (
        // Ref of the element where knockout bindings will be applied
        <div ref={elementRef}>
            // Standard knockout data-binding
            Hello, <span data-bind="text: name" />
        </div>
    );
};
```

There's some danger here about React and Knockout both trying to control the same elements: it's likely safest to not use this hook directly, but to use the provided `KnockoutTemplate` component, which wraps this hook to provide a React version of the template bindingHandler.

### Higher Order Component - `observe`

A Higher Order Component which wraps a component such that any observables that are read during the render function will cause the component to rerender.

```tsx
interface FullNameProps {
    firstName: KnockoutObservable<string>,
    lastName: KnockoutObservable<string>
}

// Re-renders if either firstName or lastName change
const Greeter = observe(({firstName, lastName}: FullNameProps) => (
    <span>
        Hello, {firstName()} {lastName()}
    </span>
));
```

The implementation details of `observe` however, are somewhat ugly, and it should be considered deprecated in favor of the hooks API.

### Knockout bindingHandler `reactComponent`

Used to bridge from "knockout world" into React world, useful for incrementally migrating from knockout templates to React components.

```html
<div data-bind="
    reactComponent: {
        component: MyComponent,
        props: {prop: 'propValue'}
    }
"><!-- MyComponent will render here --></div>
```

Must be registered in `ko.bindingHandlers`, can be done by calling the exported `register` function.

#### Shorthand syntax

If `registerShorthandSyntax` is called, knockout `preprocessNode` logic will be registered which allows the previous example to be written as:

```html
<!-- react: MyComponent {
    prop: 'propValue'
} -->
```

This will insert a `div` and render `MyComponent` inside it.
