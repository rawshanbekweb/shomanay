import fs from 'node:fs';

const d1 = JSON.parse(fs.readFileSync('./src/data/karakalpak.geojson', 'utf8'));
const d2 = JSON.parse(fs.readFileSync('./src/data/qoraqalpogiston.json', 'utf8'));

console.log('d1 items:', d1.features.map(f => f.properties.ADM1_UZ));
console.log('d2 items:', d2.features.map(f => f.properties.name));

// In d2: 'Amudarya', 'Chimbay', 'Kanlikul', 'Shumanay', 'Khojeyli', 'Kegeyli', 'Muynak', 'Nukus', 'Karauzyak', 'Kungrad', 'Takhtakupir', 'Nukus city', 'Turtkul', 'Beruniy', 'Ellikkala'
// In d1: has 'Takhiatash' and 'Bozatau'
// Let's create an unified list of 17 districts!
const target17 = [
  { key: 'nukus_city', nameQq: 'Nókis qalası', nameUz: 'Nukus shahri', center: 'Nókis', gdp: 4460.0, gdpText: '4,46 trillion', rank: 1 },
  { key: 'takhiatash', nameQq: 'Taqıyatas', nameUz: 'Taxiatosh', center: 'Taqıyatas', gdp: 2080.0, gdpText: '2,08 trillion', rank: 2 },
  { key: 'kungrad', nameQq: 'Qońırat', nameUz: 'Qoʻngʻirot', center: 'Qońırat', gdp: 873.9, gdpText: '873,9 milliard', rank: 3 },
  { key: 'amudarya', nameQq: 'Ámiwdárya', nameUz: 'Amudaryo', center: 'Mangʻıt', gdp: 821.8, gdpText: '821,8 milliard', rank: 4 },
  { key: 'karauzyak', nameQq: 'Qaraózek', nameUz: 'Qoraoʻzak', center: 'Qaraózek', gdp: 563.5, gdpText: '563,5 milliard', rank: 5 },
  { key: 'beruniy', nameQq: 'Beruniy', nameUz: 'Beruniy', center: 'Beruniy', gdp: 530.9, gdpText: '530,9 milliard', rank: 6 },
  { key: 'turtkul', nameQq: 'Tórtkól', nameUz: 'Toʻrtkoʻl', center: 'Tórtkól', gdp: 516.8, gdpText: '516,8 milliard', rank: 7 },
  { key: 'ellikqala', nameQq: 'Ellikqala', nameUz: 'Ellikqalʼa', center: 'Bostan', gdp: 489.2, gdpText: '489,2 milliard', rank: 8 },
  { key: 'chimbay', nameQq: 'Shımbay', nameUz: 'Chimboy', center: 'Shımbay', gdp: 412.3, gdpText: '412,3 milliard', rank: 9 },
  { key: 'nukus_district', nameQq: 'Nókis rayonı', nameUz: 'Nukus tumani', center: 'Aqmangʻıt', gdp: 345.2, gdpText: '345,2 milliard', rank: 10 },
  { key: 'taxtakupir', nameQq: 'Taxtakópir', nameUz: 'Taxtakoʻpir', center: 'Taxtakópir', gdp: 295.0, gdpText: '295,0 milliard', rank: 11 },
  { key: 'kegeyli', nameQq: 'Kegeyli', nameUz: 'Kegeyli', center: 'Kegeyli', gdp: 285.4, gdpText: '285,4 milliard', rank: 12 },
  { key: 'muynak', nameQq: 'Moynaq', nameUz: 'Moʻynoq', center: 'Moynaq', gdp: 272.9, gdpText: '272,9 milliard', rank: 13 },
  { key: 'khodjeyli', nameQq: 'Xójeli', nameUz: 'Xoʻjayli', center: 'Xójeli', gdp: 245.1, gdpText: '245,1 milliard', rank: 14 },
  { key: 'kanlykul', nameQq: 'Qanlıkól', nameUz: 'Qanlikoʻl', center: 'Qanlıkól', gdp: 174.3, gdpText: '174,3 milliard', rank: 15 },
  { key: 'shumanay', nameQq: 'Shomanay', nameUz: 'Shumanay', center: 'Shomanay', gdp: 128.1, gdpText: '128,1 milliard', rank: 16 },
  { key: 'bozatau', nameQq: 'Bozataw', nameUz: 'Boʻzatau', center: 'Bozataw', gdp: 112.0, gdpText: '112,0 milliard', rank: 17 },
];

const features = [];

for (const t of target17) {
  let matchedFeature = null;
  
  if (t.key === 'takhiatash') {
    matchedFeature = d1.features.find(f => f.properties.ADM1_UZ === 'Takhiatash');
  } else if (t.key === 'bozatau') {
    matchedFeature = d1.features.find(f => f.properties.ADM1_UZ === 'Bozatau');
  } else if (t.key === 'nukus_city') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Nukus city') || d1.features.find(f => f.properties.ADM1_UZ === 'Nukus');
  } else if (t.key === 'nukus_district') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Nukus') || d1.features.find(f => f.properties.ADM1_UZ === 'Nukus');
  } else if (t.key === 'amudarya') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Amudarya');
  } else if (t.key === 'shumanay') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Shumanay') || d1.features.find(f => f.properties.ADM1_UZ === 'Shumanai');
  } else if (t.key === 'kungrad') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Kungrad') || d1.features.find(f => f.properties.ADM1_UZ === 'Kungrad');
  } else if (t.key === 'muynak') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Muynak') || d1.features.find(f => f.properties.ADM1_UZ === 'Muynak');
  } else if (t.key === 'chimbay') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Chimbay') || d1.features.find(f => f.properties.ADM1_UZ === 'Chimbay');
  } else if (t.key === 'kegeyli') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Kegeyli') || d1.features.find(f => f.properties.ADM1_UZ === 'Kegali');
  } else if (t.key === 'kanlykul') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Kanlikul') || d1.features.find(f => f.properties.ADM1_UZ === 'Kanlikkul');
  } else if (t.key === 'khodjeyli') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Khojeyli') || d1.features.find(f => f.properties.ADM1_UZ === 'Hojeili');
  } else if (t.key === 'karauzyak') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Karauzyak') || d1.features.find(f => f.properties.ADM1_UZ === 'Karauzyak');
  } else if (t.key === 'taxtakupir') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Takhtakupir') || d1.features.find(f => f.properties.ADM1_UZ === 'Takhtakupir');
  } else if (t.key === 'beruniy') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Beruniy') || d1.features.find(f => f.properties.ADM1_UZ === 'Beruni');
  } else if (t.key === 'turtkul') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Turtkul') || d1.features.find(f => f.properties.ADM1_UZ === 'Turtkul');
  } else if (t.key === 'ellikqala') {
    matchedFeature = d2.features.find(f => f.properties.name === 'Ellikkala') || d1.features.find(f => f.properties.ADM1_UZ === 'Elikkala');
  }

  if (matchedFeature) {
    features.push({
      type: 'Feature',
      id: t.key,
      properties: {
        id: t.key,
        nameQq: t.nameQq,
        nameUz: t.nameUz,
        center: t.center,
        gdp: t.gdp,
        gdpText: t.gdpText,
        rank: t.rank,
        totalDistricts: 17,
        period: 'yanvar–iyun 2026'
      },
      geometry: matchedFeature.geometry
    });
    console.log('Matched:', t.key, '-> geometry type:', matchedFeature.geometry.type);
  } else {
    console.error('MISSING:', t.key);
  }
}

const finalGeojson = {
  type: 'FeatureCollection',
  features: features
};

fs.writeFileSync('./src/data/karakalpakstan_17_districts.json', JSON.stringify(finalGeojson));
console.log('Saved finalGeojson with', features.length, 'districts!');
