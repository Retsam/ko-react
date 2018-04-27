import typescriptPlugin from 'rollup-plugin-typescript';
import typescript from "typescript";

export default {
    input: 'src/index.ts',
    output: {
      file: 'bundle.js',
      format: 'cjs'
    },
    plugins: [ typescriptPlugin({
        typescript: typescript
    }) ],
};
