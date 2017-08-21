'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });
var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'gstdb'
});
 var Controller = require('controller');


server.route({
    method: 'GET',
    path: '/bill',
    handler: function (request, reply) {
		if(conn.state === 'disconnected'){
	conn.connect();}
 conn.query('SELECT code,name,price,gst from Bill', function (error, results, fields) {
  if (error) resp='Bill Insert';
  var resp;
  //reply('The solution is: '+ results[0].solution);
   resp='<script src="./public/jquery-3.2.1.js"></script>'

resp+='<script>'
resp+="$('#messages').submit(function() {"

  resp+='$.post("./BillBook", {'
     resp+=' code: "code"'
    resp+='}'
    resp+=',function(name) {'
    resp+='  alert("Data Loaded: " + name);' // change for whatever callback you want
    resp+='});'

  resp+='return false;'
resp+='});'
resp+='</script>'

resp+='<form id = "messages" method="post" action="./BillBook">'
resp+='<input type="number" name="code">'
resp+='<input type="submit" method="submit">'
resp+='</form>'
resp+='<table>'
resp+='<tr><th>Code</th><th>Name</th><th>Price</th><th>Quantity</th><th>Total</th><th>GST</th><th>GST+TOTAL</th></tr>';
   for(var i in results){
	   resp+='<tr><td>'+results[i].code+'</td><td>'+results[i].name+'</td><td>'+results[i].price+'</td><td><input type="number" id="qnty" name="qnt"></td><td>'+ 0+'</td><td>'+results[i].gst+'</td><td></td></tr>';
   }
   resp+='<tr><th colspan="4">Total</th><td>'+ 0+'</td><th>Final</th><td></td></tr>'
   resp+='</table>'
   resp+='<form id="messages method="get" action="./Destroy"><input type="submit" value="New"></form>'
   resp+='<script>'
resp+='$(document).ready(function(){'
resp+='$("input").change(function(){'
resp+='var t= document.getElementsByTagName("TR");var total=0;var gst = 0;'
resp+='if(t.length>=3){for(i=1;i<t.length-1;i++){'
resp+='var h = t[i].getElementsByTagName("TD");'
resp+='var price = parseFloat(h[2].innerHTML);'
resp+='var st = parseFloat(h[5].innerHTML);'
resp+='var qnt = h[3].children[0];'
resp+='var Quantity = parseInt(qnt.value);'
resp+='h[4].innerHTML = price*Quantity;'
resp+='h[6].innerHTML = ((st)*(price*Quantity)/100)+price*Quantity;'
resp+='total+=parseFloat(h[4].innerHTML);'
resp+='gst+=parseFloat(h[6].innerHTML);}}'
resp+='t[t.length-1].children[1].innerHTML=total;'
resp+='t[t.length-1].children[3].innerHTML=gst;'
resp+='});});</script>'
   reply(resp);
});
 

       
    }
});





server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/public/jquery-3.2.1.js',
        handler: function (request, reply) {
            reply.file('./public/jquery-3.2.1.js');
        }
    });
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/add',
        handler: function (request, reply) {
            reply.file('./public/add.htm');
        }
    });
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/update',
        handler: function (request, reply) {
            reply.file('./public/update.html');
        }
    });
});


server.route([{
  method: 'GET',
  path: '/Destroy',
  handler: function (request, response){
    //var name = request.payload.name;
	//console.log(request.payload.name,parseInt(request.payload.code),parseFloat(request.payload.price)+parseFloat(request.payload.gst));
	if(conn.state === 'disconnected'){
	conn.connect();}
		//console.log(name);
		conn.query('DROP Table bill',function (error){
		if(error) throw error;
		console.log('TAble Dropped');
        });
		response.file('./public/add.htm').code(200);
  }
}]);
server.route([{
  method: 'POST',
  path: '/addBook',
  config: {
      payload: {
          output: 'data'
      }
  },
  handler: function (request, response){
    //var name = request.payload.name;
	//console.log(request.payload.name,parseInt(request.payload.code),parseFloat(request.payload.price)+parseFloat(request.payload.gst));
	if(conn.state === 'disconnected'){
	conn.connect();}
		//console.log(name);
		conn.query('Insert into Product(code,name,price,gst) values(?,?,?,?)',[parseInt(request.payload.code),request.payload.name,parseFloat(request.payload.price),parseFloat(request.payload.gst)],function (error, rows){
		if(error) throw error;
		console.log('The number of rows inserted',rows.affectedRows);
        });
		response.file('./public/add.htm').code(200);
  }
}]);

server.route([{
  method: 'POST',
  path: '/updBook',
  config: {
      payload: {
          output: 'data'
      }
  },
  handler: function (request, response){
    //var name = request.payload.name;
	//console.log(request.payload.name,parseInt(request.payload.code),parseFloat(request.payload.price)+parseFloat(request.payload.gst));
	if(conn.state === 'disconnected'){
	conn.connect();}
		//console.log(name);
		var val = request.payload.newd;
		if(request.payload.field=== 'gst'||request.payload.field==='price')
			val = parseFloat(request.payload.newd);
		var q = 'update Product set '+request.payload.field+' = ? where code = ?';
		conn.query(q,[val,parseInt(request.payload.code)],function (error, rows){
		if(error) throw error;
		console.log('The number of rows updated',rows.affectedRows);
        });
		response.file('./public/update.html').code(200);
  }
}]);

server.route([{
  method: 'POST',
  path: '/BillBook',
  config: {
      payload: {
          output: 'data'
      }
  },
  handler: function (request, response){
    //var name = request.payload.name;
	//console.log(request.payload.name,parseInt(request.payload.code),parseFloat(request.payload.price)+parseFloat(request.payload.gst));
	var code,name,price,gst;
	if(conn.state === 'disconnected'){
	conn.connect();}
		//console.log(name);
		conn.query('select * from product where code=?',[parseInt(request.payload.code)],function(err,row,fields){
			if(err) throw err;
			else{
				
				 code = row[0].code;
				 name = row[0].name;
				 price = row[0].price;
				 gst = row[0].gst;
			}
		});
		conn.query('Create table Bill (code int(10),name varchar(255),price float,gst float)',function(error){
			console.log('Table Created');
			if(error) 
			{
				conn.query('Insert into Bill(code,name,price,gst) values(?,?,?,?)',[code,name,price,gst],function (error, rows){
				if(error) throw error;
		console.log('The number of rows inserted',rows.affectedRows);
        });
			}
			else{
				conn.query('Insert into Bill(code,name,price,gst) values(?,?,?,?)',[code,name,price,gst],function (error, rows){
				if(error) throw error;
		console.log('The number of rows inserted',rows.affectedRows);
        });
			}
		});
		response().redirect('/bill');
  }
}]);


