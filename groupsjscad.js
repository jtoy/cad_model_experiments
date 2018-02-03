const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')
var _eval = require('eval')
//var sha1 = require('sha1');


const args = process.argv.splice(2)
if(args.length < 1){
  console.log("pass file to parse")
  process.exit()
}

inputFile = args[0]
ftype = inputFile.split("/").slice(-1)[0].split(".")[0]
console.log("class: "+ftype)
let src = fs.readFileSync(inputFile, 'UTF8')
src += "\nparameterGroups()\n"
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

parameterGroups = new Function(src + ";\nreturn parameterGroups();");
data = parameterGroups();
//console.log("data",data)
total = 1
group_total = 0
groups =[]
console.log(data.length,"groups")
for ( var i = 0; i < data.length; i++) {
  groups.push([])
  json = {}
  total = 1
  console.log(data[i].length,"items in group")
  for ( var ii = 0; ii < data[i].length; ii++) {
    array = to_array(data[i][ii])
    total = total * array.length
    json[data[i][ii]['name']] = array
    //groups[i][data[i][ii]['name']] = array
  }
  groups[i] = json
  group_total += total
}
//console.log("json %", groups)

console.log("total combinations will be "+ group_total)
combos = []
for ( var i = 0; i < groups.length; i++) {
  combos.push([])
  combos[i] = Object.keys(groups[i]).reduce((acc, key) => {
    newArray = [];

    groups[i][key].forEach(item => {
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
}
//console.log("combos %",combos)
  jscadPath = "openjscad"
  for(var i=0;  i < combos.length; i++){

  for(var ii=0;  ii < combos[i].length; ii++){
    params = ""
    folder = ""
    // TODO sort params so that the sha is always correct
    Object.keys(combos[i][ii]).forEach(function(key) {
      params += ` --${key} ${combos[i][ii][key]} `
      folder += `${key}_${combos[i][ii][key]}__`
    })
    outputPath = `objects/${ftype}/${folder}/`
    cmd = `mkdir -p ${outputPath}`
    execSync(cmd, {stdio: [0, 1, 2]})

    cmd = `${jscadPath} ${inputFile} ${params} -o ${outputPath}/file.stl `
    console.log(cmd)
    execSync(cmd, {stdio: [0, 1, 2]})
  }
}
