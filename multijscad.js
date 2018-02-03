const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')
var _eval = require('eval')


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
  if(json['values']){
    array = json['values']
  }else{

    for(var i = json['min'];i <= json['max'];i+= step){
      array.push(i)
    }
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
total = 1
for ( var i = 0; i < data.length; i++) {
  array = to_array(data[i])
  total = total * array.length
  json[data[i]['name']] = array
}
console.log("total combinations will be "+ total)
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
for(var i=0;  i < combos.length; i++){
  params = ""
  folder = ""
  // TODO sort params so that the sha is always correct
  Object.keys(combos[i]).forEach(function(key) {
    params += ` --${key} ${combos[i][key]} `
    folder += `${key}_${combos[i][key]}__`
  })
  //folder = sha1(params)
  outputPath = `objects/${ftype}/${folder}/`
  mkdir_cmd = `mkdir -p ${outputPath}/`
  execSync(mkdir_cmd, {stdio: [0, 1, 2]})

  cmd = `${jscadPath} ${inputFile} ${params} -o ${outputPath}/file.stl `
  console.log(cmd)
  execSync(cmd, {stdio: [0, 1, 2]})
}
