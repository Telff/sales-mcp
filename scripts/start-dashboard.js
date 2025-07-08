#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Starting Sales MCP Dashboard...\n');

// Check if dashboard is built
const buildPath = path.join(projectRoot, 'dashboard', 'build');
if (!fs.existsSync(buildPath)) {
  console.log('📦 Building dashboard...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: path.join(projectRoot, 'dashboard'),
    stdio: 'inherit'
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dashboard built successfully!\n');
      startDashboard();
    } else {
      console.error('❌ Failed to build dashboard');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Dashboard already built\n');
  startDashboard();
}

function startDashboard() {
  console.log('🌐 Starting dashboard server...');
  console.log('📊 Dashboard will be available at: http://localhost:3001');
  console.log('🔌 API endpoints available at: http://localhost:3001/api/*');
  console.log('\nPress Ctrl+C to stop the server\n');
  
  const dashboardProcess = spawn('node', ['src/api-server.js'], {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  dashboardProcess.on('close', (code) => {
    console.log(`\n🛑 Dashboard server stopped (code: ${code})`);
  });
  
  dashboardProcess.on('error', (error) => {
    console.error('❌ Failed to start dashboard:', error.message);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dashboard...');
    dashboardProcess.kill();
    process.exit(0);
  });
} 