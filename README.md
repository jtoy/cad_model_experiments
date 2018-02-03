# cad_model_experiments
experimenting with openjscad model generation

# dependencies
install node.js and npm

## npm dependencies:
npm install -g @jscad/openjscad

npm install eval



# to run

node multigroup.js gears.jscad

This command will read the definitions from  parameterGroups and getParameterDefinitions to generate all the variations of a gear.

For each group inside of parameterGroups, it will generate all variations together.

