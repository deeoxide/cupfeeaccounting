
const fs = require('fs');

function readJsonFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    return JSON.parse(content.trim());
}

const rawData = readJsonFile('C:\\Gemini_CLI\\raw_data.json');
// The new format is an array of { value: [...], Count: 4 }
const data = rawData.map(item => item.value);

const mapping = {
    'ຊັບສິນ': 'ASSET',
    'ໜີ້ສິນ': 'LIABILITY',
    'ສ່ວນເຈົ້າຂອງ': 'EQUITY',
    'ຕົ້ນທຶນ': 'EXPENSE', // More specific than 'ທຶນ'
    'ທຶນ': 'EQUITY',
    'ລາຍຮັບ': 'REVENUE',
    'ລາຍຈ່າຍ': 'EXPENSE'
};

const result = {};

for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    if (!Array.isArray(row)) continue;

    const code = row[0];
    const name = row[1];
    const typeLao = row[2];

    if (code === undefined || code === null || !typeLao) continue;

    let type = null;
    for (const [key, value] of Object.entries(mapping)) {
        if (typeLao.toString().includes(key)) {
            type = value;
            break;
        }
    }

    if (!type) continue;

    const normalBalance = (type === 'ASSET' || type === 'EXPENSE') ? 'DR' : 'CR';

    result[code.toString()] = {
        id: code.toString(),
        name: name,
        type: type,
        normalBalance: normalBalance,
        openingBalance: 0
    };
}

const output = JSON.stringify(result, null, 2);
fs.writeFileSync('accounts_update.json', output, 'utf8');
console.log('Successfully generated accounts_update.json');
