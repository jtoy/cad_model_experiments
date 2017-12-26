const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')
var _eval = require('eval')
var sha1 = require('sha1');
var mkdirp = require('mkdirp');


const args = process.argv.splice(2)
if(args.length < 1){
  console.log("pass file to parse")
  process.exit()
}

inputFile = args[0]
ftype = inputFile.split("/").slice(-1)[0].split(".")[0]
console.log("class: "+ftype)
let src = fs.readFileSync(inputFile, 'UTF8')
src += "\ngetParameterDefinitions()\n"
eval(src)
function to_array(json){
  array = []
  if(json.hasOwnProperty('step')){
    step = json['step']
  }else{
    step = 1
  }
  for(var i = json['min'];i <= json['max'];i+= step){
    array.push(i)
  }
  if(array.length > 0){
    return array
  }else {
    return [json['initial']]
  }
}

getGetParameterDefinitions = new Function(src + ";\nreturn getParameterDefinitions();");
data = getGetParameterDefinitions();
json = {}
for ( var i = 0; i < data.length; i++) {
  json[data[i]['name']] = to_array(data[i])
}
combos = Object.keys(json).reduce((acc, key) => {
  newArray = [];

  json[key].forEach(item => {
    if (!acc || !acc.length) { // First iteration
      newArray.push({[key]: item});
    } else {
      acc.forEach(obj => {
        newArray.push({...obj, [key]: item});
      });
    }
  });

  return newArray;
}, []);
jscadPath = "openjscad"
console.log("total variations: "+combos.length)
for(var i=0;  i < combos.length; i++){
  params = ""
  // TODO sort params so that the sha is always correct
  Object.keys(combos[i]).forEach(function(key) {
    params += ` --${key} ${combos[i][key]} `
  })
  folder = sha1(params)
  outputPath = `objects/${ftype}/${folder}/`
  mkdirp.sync(outputPath)
console.log("wtf"+outputPath)

  cmd = `${jscadPath} ${inputFile} ${params} -o ${outputPath}/file.stl `
  console.log(cmd)
  execSync(cmd, {stdio: [0, 1, 2]})
}
