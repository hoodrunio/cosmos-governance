import fs from 'fs/promises';

const SettingFileName = './settings.json';

async function initSettings() {
    return JSON.parse(await fs.readFile(SettingFileName, 'utf8'));
}

export const Settings = await initSettings();

