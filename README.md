# node-aerender

Render After Effects projects in NodeJS.

A dead simple, promise based aerender wrapper with progress reporting.

As used in [modeck.io](https://modeck.io/).

## Installation

    npm install node-aerender

#### Usage

```js
import render from "node-aerender";

let aePath = "C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files";

let config = {
  project: "C:\\Folder\\AEProject.aep",
  comp: "Comp 1",
  output: "C:\\Folder\\Render.avi",
  OMtemplate: "Lossless with Alpha"
};

render(aePath, config, (progress) => {
  console.log(progress + "%");
}).then(() => {
  console.log("DONE");
});
```

#### Configuration

The render config is parsed as an object, the keys of the object correspond with aerender arguments listed [HERE](https://helpx.adobe.com/after-effects/using/automated-rendering-network-rendering.html "aerender arguments") (excluding the dashes in front of argument names)

For example:

```js
let config = {
  project: "C:\\Folder\\AEProject.aep",
  comp: "Comp 1",
  OMtemplate: "Lossless with Alpha",
  output: "C:\\Folder\\Render.avi",
  reuse: true,
  s: 30,
  e: 120
};
```

This equates to an aerender command as follows:

    aerender -project "C:\Folder\AEProject.aep" -comp "Comp 1" -OMtemplate "Lossless with Alpha" -output "C:\Folder\Render.avi" -reuse -s 30 -e 120