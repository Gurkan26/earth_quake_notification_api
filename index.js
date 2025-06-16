const express = require('express');
const fetch = require('node-fetch');
const cron = require('node-cron');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const tokens = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Deprem API çalışıyor!');
});

app.post('/register-token', (req, res) => {
  const token = req.body.token;
  if (token && !tokens.includes(token)) {
    tokens.push(token);
    console.log('✅ Yeni token kaydedildi:', token);
    res.status(200).send('Token başarıyla kaydedildi.');
  } else {
    res.status(400).send('Token zaten kayıtlı veya geçersiz.');
  }
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

      if (tokens.length === 0) {
        console.log('🚫 Bildirim gönderilecek kullanıcı yok.');
        return;
      }

      const message = {
        notification: {
          title: '⚠️ Deprem Uyarısı',
          body: `${eq.properties.place} - ${eq.properties.mag} büyüklüğünde deprem oldu.`,
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log(`📤 ${response.successCount} kişiye bildirim gönderildi.`);
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
