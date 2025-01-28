const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const enlaces = [];
    $('#mw-pages a').each((index, element) => {
      const link = $(element).attr('href');
      if (link) {
        enlaces.push(`https://es.wikipedia.org${link}`);
      }
    });

    const rapData = [];

    for (const link of enlaces) {
      const { data: pageData } = await axios.get(link);
      const $$ = cheerio.load(pageData);

      const title = $$('h1').text();
      const images = [];
      $$('img').each((_, img) => {
        images.push($$(img).attr('src'));
      });
      const texts = [];
      $$('p').each((_, p) => {
        texts.push($$(p).text());
      });

      rapData.push({
        title,
        images,
        texts,
        link
      });
    }

    res.json(rapData);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al realizar el scraping');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
