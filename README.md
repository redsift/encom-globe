# d3-rs-globe

[![Circle CI](https://img.shields.io/circleci/project/redsift/d3-rs-globe.svg?style=flat-square)](https://circleci.com/gh/redsift/d3-rs-globe)
[![npm](https://img.shields.io/npm/v/@redsift/d3-rs-globe.svg?style=flat-square)](https://www.npmjs.com/package/@redsift/d3-rs-globe)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/redsift/d3-rs-globe/master/LICENSE)

`d3-rs-globe` is stylized WebGL data driven globe.

## Screenshot

![d3-rs-globe](https://raw.github.com/redsift/d3-rs-globe/master/examples/screenshot.jpg "D3 Globe")

## Example Usage

```javascript
<script src="/t3-rs-geo.umd-es2015.min.js"></script>
<script>
    var globe = new t3_rs_geo.ENCOM(window.innerWidth, window.innerHeight, {
        data: [ ],
        tiles: t3_rs_geo.GRID_LQ // use the included low quality grid
    });
    d3.select('#elm').node().append(globe.domElement);
    globe.ready
        .then(() => {
            // we are ready to animate
            (function tick() {
                globe.tick();
                requestAnimationFrame(tick);
            })();
        });
</script>
```

[View the @redsift/d3-rs-globe 101 on Codepen](http://codepen.io/rahulpowar/pen/zNRrEL)

[Interactive, High Quality example on Codepen](http://codepen.io/rahulpowar/pen/zNRrEL)

## History

This globe started out as a fork of Robert Scanlon's [encom-globe](https://github.com/arscan/encom-globe). It was converted to a standalone project as the API and direction of the component departed from the objectives of the original. Significant changes include an update to the current (Jan 2017) version of THREE.js, rewrite as an ES6 module, use of mesh lines and [SDF](https://www.youtube.com/watch?v=CGZRHJvJYIg) rendering among other changes.

## Usage

...

## Generating data set


## Works on

Chrome 56

## TODO

1. Merge scale indicator
1. CI

1. Hit testing and callback
1. Fog scaling
1. Higher res con trails
1. Noise in trail
1. Normalise speed 
1. Path direction
1. Programmatic panning and animated transitions
1. Animate base color 
1. Make wiggle a scale function 
1. HDR function
1. Align API
1. Atmosphere shader
1. Ocean shader
1. Docs / examples

## Attribution

This software is substantially based on [encom-globe](https://github.com/arscan/encom-globe) by Robert Scanlon, licensed under MIT.

The MIT License (MIT)
Copyright (c) 2014 Robert Scanlon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
