const config = require("./config.json")
const express = require("express")
const app = express()

const PORT = parseInt(process.argv[2])

const timeout = ms => new Promise(res => setTimeout(res, ms))

let current_mode_index = 0, current_mode = config.modes[0]

console.clear()

async function respond(req, res) {
  let mode = current_mode
  
  if ( mode.delay )
    for ( let i = 0 ; i < mode.delay ; i++ )
      await timeout(1000)

  res.status( mode.status ).send( mode.text )
}

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function(key){
  if (key == '\u001B\u005B\u0044') // left
    current_mode_index = (current_mode_index-1+config.modes.length)%config.modes.length
  if (key == '\u001B\u005B\u0043') // right
    current_mode_index = (current_mode_index+1)%config.modes.length
  if (key == '\u001B\u005B\u0041') // up
    process.stdout.write('up')
  if (key == '\u001B\u005B\u0042') // down
    process.stdout.write('down')

  current_mode = config.modes[current_mode_index]
  draw()
  
  if (key == '\u0003') { process.exit(); }    // ctrl-c
})

app.get( '/*', respond )
app.post( '/*', respond )

function draw() {
  let topbar = "", c, name
  for ( let i = 0 ; i < config.modes.length ; i++ )
  {
    c = config.modes[i]
    name = c.name || c.status || "-?-"
    topbar += `\x1b[${i==current_mode_index?'44;93;1':'94'}m ${name} \x1b[0m`
  }

  console.clear()
  console.log("\x1b[0;2mTest me on port \x1b[1m%s\x1b[0m\n", server.address().port)
  console.log( topbar, '\n' )
  console.log( current_mode )
}
server = app.listen( PORT, () => draw() )
