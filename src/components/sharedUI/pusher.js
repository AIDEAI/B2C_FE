// src/pusher.js
import Pusher from 'pusher-js';

// Initialize Pusher with your key and cluster
const pusher = new Pusher('222c7fac4de4c2009cac', { // Replace with your Key
  cluster: 'ap2'   ,
  encrypted: true,           // Replace with your Cluster
});

export default pusher;