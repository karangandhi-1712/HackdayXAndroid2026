<template>
  <div class="app-layout">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="brand-section">
        <div class="brand-logo-icon">
          <ShieldAlert :size="22" />
        </div>
        <div>
          <div class="brand-title">
            Ninja ScamShield
            <span class="brand-badge">Vue 3</span>
          </div>
        </div>
      </div>

      <div class="nav-actions">
        <!-- Live Remote Ninja REST Server Status -->
        <div class="server-status-pill" :title="serverStatus.error || (serverStatus.alive ? 'Remote Ninja API Connected' : 'Remote API Disconnected')">
          <span :class="['status-dot', serverStatus.checking ? 'checking' : serverStatus.alive ? 'online' : 'offline']" />
          <span>
            {{ serverStatus.checking
                ? 'Connecting to Ninja API...'
                : serverStatus.alive
                ? 'Ninja API Connected'
                : (apiBase ? 'Remote API Disconnected' : 'Endpoint Not Configured') }}
          </span>
        </div>

        <button class="btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem" @click="showSettings = !showSettings">
          <Settings :size="15" />
          <span>Config & API Key</span>
        </button>
      </div>
    </nav>

    <!-- Configuration Drawer for Remote API & Key -->
    <div v-if="showSettings" style="max-width: 1440px; margin: 0 auto; width: 100%; padding: 0 2rem">
      <div class="settings-drawer">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem">
          <h4 style="font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 0.4rem">
            <Settings :size="16" color="var(--accent-emerald)" /> Remote Ninja API & Authentication
          </h4>
          <button class="btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem" @click="checkServer">
            <RefreshCw :size="12" /> Test Connection
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
          <div>
            <label class="form-label">Remote Ninja API Endpoint URL</label>
            <input
              v-model="apiBase"
              type="text"
              class="form-input font-mono"
              placeholder="e.g. https://ninja-api.yourdomain.com"
            />
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem">
              Endpoint where Ninja is hosted. Saved automatically in your local browser storage.
            </div>
          </div>

          <div>
            <label class="form-label">Ninja API Key</label>
            <div style="position: relative">
              <input
                v-model="apiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="form-input font-mono"
                style="padding-right: 2.2rem"
                placeholder="Enter your Ninja API Key / Bearer token"
              />
              <button
                type="button"
                style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center"
                @click="showApiKey = !showApiKey"
              >
                <EyeOff v-if="showApiKey" :size="14" />
                <Eye v-else :size="14" />
              </button>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem">
              Passed as <code>Authorization: Bearer</code> and <code>X-API-Key</code> on all requests.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Header -->
    <header class="hero-header">
      <h1 style="font-size: 1.85rem; font-weight: 800">
        Email Scam & Threat Analysis Center
      </h1>
      <p class="hero-subtitle">
        Direct REST client for the Ninja email classification engine. Upload a folder of .eml files or submit message content for real-time analysis.
      </p>
    </header>

    <!-- Main Dashboard Grid -->
    <main class="dashboard-grid">
      <!-- Left Column: Ingestion Hub -->
      <section class="cyber-card">
        <div class="card-header-bar">
          <h2 class="card-title">
            <Terminal :size="18" color="var(--accent-emerald)" /> Email Ingestion Hub
          </h2>
          <span style="font-size: 0.78rem; color: var(--text-muted)">
            POST /v1/analyze
          </span>
        </div>

        <!-- Ingestion Tabs: Folder, Form Composer, Cut & Paste Raw -->
        <div class="tabs-nav">
          <button :class="['tab-btn', activeTab === 'folder' ? 'active' : '']" @click="activeTab = 'folder'">
            <FolderArchive :size="14" /> Folder (.eml)
          </button>
          <button :class="['tab-btn', activeTab === 'compose' ? 'active' : '']" @click="activeTab = 'compose'">
            <FileText :size="14" /> Form Composer
          </button>
          <button :class="['tab-btn', activeTab === 'raw' ? 'active' : '']" @click="activeTab = 'raw'">
            <Terminal :size="14" /> Cut & Paste Raw
          </button>
        </div>

        <!-- MODE 1: FOLDER OF .EML FILES -->
        <div v-if="activeTab === 'folder'">
          <!-- Hidden Folder Selector -->
          <input
            ref="folderInputRef"
            type="file"
            style="display: none"
            webkitdirectory=""
            directory=""
            multiple
            @change="handleFolderSelect"
          />

          <!-- Folder Selection Area -->
          <div
            class="drop-zone"
            style="padding: 1.75rem 1.25rem; margin-bottom: 1.25rem"
            @click="$refs.folderInputRef.click()"
          >
            <div class="drop-icon-wrap" style="width: 48px; height: 48px; margin-bottom: 0.6rem">
              <FolderUp :size="26" />
            </div>
            <div class="drop-title" style="font-size: 0.95rem">
              {{ folderFiles.length > 0 ? `${folderFiles.length} .eml files loaded` : 'Choose Folder of .eml Files' }}
            </div>
            <div class="drop-subtitle">
              Click to select any directory. Only .eml files will be parsed and queued for analysis.
            </div>
          </div>

          <!-- Progress Bar when scanning -->
          <div v-if="isBatchRunning" class="progress-bar-wrap">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary)">
              <span>Sending HTTP POST /v1/analyze requests to Ninja...</span>
              <span>{{ batchProgress.current }} / {{ batchProgress.total }}</span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: `${(batchProgress.current / Math.max(batchProgress.total, 1)) * 100}%` }"
              />
            </div>
          </div>

          <!-- Real Batch Stats: Appear ONLY after at least one email is analyzed -->
          <div v-if="completedItems.length > 0" class="batch-metrics-row">
            <div class="metric-card">
              <div class="metric-num">{{ totalScanned }}/{{ batchResults.length }}</div>
              <div class="metric-label">Analyzed</div>
            </div>
            <div class="metric-card">
              <div class="metric-num threats">{{ totalThreats }}</div>
              <div class="metric-label">Scam / Threats</div>
            </div>
            <div class="metric-card">
              <div class="metric-num safe">{{ totalSafe }}</div>
              <div class="metric-label">Benign / Safe</div>
            </div>
            <div class="metric-card">
              <div class="metric-num avg">{{ avgScore }}</div>
              <div class="metric-label">Avg Threat Score</div>
            </div>
          </div>

          <!-- Actions Bar for Folder Queue -->
          <div v-if="batchResults.length > 0" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem">
            <span style="font-size: 0.8rem; color: var(--text-secondary)">
              Folder Queue: <strong>{{ batchResults.length }}</strong> email(s)
            </span>
            <div style="display: flex; gap: 0.5rem">
              <button
                v-if="completedItems.length > 0"
                class="btn-secondary"
                style="padding: 0.35rem 0.75rem; font-size: 0.78rem"
                @click="exportBatchJSON"
              >
                <Download :size="13" /> Export Report (JSON)
              </button>
              <button
                class="btn-secondary"
                style="padding: 0.35rem 0.75rem; font-size: 0.78rem"
                @click="clearFolder"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Batch Table -->
          <div v-if="batchResults.length > 0" class="batch-table-wrap">
            <table class="batch-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>File / Subject</th>
                  <th>Score</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in batchResults"
                  :key="idx"
                  :class="['batch-row', selectedBatchIndex === idx ? 'selected' : '']"
                  @click="selectBatchRow(idx)"
                >
                  <td style="width: 95px">
                    <span :class="['badge-pill', getPillClass(item)]">
                      <RefreshCw v-if="item.status === 'scanning'" :size="10" class="animate-spin" />
                      {{ item.status }}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: #fff; font-size: 0.82rem; margin-bottom: 0.15rem">
                      {{ item.name }}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.75rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 280px">
                      {{ item.subject || item.path }}
                    </div>
                  </td>
                  <td style="width: 70px; font-family: var(--font-mono)">
                    {{ item.score !== null ? Number(item.score).toFixed(1) : '--' }}
                  </td>
                  <td style="width: 110px">
                    <span style="font-size: 0.75rem; color: var(--text-secondary)">
                      {{ item.category }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem">
            No folder selected yet. Click the box above to select a folder containing <code>.eml</code> files.
          </div>

          <!-- Run Batch Button -->
          <div v-if="batchResults.length > 0" class="submit-btn-row">
            <button
              class="btn-primary"
              :disabled="isBatchRunning"
              @click="runBatchAnalysis"
            >
              <template v-if="isBatchRunning">
                <RefreshCw :size="17" class="animate-spin" />
                <span>Processing with Ninja API ({{ batchProgress.current }}/{{ batchProgress.total }})...</span>
              </template>
              <template v-else>
                <Play :size="18" />
                <span>Analyze All Files in Folder ({{ batchResults.length }})</span>
              </template>
            </button>
          </div>
        </div>

        <!-- MODE 2: FORM COMPOSER -->
        <div v-if="activeTab === 'compose'">
          <div class="form-group">
            <label class="form-label">Sender (From)</label>
            <input v-model="composerFrom" type="text" class="form-input" placeholder="e.g. sender@domain.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Recipient (To)</label>
            <input v-model="composerTo" type="text" class="form-input" placeholder="e.g. recipient@target.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <input v-model="composerSubject" type="text" class="form-input" placeholder="Email subject line" />
          </div>

          <div class="form-group">
            <label class="form-label">Email Body (Cut & Paste)</label>
            <textarea
              v-model="composerBody"
              class="form-textarea"
              placeholder="Paste or write the email body content here..."
              rows="7"
            />
          </div>

          <div class="submit-btn-row">
            <button
              class="btn-primary"
              :disabled="isAnalyzing || !composerBody.trim()"
              @click="handleRunAnalysis"
            >
              <RefreshCw v-if="isAnalyzing" :size="17" class="animate-spin" />
              <ShieldAlert v-else :size="18" />
              <span>Send to Ninja API for Analysis</span>
            </button>
          </div>
        </div>

        <!-- MODE 3: RAW RFC-822 CUT & PASTE -->
        <div v-if="activeTab === 'raw'">
          <div class="form-group">
            <label class="form-label">Paste Complete RFC-822 MIME Headers & Body</label>
            <textarea
              v-model="rawEmailText"
              class="form-textarea code-textarea"
              rows="13"
              placeholder="From: ...&#10;To: ...&#10;Subject: ...&#10;Date: ...&#10;&#10;[Email Body here]"
            />
          </div>

          <div class="submit-btn-row">
            <button
              class="btn-primary"
              :disabled="isAnalyzing || !rawEmailText.trim()"
              @click="handleRunAnalysis"
            >
              <RefreshCw v-if="isAnalyzing" :size="17" class="animate-spin" />
              <ShieldAlert v-else :size="18" />
              <span>Analyze Raw Message (POST /v1/analyze)</span>
            </button>
          </div>
        </div>


        <!-- Real Error Message Banner -->
        <div v-if="analysisError" style="margin-top: 1rem; padding: 0.85rem 1rem; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-sm); color: var(--threat-critical); font-size: 0.85rem; display: flex; align-items: flex-start; gap: 0.5rem">
          <AlertTriangle :size="16" style="flex-shrink: 0; margin-top: 0.15rem" />
          <div>
            <div style="font-weight: 700; margin-bottom: 0.15rem">API Request Error</div>
            <div v-if="!serverStatus.alive" style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem">
              Please verify your remote Ninja API URL and API Key in the <strong>Config & API Key</strong> panel above.
            </div>
          </div>
        </div>
      </section>

      <!-- Right Column: Real Threat Analysis Results -->
      <section class="cyber-card">
        <div class="card-header-bar">
          <h2 class="card-title">
            <ShieldCheck :size="18" color="var(--threat-safe)" /> Analysis Verdict & Intelligence
          </h2>
          <span v-if="analysisResult?.cached" class="brand-badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3)">
            Cached
          </span>
        </div>

        <!-- Real Analysis Results Display -->
        <div v-if="analysisResult">
          <!-- Verdict Banner -->
          <div :class="['verdict-banner', riskClass]">
            <ScoreGauge :score="score" :max="analysisResult?.verdict?.score_max || 4" />

            <div class="verdict-info">
              <div class="verdict-category-row">
                <span :class="['category-tag', riskClass]">
                  {{ categoryChoice }}
                </span>
                <span v-if="analysisResult?.verdict?.model" style="font-size: 0.75rem; color: var(--text-muted)">
                  Model: {{ analysisResult.verdict.model }}
                </span>
              </div>

              <div class="verdict-headline">
                {{ score >= 3.5
                    ? 'Critical Threat Detected'
                    : score >= 2.5
                    ? 'High Scam Probability'
                    : score >= 1.5
                    ? 'Suspicious Activity Flagged'
                    : 'Message Appears Benign' }}
              </div>

              <div v-if="analysisResult?.verdict?.confidence !== undefined" class="confidence-indicator">
                Confidence: {{ Math.round(analysisResult.verdict.confidence * 100) }}%
              </div>

              <!-- Trigger levels from Ninja -->
              <div v-if="analysisResult?.verdict?.levels && analysisResult.verdict.levels.length" class="levels-wrap">
                <span v-for="(lvl, idx) in analysisResult.verdict.levels" :key="idx" class="level-badge">
                  {{ lvl }}
                </span>
              </div>
            </div>
          </div>

          <!-- Gemma / Jev Summary from Ninja -->
          <div v-if="analysisResult?.summary" class="ai-summary-box">
            <div class="summary-heading">
              <Sparkles :size="14" /> AI Analysis Summary
            </div>
            <p class="summary-text">{{ analysisResult.summary }}</p>
          </div>

          <!-- Subtabs for Deep-Dive Details -->
          <div class="tabs-nav" style="margin-bottom: 1rem">
            <button :class="['tab-btn', resultsSubTab === 'overview' ? 'active' : '']" @click="resultsSubTab = 'overview'">
              Overview & Auth
            </button>
            <button :class="['tab-btn', resultsSubTab === 'iocs' ? 'active' : '']" @click="resultsSubTab = 'iocs'">
              IoCs & Links ({{ analysisResult?.facts?.urls?.length || 0 }})
            </button>
            <button :class="['tab-btn', resultsSubTab === 'raw_json' ? 'active' : '']" @click="resultsSubTab = 'raw_json'">
              Raw JSON
            </button>
          </div>

          <!-- Subtab 1: Overview & Auth -->
          <div v-if="resultsSubTab === 'overview'">
            <!-- Email Authentication Grid -->
            <div v-if="analysisResult?.facts?.auth" class="fact-section">
              <div class="fact-title">
                <Shield :size="14" /> Email Authentication Verification
              </div>
              <div class="auth-grid">
                <div class="auth-card">
                  <div class="auth-name">SPF</div>
                  <div :class="['auth-result', analysisResult.facts.auth.spf || 'none']">
                    {{ analysisResult.facts.auth.spf || 'none' }}
                  </div>
                </div>

                <div class="auth-card">
                  <div class="auth-name">DKIM</div>
                  <div :class="['auth-result', analysisResult.facts.auth.dkim?.[0]?.status || 'none']">
                    {{ analysisResult.facts.auth.dkim?.[0]?.status || 'none' }}
                  </div>
                </div>

                <div class="auth-card">
                  <div class="auth-name">DMARC</div>
                  <div :class="['auth-result', analysisResult.facts.auth.dmarc || 'none']">
                    {{ analysisResult.facts.auth.dmarc || 'none' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Probability Distribution from Ninja -->
            <div v-if="analysisResult?.verdict?.category?.probabilities" class="fact-section">
              <div class="fact-title">Category Probability Distribution</div>
              <div style="background: var(--bg-input); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle)">
                <div v-for="(prob, cat) in analysisResult.verdict.category.probabilities" :key="cat" style="margin-bottom: 0.5rem">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.2rem">
                    <span>{{ cat }}</span>
                    <span class="font-mono">{{ (prob * 100).toFixed(1) }}%</span>
                  </div>
                  <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden">
                    <div
                      :style="{
                        width: `${prob * 100}%`,
                        height: '100%',
                        background: cat === 'Benign' ? 'var(--threat-safe)' : 'var(--threat-critical)',
                        borderRadius: '3px',
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Attachments extracted by Ninja -->
            <div v-if="analysisResult?.facts?.attachments?.length" class="fact-section">
              <div class="fact-title">
                <Paperclip :size="14" /> Attachments ({{ analysisResult.facts.attachments.length }})
              </div>
              <div v-for="(att, idx) in analysisResult.facts.attachments" :key="idx" class="ioc-item flagged">
                <div>
                  <div style="font-weight: 600; font-size: 0.85rem">{{ att.filename }}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted)">
                    {{ att.content_type }} • {{ (att.size_bytes / 1024).toFixed(1) }} KB
                  </div>
                </div>
                <span class="ioc-badge warning">ATTACHMENT</span>
              </div>
            </div>
          </div>

          <!-- Subtab 2: Extracted URLs & Domains -->
          <div v-if="resultsSubTab === 'iocs'">
            <div class="fact-section">
              <div class="fact-title">
                <Link2 :size="14" /> Extracted URLs & Domains
              </div>
              <template v-if="analysisResult?.facts?.urls?.length">
                <div v-for="(u, i) in analysisResult.facts.urls" :key="i" :class="['ioc-item', u.is_suspicious ? 'flagged' : '']">
                  <div class="ioc-main">
                    <div>{{ u.url }}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem">
                      Host: {{ u.domain }} {{ u.reason ? `• ${u.reason}` : '' }}
                    </div>
                  </div>
                  <span :class="['ioc-badge', u.is_suspicious ? 'warning' : 'clean']">
                    {{ u.is_suspicious ? 'SUSPICIOUS' : 'CLEAN' }}
                  </span>
                </div>
              </template>
              <div v-else style="font-size: 0.82rem; color: var(--text-muted); padding: 1rem; text-align: center">
                No URLs detected in this email.
              </div>
            </div>
          </div>

          <!-- Subtab 3: Raw JSON Response -->
          <div v-if="resultsSubTab === 'raw_json'" class="form-group">
            <textarea
              class="form-textarea code-textarea"
              :value="JSON.stringify(analysisResult, null, 2)"
              readonly
              rows="14"
            />
          </div>

          <!-- Message SHA-256 and Pipeline Execution Timings -->
          <div style="margin-top: 1.25rem">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem">
              <span>
                SHA-256: <code class="font-mono" style="color: var(--text-secondary)">{{ analysisResult?.message_sha256?.substring(0, 24) }}...</code>
              </span>
              <button class="btn-secondary" style="padding: 0.15rem 0.5rem; font-size: 0.72rem" @click="copyHash(analysisResult?.message_sha256)">
                <Check v-if="copiedHash" :size="12" color="var(--threat-safe)" />
                <Copy v-else :size="12" />
                <span>{{ copiedHash ? 'Copied' : 'Copy Hash' }}</span>
              </button>
            </div>

            <div v-if="analysisResult?.timings" class="timings-bar">
              <div class="timings-item">
                Extract: <span>{{ analysisResult.timings.extract_ms ?? 0 }}ms</span>
              </div>
              <div class="timings-item">
                Summarize: <span>{{ analysisResult.timings.summarize_ms ?? 0 }}ms</span>
              </div>
              <div class="timings-item">
                Score: <span>{{ analysisResult.timings.score_ms ?? 0 }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Initial Blank State: NO FAKE STATS OR DUMMY DATA -->
        <div v-else class="empty-state">
          <div class="empty-icon-wrap">
            <Shield :size="32" />
          </div>
          <h3 style="font-size: 1rem; color: #fff; margin-bottom: 0.35rem">No Analysis Run Yet</h3>
          <p style="font-size: 0.85rem; max-width: 320px">
            Upload a folder of <code>.eml</code> files or submit an email to see real-time classification metrics and threat intelligence.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  FileText,
  Terminal,
  Settings,
  RefreshCw,
  AlertTriangle,
  Link2,
  Paperclip,
  Check,
  Copy,
  Sparkles,
  FolderArchive,
  FolderUp,
  Play,
  Download,
  Eye,
  EyeOff,
} from 'lucide-vue-next'
import ScoreGauge from './components/ScoreGauge.vue'
import {
  checkNinjaHealth,
  analyzeEmail,
  buildRFC822,
  DEFAULT_API_BASE,
  DEFAULT_API_KEY,
} from './services/ninjaApi'

// Tabs: 'folder' | 'compose' | 'raw'
const activeTab = ref('folder')
const resultsSubTab = ref('overview')

// Remote API Server & Authentication State (persisted in localStorage)
const apiBase = ref(localStorage.getItem('ninja_api_url') || DEFAULT_API_BASE)
const apiKey = ref(localStorage.getItem('ninja_api_key') || DEFAULT_API_KEY)
const showApiKey = ref(false)
const serverStatus = ref({ alive: false, ready: false, checking: true, error: null })
const showSettings = ref(false)
const isAsyncWait = ref(false)

// Sync settings to localStorage
watch(apiBase, (val) => {
  if (val) localStorage.setItem('ninja_api_url', val)
  else localStorage.removeItem('ninja_api_url')
  checkServer()
})

watch(apiKey, (val) => {
  if (val) localStorage.setItem('ninja_api_key', val)
  else localStorage.removeItem('ninja_api_key')
  checkServer()
})

// Input Fields (Empty by default)
const composerFrom = ref('')
const composerTo = ref('')
const composerSubject = ref('')
const composerBody = ref('')

const rawEmailText = ref('')
const folderInputRef = ref(null)

// Folder Batch Queue (Empty by default)
const folderFiles = ref([])
const batchResults = ref([])
const isBatchRunning = ref(false)
const batchProgress = ref({ current: 0, total: 0 })
const selectedBatchIndex = ref(null)

// Live Analysis Result (Empty by default)
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const analysisError = ref(null)
const copiedHash = ref(false)

// Dynamic Score & Classification from actual Ninja response
const score = computed(() => analysisResult.value?.verdict?.score ?? 0)
const categoryChoice = computed(() => {
  if (analysisResult.value?.verdict?.category?.choice) {
    return analysisResult.value.verdict.category.choice
  }
  return score.value >= 2 ? 'Scam' : 'Benign'
})

const riskClass = computed(() => {
  if (score.value >= 3.5) return 'critical'
  if (score.value >= 2.5) return 'high'
  if (score.value >= 1.5) return 'medium'
  return 'safe'
})

// Real Batch Stats: computed dynamically ONLY from completed results
const completedItems = computed(() => batchResults.value.filter((i) => i.status === 'completed'))
const totalScanned = computed(() => completedItems.value.length)
const totalThreats = computed(() => completedItems.value.filter((i) => i.score >= 2.5).length)
const totalSafe = computed(() => completedItems.value.filter((i) => i.score < 1.5).length)
const avgScore = computed(() => {
  if (totalScanned.value === 0) return '0.00'
  const sum = completedItems.value.reduce((acc, i) => acc + (i.score || 0), 0)
  return (sum / totalScanned.value).toFixed(2)
})

let timer = null
onMounted(() => {
  checkServer()
  timer = setInterval(checkServer, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function checkServer() {
  serverStatus.value.checking = true
  const res = await checkNinjaHealth(apiBase.value, apiKey.value)
  serverStatus.value = { ...res, checking: false }
}

// Handle Folder Selection via HTML5 webkitdirectory
function handleFolderSelect(e) {
  const files = Array.from(e.target.files || [])
  const emlFiles = files.filter((f) => {
    const lower = f.name.toLowerCase()
    return lower.endsWith('.eml') || lower.endsWith('.msg') || lower.endsWith('.txt')
  })

  if (emlFiles.length === 0) {
    analysisError.value = 'No .eml or message files found in the selected folder.'
    return
  }

  folderFiles.value = emlFiles
  batchResults.value = emlFiles.map((file) => ({
    name: file.name,
    path: file.webkitRelativePath || file.name,
    file,
    status: 'pending',
    subject: 'Queued for analysis',
    sender: 'Pending',
    score: null,
    category: 'Pending',
    result: null,
  }))

  batchProgress.value = { current: 0, total: emlFiles.length }
  analysisError.value = null
  selectedBatchIndex.value = null
}

function clearFolder() {
  folderFiles.value = []
  batchResults.value = []
  batchProgress.value = { current: 0, total: 0 }
  selectedBatchIndex.value = null
  analysisResult.value = null
  if (folderInputRef.value) folderInputRef.value.value = ''
}

// Execute Batch Analysis sending real REST requests to Ninja
async function runBatchAnalysis() {
  if (batchResults.value.length === 0) return
  isBatchRunning.value = true
  analysisError.value = null

  const updatedBatch = [...batchResults.value]
  batchProgress.value = { current: 0, total: updatedBatch.length }

  for (let i = 0; i < updatedBatch.length; i++) {
    const item = updatedBatch[i]
    item.status = 'scanning'
    batchResults.value = [...updatedBatch]

    try {
      // Direct HTTP POST /v1/analyze to remote Ninja REST API
      const result = await analyzeEmail(item.file, {
        apiBase: apiBase.value,
        apiKey: apiKey.value,
        isAsync: isAsyncWait.value,
      })

      const sc = result?.verdict?.score ?? 0
      const cat = result?.verdict?.category?.choice ?? (sc >= 2 ? 'Scam' : 'Benign')
      const headers = result?.facts?.headers || {}
      const subject = headers.subject?.[0] || item.name
      const sender = headers.from?.[0] || 'Unknown'

      updatedBatch[i] = {
        ...item,
        status: 'completed',
        score: sc,
        category: cat,
        subject,
        sender,
        result,
      }

      // Automatically display the first analyzed result
      if (selectedBatchIndex.value === null || selectedBatchIndex.value === i) {
        analysisResult.value = result
        selectedBatchIndex.value = i
      }
    } catch (err) {
      console.error(`Error analyzing ${item.name}:`, err)
      updatedBatch[i] = {
        ...item,
        status: 'error',
        score: null,
        category: 'Failed',
        subject: `Error: ${err.message}`,
      }
    }

    batchProgress.value = { current: i + 1, total: updatedBatch.length }
    batchResults.value = [...updatedBatch]
  }

  isBatchRunning.value = false
}

function selectBatchRow(idx) {
  selectedBatchIndex.value = idx
  const item = batchResults.value[idx]
  if (item && item.result) {
    analysisResult.value = item.result
  }
}

function getPillClass(item) {
  if (item.status === 'scanning') return 'scanning'
  if (item.status === 'error') return 'critical'
  if (item.status !== 'completed') return 'pending'
  if (item.score >= 3.5) return 'critical'
  if (item.score >= 2.5) return 'high'
  if (item.score >= 1.5) return 'medium'
  return 'safe'
}

function exportBatchJSON() {
  const exportData = completedItems.value.map((i) => ({
    file: i.name,
    path: i.path,
    score: i.score,
    category: i.category,
    subject: i.subject,
    sender: i.sender,
    analysis: i.result,
  }))

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ninja_analysis_report_${Date.now()}.json`
  a.click()
}

// Single Message Analysis for Form Composer and Raw MIME
async function handleRunAnalysis() {
  isAnalyzing.value = true
  analysisError.value = null

  try {
    let payload
    if (activeTab.value === 'compose') {
      if (!composerBody.value.trim()) {
        throw new Error('Please enter an email body to analyze.')
      }
      payload = buildRFC822(composerFrom.value, composerTo.value, composerSubject.value, composerBody.value)
    } else {
      if (!rawEmailText.value.trim()) {
        throw new Error('Please paste RFC-822 email content to analyze.')
      }
      payload = rawEmailText.value
    }

    // Direct HTTP POST to remote Ninja API
    const res = await analyzeEmail(payload, {
      apiBase: apiBase.value,
      apiKey: apiKey.value,
      isAsync: isAsyncWait.value,
    })

    analysisResult.value = res
  } catch (err) {
    console.error('Analysis error:', err)
    analysisError.value = err.message || 'Analysis failed'
  } finally {
    isAnalyzing.value = false
  }
}

function copyHash(hash) {
  if (!hash) return
  navigator.clipboard.writeText(hash)
  copiedHash.value = true
  setTimeout(() => (copiedHash.value = false), 2000)
}
</script>
