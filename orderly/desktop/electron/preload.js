const { contextBridge } = require('electron');

const apiBaseUrl = process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:3000/api';

contextBridge.exposeInMainWorld('orderlyDesktop', {
  apiBaseUrl,
});
