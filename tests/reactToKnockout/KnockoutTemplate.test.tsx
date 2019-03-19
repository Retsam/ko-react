import React from "react";
import KnockoutTemplate from "../../src/reactToKnockout/KnockoutTemplate";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

// <script type="text/html" id="theTemplate">{templateContent}</script>
const buildTemplateElement = (id: string, innerHTML: string) => {
    const templateElement = document.createElement("script");
    templateElement.type = "text/html";
    templateElement.id = id;
    templateElement.text = innerHTML;
    return templateElement;
};
const helloWorldTemplateId = "helloWorld";
const helloWorldTemplate = buildTemplateElement(
    helloWorldTemplateId,
    "Hello, World",
);

const greeterTemplateId = "greeter";
const greeterTemplate = buildTemplateElement(
    greeterTemplateId,
    `Hello, <span data-bind="text: name"></span>`,
);


let container: HTMLDivElement;
beforeEach(() => {
    document.body.appendChild(helloWorldTemplate);
    document.body.appendChild(greeterTemplate);
    container = document.createElement('div');
    document.body.appendChild(container);
  });

afterEach(() => {
    document.body.removeChild(helloWorldTemplate);
    document.body.removeChild(greeterTemplate);
    document.body.removeChild(container);
    container = null;
});

test("Can render a template without data", () => {
    act(() => {
        ReactDOM.render(<KnockoutTemplate
            name={helloWorldTemplateId}
        />, container);
    });

    const element = container.querySelector('div');
    expect(element.textContent).toBe('Hello, World');
});

test("Can render templates with data", () => {
    act(() => {
        ReactDOM.render(<KnockoutTemplate
            name={greeterTemplateId}
            data={{name: "Mark"}}
        />, container);
    });
    const element = container.querySelector('div');
    expect(element.textContent).toBe('Hello, Mark');
});
