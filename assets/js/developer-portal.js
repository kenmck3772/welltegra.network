/**
 * Developer Portal for Software Designer
 * API Documentation, Sandbox, and Integration Examples
 */

export async function initDeveloperPortal() {
    const container = document.getElementById('developer-portal-content');
    if (!container) return;

    const apiEndpoints = [
        { method: 'GET', path: '/api/v1/wells', description: 'List all wells', auth: true },
        { method: 'GET', path: '/api/v1/wells/{id}', description: 'Get well details', auth: true },
        { method: 'POST', path: '/api/v1/wells', description: 'Create new well', auth: true },
        { method: 'PUT', path: '/api/v1/wells/{id}', description: 'Update well', auth: true },
        { method: 'GET', path: '/api/v1/operations', description: 'List operations', auth: true },
        { method: 'POST', path: '/api/v1/operations', description: 'Create operation', auth: true },
        { method: 'GET', path: '/api/v1/data-quality', description: 'Get data quality metrics', auth: true },
        { method: 'POST', path: '/api/v1/webhooks', description: 'Register webhook', auth: true }
    ];

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Sidebar Navigation -->
            <div class="lg:col-span-1">
                <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700 sticky top-4">
                    <h3 class="text-lg font-semibold text-white mb-4">Navigation</h3>
                    <nav class="space-y-2">
                        <a href="#getting-started" class="block px-3 py-2 rounded hover:bg-slate-700 transition text-slate-300 hover:text-white">Getting Started</a>
                        <a href="#authentication" class="block px-3 py-2 rounded hover:bg-slate-700 transition text-slate-300 hover:text-white">Authentication</a>
                        <a href="#endpoints" class="block px-3 py-2 rounded hover:bg-slate-700 transition text-slate-300 hover:text-white">API Endpoints</a>
                        <a href="#webhooks" class="block px-3 py-2 rounded hover:bg-slate-700 transition text-slate-300 hover:text-white">Webhooks</a>
                        <a href="#sandbox" class="block px-3 py-2 rounded hover:bg-slate-700 transition text-slate-300 hover:text-white">API Sandbox</a>
                        <a href="#examples" class="block px-3 py-2 rounded hover:bg-slate-700 transition text-slate-300 hover:text-white">Code Examples</a>
                    </nav>

                    <div class="mt-6 pt-6 border-t border-slate-700">
                        <div class="text-sm text-slate-400 mb-2">API Version</div>
                        <select class="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white">
                            <option>v1 (Current)</option>
                            <option>v1-beta</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="lg:col-span-3 space-y-8">
                <!-- Getting Started -->
                <section id="getting-started" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-2xl font-bold text-white mb-4">Getting Started</h3>
                    <p class="text-slate-300 mb-4">The Well-Tegra API provides programmatic access to well data, operations planning, and real-time monitoring capabilities.</p>

                    <div class="bg-slate-900 rounded-lg p-4 border border-slate-600">
                        <div class="text-sm text-slate-400 mb-2">Base URL</div>
                        <code class="text-emerald-400">https://api.welltegra.network/v1</code>
                    </div>

                    <div class="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-300 mb-2">Quick Start</h4>
                        <ol class="list-decimal list-inside space-y-2 text-slate-300">
                            <li>Generate an API key from your account settings</li>
                            <li>Include the API key in your request headers</li>
                            <li>Make requests to our RESTful endpoints</li>
                            <li>Handle responses in JSON format</li>
                        </ol>
                    </div>
                </section>

                <!-- Authentication -->
                <section id="authentication" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-2xl font-bold text-white mb-4">Authentication</h3>
                    <p class="text-slate-300 mb-4">All API requests require authentication using an API key passed in the Authorization header.</p>

                    <div class="bg-slate-900 rounded-lg p-4 border border-slate-600 overflow-x-auto">
                        <pre class="text-sm"><code class="text-slate-300">curl -X GET https://api.welltegra.network/v1/wells \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"</code></pre>
                    </div>

                    <div class="mt-4 bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                        <h4 class="font-semibold text-amber-300 mb-2">Security Best Practices</h4>
                        <ul class="list-disc list-inside space-y-1 text-slate-300 text-sm">
                            <li>Never expose API keys in client-side code</li>
                            <li>Rotate API keys regularly</li>
                            <li>Use environment variables for key storage</li>
                            <li>Enable IP whitelisting when possible</li>
                        </ul>
                    </div>
                </section>

                <!-- API Endpoints -->
                <section id="endpoints" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-2xl font-bold text-white mb-4">API Endpoints</h3>
                    <div class="space-y-3">
                        ${apiEndpoints.map(endpoint => `
                            <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition cursor-pointer endpoint-card" data-endpoint="${endpoint.path}">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-3 mb-2">
                                            <span class="method-badge bg-${getMethodColor(endpoint.method)}-600 text-white text-xs font-bold py-1 px-3 rounded">
                                                ${endpoint.method}
                                            </span>
                                            <code class="text-blue-400">${endpoint.path}</code>
                                        </div>
                                        <p class="text-sm text-slate-400">${endpoint.description}</p>
                                    </div>
                                    <button class="try-it-btn bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-3 rounded transition" data-endpoint="${endpoint.path}">
                                        Try it
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Webhooks -->
                <section id="webhooks" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-2xl font-bold text-white mb-4">Webhooks</h3>
                    <p class="text-slate-300 mb-4">Subscribe to real-time events using webhooks. Well-Tegra will POST event data to your specified URL.</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        ${['operation.started', 'operation.completed', 'alert.triggered', 'data.updated'].map(event => `
                            <div class="bg-slate-900/50 rounded p-3 border border-slate-600">
                                <code class="text-emerald-400 text-sm">${event}</code>
                            </div>
                        `).join('')}
                    </div>

                    <div class="bg-slate-900 rounded-lg p-4 border border-slate-600 overflow-x-auto">
                        <pre class="text-sm"><code class="text-slate-300">{
  "event": "operation.started",
  "timestamp": "2024-01-15T14:32:00Z",
  "data": {
    "operation_id": "op_123",
    "well_name": "A-15H",
    "operation_type": "Wireline"
  }
}</code></pre>
                    </div>
                </section>

                <!-- API Sandbox -->
                <section id="sandbox" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-2xl font-bold text-white mb-4">API Sandbox</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-300 mb-2">Request</label>
                            <select id="sandbox-endpoint" class="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white mb-3">
                                ${apiEndpoints.map(e => `<option value="${e.path}">${e.method} ${e.path}</option>`).join('')}
                            </select>
                            <textarea id="sandbox-request" rows="10" class="w-full bg-slate-900 border border-slate-600 rounded p-3 text-slate-300 font-mono text-sm" placeholder="Request body (JSON)"></textarea>
                            <button id="send-request" class="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition">
                                Send Request
                            </button>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-300 mb-2">Response</label>
                            <div id="sandbox-response" class="bg-slate-900 border border-slate-600 rounded p-4 h-full min-h-[300px] overflow-auto">
                                <div class="text-slate-500 text-sm">Response will appear here...</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Code Examples -->
                <section id="examples" class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 class="text-2xl font-bold text-white mb-4">Code Examples</h3>
                    <div class="space-y-4">
                        ${renderCodeExample('JavaScript', jsExample)}
                        ${renderCodeExample('Python', pythonExample)}
                        ${renderCodeExample('C#', csharpExample)}
                    </div>
                </section>
            </div>
        </div>
    `;

    initDeveloperPortalHandlers();
}

function getMethodColor(method) {
    const colors = {
        'GET': 'blue',
        'POST': 'emerald',
        'PUT': 'amber',
        'DELETE': 'red',
        'PATCH': 'purple'
    };
    return colors[method] || 'slate';
}

function renderCodeExample(language, code) {
    return `
        <div class="border border-slate-600 rounded-lg overflow-hidden">
            <div class="bg-slate-900 px-4 py-2 border-b border-slate-600 flex justify-between items-center">
                <span class="text-sm font-semibold text-slate-300">${language}</span>
                <button class="copy-btn text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition" data-code="${encodeURIComponent(code)}">
                    Copy
                </button>
            </div>
            <div class="bg-slate-950 p-4 overflow-x-auto">
                <pre class="text-sm"><code class="text-slate-300">${code}</code></pre>
            </div>
        </div>
    `;
}

const jsExample = `const response = await fetch('https://api.welltegra.network/v1/wells', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const wells = await response.json();
console.log(wells);`;

const pythonExample = `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
response = requests.get('https://api.welltegra.network/v1/wells', headers=headers)
wells = response.json()
print(wells)`;

const csharpExample = `using System.Net.Http;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_API_KEY");
var response = await client.GetAsync("https://api.welltegra.network/v1/wells");
var wells = await response.Content.ReadAsStringAsync();
Console.WriteLine(wells);`;

function initDeveloperPortalHandlers() {
    // Send request button
    document.getElementById('send-request')?.addEventListener('click', () => {
        const responseDiv = document.getElementById('sandbox-response');
        if (responseDiv) {
            responseDiv.innerHTML = `<pre class="text-sm text-emerald-400">{
  "status": "success",
  "data": {
    "wells": [
      { "id": "W666", "name": "The Perfect Storm", "status": "Shut-in" }
    ]
  },
  "meta": {
    "timestamp": "${new Date().toISOString()}",
    "version": "1.0"
  }
}</pre>`;
        }
    });

    // Copy code buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.dataset.code);
            navigator.clipboard.writeText(code);
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy', 2000);
        });
    });
}
