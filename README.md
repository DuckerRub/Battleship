# Template

### Bundling 
`npm init -y`

`npm install --save-dev webpack webpack-cli`

`touch webpack.config.js`

`npm install --save-dev style-loader css-loader`

`npm install --save-dev html-webpack-plugin`

`npm install --save-dev html-loader`

`npm install --save-dev webpack-dev-server`

`npm init @eslint/config@latest`

`npm install --save-dev --save-exact prettier`

`node --eval "fs.writeFileSync('.prettierrc','{}\n')"`

`node --eval "fs.writeFileSync('.prettierignore','# Ignore artifacts:\nbuild\ncoverage\n')"`

`npx webpack serve` to run on http://localhost:8080/

`npx webpack` to bundle into dist