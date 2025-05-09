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
), [firstName, lastName]); // see below
```

Takes a second "dependencies" argument that follows the same rules as React's [`useMemo`](https://react.dev/reference/react/useMemo) or [`useCallback`](https://react.dev/reference/react/useCallback) hooks - the computed function is replaced and recalculated whenever one of the dep inside the array changes.  In the above example, the computed body itself will detect changes to the `firstName` and `lastName` observables, while the `[firstName, lastName]` argument will detect if `firstName` observable is replaced with a different observable entirely.

You can configure the ["react-hooks/exhaustive-deps" linter rule](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) to also check this hook:
```json
{
    "react-hooks/exhaustive-deps": [
        "warn", { "additionalHooks": "useComputed" }
    ]
}
```

See the "Patterns" section for the different ways to use this hook, and a comparison to `useObservable`.

#### `useObservable`

Reads and subscribes to an observable - if the observable's value changes the component re-renders:

```tsx
interface FullNameProps {
    firstName: KnockoutObservable<string>,
    lastName: KnockoutObservable<string>
}

// Re-renders only if firstName changes
const Greeter = ({firstName, lastName}: FullNameProps) => {
    const fName = useObservable(firstName)
    return (
        <span>
            Hello, {fName} {lastName()}
        </span>
    );
}
```

See the "Patterns" section for a comparison to `useComputed`.

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

### Knockout bindingHandler `reactComponent`

Used to host a react tree inside a Knockout app, useful for incrementally migrating from knockout templates to React components.

```html
<div data-bind="
    reactComponent: {
        Component: MyComponent,
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

### React to Knockout

While the majority of this library is aimed at hosting React trees inside of Knockout, the reverse may be useful (primarily for migration purposes), so a few utilities are provided for that purpose:

#### 🚧 `useKnockoutBindings` 🚧

This hook takes an element ref and a set of knockout bindings and applies those bindings to the element.

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

⚠ Caveats:

* This hook assumes that the ref is stable: if the ref is pointed from one element to a different the bindings won't be reapplied to the new element.

* Currently no mechanism for setting knockout context, in a Knockout -> React -> Knockout situation, the inner knockout tree won't have access to the outer knockout tree's context.  Consider applying the `let` binding if this is necessary.

* There's some danger here about React and Knockout both trying to control the same elements: it's likely safest to not use this hook directly, but to use the provided `KnockoutTemplate` component, which wraps this hook to provide a React version of the template bindingHandler.

#### KnockoutTemplate

A React component which takes a knockout template and data as props, and renders that template inside a <div>.  Currently the safest way to host knockout content inside a React tree.

```tsx
const KnockoutGreeter = ({firstName, lastName}) => (
    <KnockoutTemplate
        name="knockoutGreeterTemplate"
        data={{firstName, lastName}}
    />
);
```

⚠️ NOTE: the same caveat about context from `useKnockoutBindings` applies here.

## Patterns

Broadly there seem to be two strategies in using this library, one is to use a very broad `useComputed` that wraps the entire JSX return:

```tsx
const Greeter = ({ personVm }: GreeterProps) => {
    return useComputed(() => (
        <span>
            Hello, {personVm.firstName()} {personVm.lastName()}

            <img src={personVm.avatarIcon()} />
        </span>
    ), [personVm]);
}
```

In this approach `useObservable` is basically not used.

A downside of this approach is that it can be awkward to mix with native React state and hooks - anything that gets used in the JSX ends up declared in the deps array which can get long.  The above example is able to mitigate this with a viewModel that can have many observable properties on it.  (This assumes the properties themselves are readonly and `personVm.firstName` will not be replaced with a different observable).

---

The second is a more granular `useObservable`-oriented approach;

```tsx
const Greeter = ({ personVm }: GreeterProps ) => {
    const firstName = useObservable(personVm.firstName);
    const lastName = useObservable(personVm.lastName);
    const avatarIcon = useObservable(personVm.avatarIcon);

    return (
        <span>
            Hello, {firstName} {lastName}

            <img src={avatarIcon} />
        </span>
    );
};
```

In this approach `useComputed` can still be used for individual parts - for example the above example could calculate a `fullName` computed - and is particularly useful for calling functions that aren't directly observable but rely on observables.

The downside of this approach is that it can be easy to accidentally consume observable state in a way that isn't wrapped in either `useObservable` or `useComputed` which will result in a stale view because the component won't rerender.  [An eslint rule](https://www.npmjs.com/package/eslint-plugin-ko-react) has been written to try to catch these cases, but it's difficult to completely avoid false positives or false negatives.
