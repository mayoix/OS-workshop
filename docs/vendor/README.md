# Offline Python runtime

Skulpt 1.2.0, bundled from the published npm distribution:

- https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js
- https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js
- https://cdn.jsdelivr.net/npm/skulpt@1.2.0/LICENSE

Official project: https://skulpt.org/ and https://github.com/skulpt/skulpt

python-runtime.js wraps the original core and standard-library source as a JavaScript string so it can be placed inside a local Blob Worker and exported into a standalone HTML file without fetch/importScripts restrictions on file URLs. Runtime logic was not modified. License is reproduced in SKULPT-LICENSE.txt.
