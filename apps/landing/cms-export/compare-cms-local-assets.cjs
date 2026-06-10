const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
}

function parseLocalContent() {
  const raw = fs.readFileSync('src/contexts/ContentData.ts', 'utf8');
  const match = raw.match(/export const initialContent: SectionContent\[\] = ([\s\S]*)\s*$/);
  if (!match) throw new Error('Could not parse initialContent');
  return JSON.parse(match[1]);
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    out[prefix ? `${prefix}.${key}` : key] = String(value);
  }
  return out;
}

(async () => {
  const cms = await getJson('https://solar-buy-side-v2.onrender.com/api/content/sections');
  const cmsSections = cms.data;
  const localSections = parseLocalContent();
  const localMap = new Map(localSections.map(s => [s.id, s]));
  const sectionDiffs = [];
  const assetChecks = [];

  for (const cmsSection of cmsSections) {
    const local = localMap.get(cmsSection.id);
    if (!local) {
      sectionDiffs.push({ section: cmsSection.id, field: '(section)', issue: 'missing locally' });
      continue;
    }

    for (const group of ['texts', 'images']) {
      const cmsFlat = flatten(cmsSection[group]);
      const localFlat = flatten(local[group]);
      for (const [field, cmsValue] of Object.entries(cmsFlat)) {
        const localValue = localFlat[field];
        if (localValue !== cmsValue) {
          sectionDiffs.push({ section: cmsSection.id, field: `${group}.${field}`, issue: 'value mismatch', cmsValue, localValue });
        }
      }
    }

    for (const [key, value] of Object.entries(cmsSection.images || {})) {
      const val = String(value);
      if (val.startsWith('data:')) {
        assetChecks.push({ section: cmsSection.id, key, value: 'data-uri', status: 'embedded-in-cms' });
        continue;
      }
      if (!val.startsWith('/assets/')) {
        assetChecks.push({ section: cmsSection.id, key, value: val, status: 'non-asset-reference' });
        continue;
      }
      const rel = decodeURIComponent(val.replace(/^\//, ''));
      const localPath = path.join('public_html', rel);
      const exists = fs.existsSync(localPath);
      let remoteStatus = 'not-checked';
      let hashesMatch = false;
      let localHash = null;
      let remoteHash = null;
      let remoteLength = null;
      let localLength = exists ? fs.statSync(localPath).size : null;
      if (exists) localHash = hashFile(localPath);
      try {
        const remoteUrl = `https://solarbuyside.com.br${val.split('/').map((part, i) => i === 0 ? '' : encodeURIComponent(part)).join('/')}`;
        const res = await fetch(remoteUrl);
        remoteStatus = String(res.status);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          remoteLength = buf.length;
          remoteHash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
          hashesMatch = exists && localHash === remoteHash;
        }
      } catch (error) {
        remoteStatus = `error: ${error.message}`;
      }
      assetChecks.push({ section: cmsSection.id, key, value: val, exists, localLength, remoteLength, hashesMatch, localHash, remoteHash, remoteStatus });
    }
  }

  const report = { generatedAt: new Date().toISOString(), sectionCount: cmsSections.length, sectionDiffs, assetChecks };
  fs.mkdirSync('cms-export', { recursive: true });
  fs.writeFileSync('cms-export/compare-report.json', JSON.stringify(report, null, 2));

  console.log(`sections=${cmsSections.length}`);
  console.log(`sectionDiffs=${sectionDiffs.length}`);
  const badAssets = assetChecks.filter(a => a.exists === false || a.hashesMatch === false && a.value !== 'data-uri' && a.status !== 'embedded-in-cms');
  console.log(`assetChecks=${assetChecks.length}`);
  console.log(`badAssetChecks=${badAssets.length}`);
  for (const item of assetChecks) {
    const status = item.value === 'data-uri' ? 'DATA_URI' : item.hashesMatch ? 'MATCH' : item.exists === false ? 'MISSING_LOCAL' : `DIFF_OR_REMOTE_${item.remoteStatus}`;
    console.log(`${status}\t${item.section}.${item.key}\t${item.value}\tlocal=${item.localLength || ''}\tremote=${item.remoteLength || ''}`);
  }
})();
