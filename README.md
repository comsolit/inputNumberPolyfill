**THIS REPO IS UNMAINTAINED / A NEW MAINTAINER IS NEEDED**
=================

# Polyfill for Input type="number"

This Polyfill adds buttons to step up and down the value of an
input type number element in Internet Explorer 10+ and Edge.

The Polyfill requires angular version >1.4 but might also work
with older versions of angular.

You need to include the module *comsolitInputNumberPolyfill* and
declare the min, max and step attributes on an input type number
element:

```html
<body ng-app="myapp">

  <input type="number" min="0" max="42" step="1" />

  <script>
    angular.module('myapp', ['comsolitInputNumberPolyfill']);
  </script>
</body>
```

See also the index.html file in this repository for more examples.

## LICENSE

This code is released under the MIT license, see the LICENSE file.

## TODO

The polyfill has no upper boundary test. So if any future version
of a Microsoft Browser should ever support number controls than the
`needsPolyfill` function needs to be adapted.

