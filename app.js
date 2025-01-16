const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const url = "https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap";
const baseUrl = "https://es.wikipedia.org/"
const enlacesRaperos = [];
const detallesRaperos = [];

app.get("/", (req, res) => {
    const resp = axios(url).then((response) => {
        if(response.status === 200){
            const html = response.data
            /* console.log(html) */
            const $ = cheerio.load(html) 
            const title = $("title").text()  

            $(".mw-category-group a").each((index, element) => {
                const enlace = $(element).attr("href");
                const linkCompleto = baseUrl + enlace
                enlacesRaperos.push(linkCompleto);
            });
        
            /* console.log(enlacesRaperos); */
            enlacesRaperos.splice(0, 8);

            res.send(`
                <h1>${title}</h1>
                <a href="/raperos"><p>Raperos</p></a>
                `)
        }
    })
});

app.get("/raperos", async (req, res) => {
    try{
        if(!enlacesRaperos){
            return res.status(404).send("Error 404: No se ha Encontrado Enlace Disponible")
        }
        await Promise.all(
            enlacesRaperos.map(async (link) => {
                const response = await axios(link);
                const html = response.data;
                const $ = cheerio.load(html);

                const nombre = $(".mw-page-title-main").text();
                const imagen = $(".infobox img").attr("src");
                const texto = $("p").first().text();

                detallesRaperos.push({ nombre, imagen, texto});
            })
        );

        console.log(detallesRaperos); 
        
        let htmlRaperos = `<h1>Detalles de Raperos</h1>`;
        detallesRaperos.forEach(rapero => {
            htmlRaperos += `
                <div class="rapero">
                    <h2>${rapero.nombre}</h2>
                    <img src="${"http:" + rapero.imagen}" alt="${rapero.nombre}" style="max-width:200px;">
                    <p>${rapero.texto}</p>
                </div>`;
        });

        res.send(htmlRaperos);
    }
    catch(error){
        console.log(error, "Error en la Solicitud")
        res.status(500).send("Error 500 - Error en la Terminal");
    }
});

const server = app.listen (0, () => {
    console.log(`Server Listening On Port http://localhost${server.address().port}`);
})