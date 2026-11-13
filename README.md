# OS Workshop

An interactive, software-only operating systems workshop. Students write small Python rules, observe their effects and assemble a runnable browser teaching OS.

## Run

Open `docs/index.html` in Chrome or Edge, or serve `docs/` with a static web server. All runtime assets are bundled locally.

## Publish on GitHub Pages

In Settings → Pages, choose **Deploy from a branch**, **main**, and **/docs**, then Save. GitHub supplies the final site URL. No build tools or secrets are needed.

## Included

- Overview of all twelve tasks and final capabilities.
- Distinct reading, coding, observation and reflection areas.
- Python syntax highlighting, editor line numbers and visual experiments.
- Tutor checkpoints stored locally in the browser.
- Command shell with Enter, history and Tab completion.
- Export of verified Python code as an offline teaching OS.

This is an educational simulation, not a hardware-bootable kernel. In-memory OS files reset on reboot. Progress saved under a local file URL does not automatically transfer to the hosted website.

Facilitator references are included in the client-side application; the tutor entry is not an authentication boundary.

## Runtime license

The bundled Skulpt Python runtime retains its license in `docs/vendor/SKULPT-LICENSE.txt`.
