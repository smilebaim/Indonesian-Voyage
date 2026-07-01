import fs from 'fs';
const data = fs.readFileSync('public/indonesia.geojson', 'utf8');
const geojson = JSON.parse(data);
const properties = geojson.features.map(f => f.properties.state);
console.log(properties);
