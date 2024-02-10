import typescriptPlugin from "rollup-plugin-typescript2";
import typescript from "typescript";

export default {
    input: "src/index.ts",
    output: {
        file: "dist/bundle.js",
        format: "cjs",
    },
    external: ["react", "knockout", "react-dom/client"],
    plugins: [
        typescriptPlugin({
            typescript: typescript,
        }),
    ],
};
