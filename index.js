// index.js
const express = require('express');
const fetch = require('node-fetch');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Örnek log
app.get('/', (req, res) => {
  res.send('Deprem API çalışıyor!');
});

// Her 1 dakikada bir deprem kontrolü
cron.schedule('* * * * *', async () => {
  console.log('🔍 Deprem kontrol ediliyor...');

  try {
    const response = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=now-1minute&minmagnitude=4.5');
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const eq = data.features[0];
      console.log(`⚠️ Deprem: ${eq.properties.place} - ${eq.properties.mag}`);
      // Burada Firebase'e push notification gönderilebilir.
    } else {
      console.log('📭 Yeni deprem yok.');
    }
  } catch (e) {
    console.error('Hata:', e);
  }
});

app.listen(PORT, () => {
  console.log(`🌍 Server ${PORT} portunda çalışıyor.`);
});