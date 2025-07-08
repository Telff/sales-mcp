#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the MCP server by sending a list tools request
async function testMCPServer() {
  console.log('🧪 Testing Sales MCP Server...\n');

  const serverPath = path.join(__dirname, '..', 'src', 'index.js');
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Test request to list tools
  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  let response = '';
  let errorOutput = '';

  server.stdout.on('data', (data) => {
    response += data.toString();
  });

  server.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  server.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Server failed to start');
      console.error('Error output:', errorOutput);
      process.exit(1);
    }
  });

  // Send test request
  server.stdin.write(JSON.stringify(testRequest) + '\n');

  // Wait for response
  setTimeout(() => {
    try {
      // Extract JSON response from the mixed output
      const lines = response.split('\n');
      let jsonResponse = '';
      
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
          jsonResponse = line.trim();
          break;
        }
      }
      
      if (!jsonResponse) {
        console.log('❌ No JSON response found');
        console.log('Full output:', response);
        server.kill();
        process.exit(1);
      }
      
      const parsedResponse = JSON.parse(jsonResponse);
      
      if (parsedResponse.result && parsedResponse.result.tools) {
        console.log('✅ MCP Server is working correctly!');
        console.log(`📋 Found ${parsedResponse.result.tools.length} tools:\n`);
        
        parsedResponse.result.tools.forEach(tool => {
          console.log(`🔧 ${tool.name}`);
          console.log(`   ${tool.description}`);
          console.log('');
        });
      } else {
        console.log('❌ Unexpected response format');
        console.log('Response:', jsonResponse);
      }
    } catch (error) {
      console.log('❌ Failed to parse response');
      console.log('Response:', response);
      console.log('Error:', error.message);
    }

    server.kill();
    process.exit(0);
  }, 3000);
}

// Run the test
testMCPServer().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 