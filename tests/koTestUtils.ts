import ko from "knockout";

export const setupKoTest = (html: string, viewModel: object) => {
    const div = document.createElement("div");
    div.innerHTML = html.trim();
    if(div.childNodes.length !== 1) {
        throw new Error("Parsed HTML had multiple root elements (or no root element)");
    }
    const element = div.children[0] as HTMLElement;

    window.document.body.appendChild(element);
    ko.applyBindings(viewModel, element);
    return element;
};
