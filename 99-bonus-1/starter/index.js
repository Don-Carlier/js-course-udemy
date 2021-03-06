const fs = require('fs');
const http = require('http');
const url = require('url');

const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const laptopData = JSON.parse(json);

const server = http.createServer((req, res) => {
   // console.log(req.url);
    const pathname = url.parse(req.url, true).pathname;
    const id = url.parse(req.url, true).query.id;

    if (pathname === '/products' || pathname === '/') {
        res.writeHead(200, {'Content-type': 'text/html'})
        
        


    } 
    
    else if (pathname === '/laptop' && id < laptopData.length) {
        res.writeHead(200, {'Content-type': 'text/html'})

        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8',(err, data) => {
            const laptop = laptopData[id];
            let output = data.replace(/{%PRODUCTNAME%}/g, laptop.productName);
            output = output.replace(/{%IMAGE%}/g, laptop.image);
            output = output.replace(/{%PRICE%}/g, laptop.price);
            output = output.replace(/{%SCREEN%}/g, laptop.screen);
            output = output.replace(/{%CPU%}/g, laptop.cpu);
            output = output.replace(/{%STORAGE%}/g, laptop.storage);
            output = output.replace(/{%RAM%}/g, laptop.ram);
            output = output.replace(/{%DESCRIPTION%}/g, laptop.description);

            res.end(output);
        });
    } 
    
    else {
        res.writeHead(404, {'Content-type': 'text/html'})
        res.end('Page was not found on server!');
    }
});

server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for requests now');
});

//function replaceTemplate(originalHtml, laptop)