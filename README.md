# Parachute

A super simple, no-frills static site generator that includes automation for:

- Preprocessing [Sass](https://sass-lang.com/), including:
  - Vendor prefixes
  - Stylesheet concatenation
  - Minification for production
  - Sourcemap files
- Compiling JavaScript
  - File concatenation
  - [Babel](https://babeljs.io/) traspilation
  - Minification for production
  - Sourcemap files
- Optimizing images using [Imagemin](https://github.com/sindresorhus/gulp-imagemin#readme)

I've used this codebase for developing static sites for quite a while now. While I often use other pipelines (React, Vue, etc.), I keep returning to this codebase for:

- Quick proofs of concept
- Troubleshooting
- Pattern library development for use in other frontend frameworks or content management systems

## Setting up the environment

[Gulp](https://gulpjs.com/) has been added for task automation. To set up the environment, run:

```sh
$ npm install
```

### Development

To run the development server and watch for changes, run:

```sh
$ gulp serve-dev
```

This will launch an instance of your default browser and serve the site from http://localhost:3000/. This server is configured for hot reloading. It's possible to run the dev and prod servers concurrently; however, only the development server is watching for changes. A production build would need to be run following the last development build.

Stop the server by typing `ctrl + c` into the terminal

It is also possible to compile a development build without starting the server by running:

```sh
$ gulp dev
```

Running the development build command or making changes to the source files while the development server is running regenerates the following structure:

```
<project-name>
└── app
    └── build
        └── dev
            ├── dist
            │   ├── css
            │   │   ├── main.css
            │   │   ├── maps
            │   │   └── vendor.js
            │   ├── img
            │   └── js
            │       ├── main.js
            │       └── maps
            └── index.html
```

Changes to files should be made within the /src/ directory:

```
<project-name>
└── src
    ├── css
    │   └── main.css
    ├── img
    ├── js
    │   └── main.js
    └── index.html
```

### Production

The quickest way to view the latest production build in a browser is to run:

```sh
$ gulp serve-prod
```

This will launch an instance of your default browser and serve the site from http://localhost:8080/.

Stop the server by typing `ctrl + c` into the terminal

To generate a production build without running the server, run:

```sh
$ gulp prod
```

The production build command regenerates the following structure:

```
<project-name>
└── app
    └── build
        └── prod
            ├── dist
            │   ├── css
            │   │   ├── main.css
            │   │   ├── maps
            │   │   └── vendor.js
            │   ├── img
            │   └── js
            │       ├── main.js
            │       └── maps
            └── index.html
```

## Dependencies

### Existing

- [normalize.css](https://necolas.github.io/normalize.css/) has been added to the codebase via gulpfile.js

### Adding new

ES6 modules will not work with Gulp like they do in Webpack. New dependencies can be added by:

1. Install the module using `yarn` or `npm`. Using jQuery as an example, run:

```sh
npm install jquery --save
```

2. Open the `/node-modules/` directory and locate the module directory within: `/node-modules/jquery/`

3. Copy the relative path of the dependency: `node_modules/jquery/dist/jquery.min.js`

4. Open `gulpfile.js` and paste the relative path as a string within either the `vendorStyles` or `vendorScripts` array, depending on the type of dependency:

```javascript
// external js/css dependencies
const vendorStyles = ['node_modules/normalize.css/normalize.css'];
const vendorScripts = ['node_modules/jquery/dist/jquery.min.js'];
```

5. Save any changes made to gulpfile.js and restart the server.

## Author

Ryan Wells: [ryanwells.com](https://ryanwells.com)

## License

Licensed under [MIT](https://opensource.org/licenses/mit-license.php).
