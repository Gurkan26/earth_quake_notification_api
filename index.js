const express = require('express');
const axios = require('axios');
const { sendNotificationToAll } = require('./sendNotification');

const app = express();

app.get('/', async (req, res) => {
  const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=now-1minutes&minmagnitude=4.5&latitude=41.0&longitude=29.0&maxradiuskm=250';

  try {
    const response = await axios.get(url);
    const earthquakes = response.data.features;

    if (earthquakes.length > 0) {
      const latest = earthquakes[0];
      const title = '⚠️ Deprem Uyarısı';
      const body = `${latest.properties.place} - M${latest.properties.mag}`;

      await sendNotificationToAll(title, body);
    }

    res.send('Kontrol tamam.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hata oluştu.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API aktif: http://localhost:${PORT}`);
});
