// Script này sẽ fetch dữ liệu recent encounters từ API backend và log ra console
// Chạy script này bằng: node fetchRecentEncounters.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/encounters?limit=10';

// Nếu cần token, thay YOUR_JWT_TOKEN vào đây
const TOKEN = '';

async function fetchRecentEncounters() {
  try {
    const res = await axios.get(API_URL, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    });
    const encounters = res.data?.data?.encounters || [];
    console.log('Fetched encounters:', encounters.length);
    encounters.forEach((enc, idx) => {
      console.log(`--- Encounter #${idx + 1} ---`);
      console.log('ID:', enc._id);
      console.log('Patient:', enc.patientId);
      console.log('CheckIn:', enc.checkInTime);
      console.log('Status:', enc.status);
      console.log('-------------------');
    });
  } catch (err) {
    console.error('Error fetching encounters:', err.response?.data || err.message);
  }
}

fetchRecentEncounters();
