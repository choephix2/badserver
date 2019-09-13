const config = require("./config.json")
const express = require("express")
const app = express()

const PORT = parseInt(process.argv[2])

const timeout = ms => new Promise(res => setTimeout(res, ms))

let selected_endpoint_index = 2

console.clear()

for ( let endpoint of config.endpoints )
  endpoint.current_mode_index = 0

for ( let endpoint of config.endpoints )
  for ( let method of endpoint.methods )
    app[method]( endpoint.route, (req,res)=> respond(req,res,endpoint) )

async function respond( req, res, cfg ) {
  let mode = cfg.modes[cfg.current_mode_index]
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
  let endpoint = config.endpoints[selected_endpoint_index]

  if (key == '\u001B\u005B\u0044') // left
    endpoint.current_mode_index = cycleSelection( endpoint.modes, endpoint.current_mode_index, -1 )
  if (key == '\u001B\u005B\u0043') // right
    endpoint.current_mode_index = cycleSelection( endpoint.modes, endpoint.current_mode_index, 1 )
  if (key == '\u001B\u005B\u0041') // up
    selected_endpoint_index = cycleSelection( config.endpoints, selected_endpoint_index, -1 )
  if (key == '\u001B\u005B\u0042') // down
    selected_endpoint_index = cycleSelection( config.endpoints, selected_endpoint_index, 1 )

  draw()

  if (key == '\u0003') { process.exit(); }    // ctrl-c
})
function cycleSelection( array, current, delta )
{ return [ current + delta + array.length ] % array.length }

function draw() {
  let endpoint = config.endpoints[selected_endpoint_index]

  let eplist = "", ep
  for ( let i = 0 ; i < config.endpoints.length ; i++ )
  {
    ep = config.endpoints[i]
    eplist += `\x1b[${i==selected_endpoint_index?'96;1':'96;2'}mroute: ${ep.route}\x1b[0m\n`
  }

  let topbar = "", c, name
  for ( let i = 0 ; i < endpoint.modes.length ; i++ )
  {
    c = endpoint.modes[i]
    name = c.name || c.status || "-?-"
    topbar += `\x1b[${i==endpoint.current_mode_index?'44;93;1':'94'}m ${name} \x1b[0m`
  }

  console.clear()
  console.log("\x1b[0;2mTest me on port \x1b[1m%s\x1b[0m\n", server.address().port)
  console.log( eplist, '\n' )
  console.log( topbar, '\n' )
  console.log( endpoint.modes[endpoint.current_mode_index] )
}
server = app.listen( PORT, () => draw() )
