import React from "react";
import { render, screen } from "@testing-library/react";
import KnockoutTemplate from "../../src/reactToKnockout/KnockoutTemplate";

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

beforeEach(() => {
    document.body.appendChild(helloWorldTemplate);
    document.body.appendChild(greeterTemplate);
});

afterEach(() => {
    document.body.removeChild(helloWorldTemplate);
    document.body.removeChild(greeterTemplate);
});

test("Can render a template without data", () => {
    render(<KnockoutTemplate name={helloWorldTemplateId} />);
    screen.getByText("Hello, World");
});

test("Can render templates with data", () => {
    render(
        <KnockoutTemplate name={greeterTemplateId} data={{ name: "Mark" }} />,
    );
    expect(screen.getByDisplayValue);
    // Need a custom function to handle 'Hello, <span>Mark</span>', and there's multiple matches, so getAll
    screen.getAllByText((_, el) => el?.textContent === "Hello, Mark");
});
