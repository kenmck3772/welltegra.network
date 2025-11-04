(() => {
  'use strict';

  const REQUESTS_KEY = 'welltegra.mobileCommunicator.requests';
  const FEED_KEY = 'welltegra.mobileCommunicator.feed';
  const PLAN_KEY = 'welltegra.mobileCommunicator.plan';
  const MAX_FEED_ITEMS = 30;

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const defaultRequests = deepClone([
    {
      id: 'MOC-IE32-417',
      title: 'Lower final bridge plug to 8,536 ft MD',
      category: 'Program Amendment',
      risk: 'Medium',
      status: 'pending',
      initiatedBy: 'R. Doyle — Night Supervisor',
      openedAt: '2025-01-17T02:30:00Z',
      summary:
        'Downhole caliper indicated thinning tubing at 8,520 ft. Request to set the final bridge plug 16 ft deeper to capture the damaged interval.',
      impact: {
        production: 'None (well shut-in)',
        cost: '+$18,600 estimated',
        time: '+6 hrs rig time'
      },
      watchers: [
        { name: 'Amelia Holt', role: 'Intervention Superintendent' },
        { name: 'Luis Ortega', role: 'HSSE Advisor' }
      ],
      attachments: [
        { label: 'CCL trace', type: 'pdf' },
        { label: 'Caliper snapshot', type: 'png' }
      ],
      timeline: [
        {
          timestamp: '2025-01-17T02:31:00Z',
          actor: 'R. Doyle',
          role: 'Night Supervisor',
          action: 'submitted',
          message: 'Field request raised after tagging corroded tubing at 8,520 ft MD.'
        }
      ],
      updatedAt: '2025-01-17T02:31:00Z'
    },
    {
      id: 'MOC-IE32-418',
      title: 'Authorize sour-service pack-off swap',
      category: 'Management of Change',
      risk: 'High',
      status: 'pending',
      initiatedBy: 'S. Verma — Wellsite Supervisor',
      openedAt: '2025-01-17T04:10:00Z',
      summary:
        'Gas monitors trending 15 ppm H₂S on the tree deck. Request to install sour-service lubricator pack-off before pulling the live toolstring.',
      impact: {
        production: 'N/A',
        cost: '+$4,200 rental uplift',
        time: '+2 hrs rig-up'
      },
      watchers: [
        { name: 'Priya Desai', role: 'HSE Manager' },
        { name: 'Martin Shaw', role: 'Operations Manager' }
      ],
      attachments: [{ label: 'Gas detector log', type: 'csv' }],
      timeline: [
        {
          timestamp: '2025-01-17T04:12:00Z',
          actor: 'S. Verma',
          role: 'Wellsite Supervisor',
          action: 'submitted',
          message: 'Requested elastomer swap after gas detector peaked at 15 ppm H₂S.'
        }
      ],
      updatedAt: '2025-01-17T04:12:00Z'
    },
    {
      id: 'MOC-IE32-409',
      title: 'Close-out: Extend jet pump clean-up window',
      category: 'Program Amendment',
      risk: 'Low',
      status: 'approved',
      initiatedBy: 'Amelia Holt — Intervention Superintendent',
      openedAt: '2025-01-12T18:40:00Z',
      summary:
        'Retroactive approval to extend jet pump clean-up by two hours to recover additional solids before handover to production.',
      impact: {
        production: '+120 bbl/d forecast uplift',
        cost: '+$2,600 rig time',
        time: '+2 hrs rig time'
      },
      watchers: [{ name: 'Ken McKenzie', role: 'Asset Manager' }],
      attachments: [],
      timeline: [
        {
          timestamp: '2025-01-12T18:45:00Z',
          actor: 'Amelia Holt',
          role: 'Intervention Superintendent',
          action: 'approved',
          message: 'Approved during evening conference call — productivity gain offsets cost.',
          digitalSeal: 'AHOLT-20250112-6C31'
        }
      ],
      updatedAt: '2025-01-12T18:45:00Z'
    }
  ]);

  const defaultFeed = deepClone([
    {
      id: 'feed-20250117-0412',
      type: 'request',
      timestamp: Date.parse('2025-01-17T04:12:00Z'),
      headline: 'MOC-IE32-418 raised by S. Verma',
      detail: 'Pack-off swap requested after H₂S monitors alarmed on the tree deck.'
    },
    {
      id: 'feed-20250112-1845',
      type: 'signoff',
      timestamp: Date.parse('2025-01-12T18:45:00Z'),
      requestId: 'MOC-IE32-409',
      decision: 'approved',
      signer: 'Amelia Holt',
      role: 'Intervention Superintendent',
      detail: 'Jet pump clean-up extension approved from mobile communicator channel.'
    }
  ]);

  const authorizedSigners = {
    'amelia.holt@welltegra.com': {
      name: 'Amelia Holt',
      role: 'Intervention Superintendent',
      pin: '8264'
    },
    'martin.shaw@welltegra.com': {
      name: 'Martin Shaw',
      role: 'Operations Manager',
      pin: '1942'
    },
    'priya.desai@welltegra.com': {
      name: 'Priya Desai',
      role: 'HSE Manager',
      pin: '4701'
    }
  };

  const statusOrder = {
    pending: 0,
    'awaiting review': 1,
    approved: 2,
    rejected: 3
  };

  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const storageAvailable = (() => {
    try {
      const key = '__welltegra_mc__';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  })();

  const trapFocusWithin = (container) => {
    if (!container) return () => {};

    const isElementVisible = (element) => {
      if (!element) return false;
      if (element.hasAttribute('disabled')) return false;
      if (element.getAttribute('aria-hidden') === 'true') return false;
      const style = window.getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      return true;
    };

    const getFocusableElements = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter((element) => isElementVisible(element));

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  const safeParse = (raw, fallback) => {
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (error) {
      console.error('Failed to parse communicator payload', error);
      return fallback;
    }
  };

  const loadRequests = () => {
    const baselineMap = new Map(defaultRequests.map((req) => [req.id, req]));
    if (!storageAvailable) {
      return Array.from(baselineMap.values());
    }

    const stored = safeParse(window.localStorage.getItem(REQUESTS_KEY), []);
    if (!Array.isArray(stored)) {
      return Array.from(baselineMap.values());
    }

    stored.forEach((entry) => {
      if (!entry || typeof entry !== 'object' || !entry.id) {
        return;
      }
      const baseline = baselineMap.get(entry.id) ?? {
        id: entry.id,
        title: entry.title || 'Change request',
        category: entry.category || 'Management of Change',
        risk: entry.risk || 'Medium',
        status: entry.status || 'pending',
        initiatedBy: entry.initiatedBy || 'Unknown originator',
        openedAt: entry.openedAt || new Date().toISOString(),
        summary: entry.summary || '',
        impact: entry.impact || {},
        watchers: entry.watchers || [],
        attachments: entry.attachments || [],
        timeline: entry.timeline || [],
        updatedAt: entry.updatedAt || entry.openedAt || new Date().toISOString()
      };

      baselineMap.set(entry.id, {
        ...baseline,
        ...entry,
        impact: { ...baseline.impact, ...(entry.impact || {}) },
        watchers: Array.isArray(entry.watchers) ? entry.watchers : baseline.watchers,
        attachments: Array.isArray(entry.attachments) ? entry.attachments : baseline.attachments,
        timeline: Array.isArray(entry.timeline) ? entry.timeline : baseline.timeline,
        updatedAt: entry.updatedAt || baseline.updatedAt || new Date().toISOString()
      });
    });

    return Array.from(baselineMap.values());
  };

  const loadFeed = () => {
    if (!storageAvailable) {
      return defaultFeed.slice();
    }
    const stored = safeParse(window.localStorage.getItem(FEED_KEY), []);
    if (!Array.isArray(stored)) {
      return defaultFeed.slice();
    }
    return stored;
  };

  const loadPlanContext = () => {
    if (!storageAvailable) {
      return null;
    }
    const stored = safeParse(window.localStorage.getItem(PLAN_KEY), null);
    if (!stored || typeof stored !== 'object') {
      return null;
    }
    return stored;
  };

  const persistRequests = (requests) => {
    if (!storageAvailable) return;
    try {
      window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to persist communicator requests', error);
    }
  };

  const persistFeed = (feed) => {
    if (!storageAvailable) return;
    try {
      window.localStorage.setItem(FEED_KEY, JSON.stringify(feed));
    } catch (error) {
      console.error('Failed to persist communicator feed', error);
    }
  };

  const persistPlanContext = (planContext) => {
    if (!storageAvailable) return;
    try {
      if (!planContext) {
        window.localStorage.removeItem(PLAN_KEY);
        return;
      }
      window.localStorage.setItem(PLAN_KEY, JSON.stringify(planContext));
    } catch (error) {
      console.error('Failed to persist communicator plan context', error);
    }
  };

  const formatDateTime = (value) => {
    const date = typeof value === 'number' ? new Date(value) : new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const relativeTime = (() => {
    const hasRtf = 'Intl' in window && typeof window.Intl.RelativeTimeFormat === 'function';
    const rtf = hasRtf ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;
    return (value) => {
      if (!rtf) return '';
      const date = typeof value === 'number' ? new Date(value) : new Date(value || Date.now());
      if (Number.isNaN(date.getTime())) return '';
      const diffMs = date.getTime() - Date.now();
      const diffMinutes = diffMs / 60000;
      const absMinutes = Math.abs(diffMinutes);
      if (absMinutes < 1) return rtf.format(0, 'minute');
      if (absMinutes < 60) return rtf.format(Math.round(diffMinutes), 'minute');
      if (absMinutes < 60 * 24) return rtf.format(Math.round(diffMinutes / 60), 'hour');
      if (absMinutes < 60 * 24 * 7) return rtf.format(Math.round(diffMinutes / (60 * 24)), 'day');
      if (absMinutes < 60 * 24 * 30) return rtf.format(Math.round(diffMinutes / (60 * 24 * 7)), 'week');
      if (absMinutes < 60 * 24 * 365) return rtf.format(Math.round(diffMinutes / (60 * 24 * 30)), 'month');
      return rtf.format(Math.round(diffMinutes / (60 * 24 * 365)), 'year');
    };
  })();

  const computeLastUpdated = (requests, feed) => {
    const timestamps = [];
    requests.forEach((req) => {
      if (req.updatedAt) {
        const value = Date.parse(req.updatedAt);
        if (!Number.isNaN(value)) {
          timestamps.push(value);
        }
      }
    });
    feed.forEach((item) => {
      const value = typeof item.timestamp === 'number' ? item.timestamp : Date.parse(item.timestamp);
      if (!Number.isNaN(value)) {
        timestamps.push(value);
      }
    });
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps));
  };

  const generateSeal = (email) => {
    const prefix = (email.split('@')[0] || 'signer').replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
    const dateStamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    let nonce = Math.random().toString(16).slice(2, 10).toUpperCase();
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      nonce = buffer[0].toString(16).toUpperCase().padStart(8, '0');
    }
    return `${prefix}-${dateStamp}-${nonce}`;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('mobile-communicator');
    const openBtn = document.getElementById('open-mobile-communicator');
    const closeBtn = document.getElementById('close-mobile-communicator');
    const requestList = document.getElementById('communicator-request-list');
    const emptyState = document.getElementById('communicator-empty');
    const statusBadge = document.getElementById('communicator-detail-status');
    const categoryBadge = document.getElementById('communicator-detail-category');
    const metaText = document.getElementById('communicator-detail-meta');
    const titleEl = document.getElementById('communicator-detail-title');
    const summaryEl = document.getElementById('communicator-detail-summary');
    const impactList = document.getElementById('communicator-detail-impact');
    const watchersList = document.getElementById('communicator-detail-watchers');
    const timelineList = document.getElementById('communicator-timeline');
    const form = document.getElementById('communicator-signoff-form');
    const emailInput = document.getElementById('communicator-email');
    const pinInput = document.getElementById('communicator-pin');
    const commentInput = document.getElementById('communicator-comment');
    const feedbackRegion = document.getElementById('communicator-feedback');
    const feedList = document.getElementById('communicator-feed');
    const feedEmpty = document.getElementById('communicator-feed-empty');
    const summaryTotal = document.getElementById('communicator-summary-total');
    const summaryPending = document.getElementById('communicator-summary-pending');
    const summaryApproved = document.getElementById('communicator-summary-approved');
    const lastSync = document.getElementById('communicator-last-sync');
    const pendingBadge = document.getElementById('communicator-pending-badge');
    const planContextCard = document.getElementById('communicator-plan-context');
    const planName = document.getElementById('communicator-plan-name');
    const planMeta = document.getElementById('communicator-plan-meta');
    const planCost = document.getElementById('communicator-plan-cost');
    const planDuration = document.getElementById('communicator-plan-duration');
    const planCrew = document.getElementById('communicator-plan-crew');
    const planHighlight = document.getElementById('communicator-plan-highlight');
    const planRisks = document.getElementById('communicator-plan-risks');
    const planSteps = document.getElementById('communicator-plan-steps');
    const planCrewList = document.getElementById('communicator-plan-crew-list');
    const planEmpty = document.getElementById('communicator-plan-empty');
    const attachmentsList = document.getElementById('communicator-detail-attachments');

    if (!overlay || !openBtn || !closeBtn || !requestList || !form) {
      return;
    }

    const state = {
      requests: loadRequests(),
      feed: loadFeed(),
      planContext: loadPlanContext(),
      selectedId: null,
      previousFocus: null
    };

    let releaseFocusTrap = null;

    const ensureSelection = () => {
      if (state.selectedId && state.requests.some((req) => req.id === state.selectedId)) {
        return;
      }
      const firstPending = state.requests.find((req) => (req.status || '').toLowerCase() === 'pending');
      state.selectedId = (firstPending || state.requests[0] || {}).id || null;
    };

    const setFeedback = (message, tone = 'neutral') => {
      if (!feedbackRegion) return;
      feedbackRegion.textContent = message;
      feedbackRegion.classList.remove('text-emerald-300', 'text-rose-300');
      if (tone === 'positive') {
        feedbackRegion.classList.add('text-emerald-300');
      } else if (tone === 'negative') {
        feedbackRegion.classList.add('text-rose-300');
      }
    };

    const updateSummary = () => {
      const total = state.requests.length;
      const pendingCount = state.requests.filter((req) => (req.status || '').toLowerCase() === 'pending').length;
      const approvedCount = state.requests.filter((req) => (req.status || '').toLowerCase() === 'approved').length;

      if (summaryTotal) summaryTotal.textContent = String(total);
      if (summaryPending) summaryPending.textContent = String(pendingCount);
      if (summaryApproved) summaryApproved.textContent = String(approvedCount);
      if (pendingBadge) {
        pendingBadge.textContent = String(pendingCount);
        pendingBadge.classList.toggle('hidden', pendingCount === 0);
      }
      if (pendingBadge) pendingBadge.textContent = String(pendingCount);
      if (openBtn) {
        const labelBase = 'Open mobile communicator';
        const badge = pendingCount === 1 ? '1 request awaiting sign-off' : `${pendingCount} requests awaiting sign-off`;
        openBtn.setAttribute('aria-label', `${labelBase} (${badge})`);
        openBtn.setAttribute('aria-expanded', overlay.classList.contains('hidden') ? 'false' : 'true');
      }
      const updatedAt = computeLastUpdated(state.requests, state.feed);
      if (lastSync) {
        lastSync.textContent = updatedAt ? formatDateTime(updatedAt) : '—';
      }
    };

    const badgeClassForStatus = (status) => {
      const normalized = (status || '').toLowerCase();
      if (normalized === 'approved') return 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
      if (normalized === 'rejected') return 'border border-rose-500/40 bg-rose-500/10 text-rose-200';
      if (normalized === 'pending' || normalized === 'awaiting review') {
        return 'border border-amber-500/40 bg-amber-500/10 text-amber-200';
      }
      return 'border border-slate-700/60 bg-slate-800/80 text-slate-200';
    };

    const badgeClassForRisk = (risk) => {
      const normalized = (risk || '').toLowerCase();
      if (normalized === 'high') return 'border border-rose-500/40 bg-rose-500/15 text-rose-200';
      if (normalized === 'medium') return 'border border-amber-500/40 bg-amber-500/15 text-amber-200';
      return 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
    };

    const renderPlanContext = () => {
      if (!planContextCard) return;
      planContextCard.classList.remove('hidden');

      const context = state.planContext;
      if (!context) {
        if (planName) planName.textContent = 'No plan synced';
        if (planMeta) planMeta.textContent = 'Generate a program to expose plan context for sign-off.';
        if (planCost) planCost.textContent = '—';
        if (planDuration) planDuration.textContent = '—';
        if (planCrew) planCrew.textContent = '—';
        if (planHighlight) {
          planHighlight.textContent = '';
          planHighlight.classList.add('hidden');
        }
        if (planRisks) {
          planRisks.innerHTML = '';
          planRisks.classList.add('hidden');
        }
        if (planSteps) {
          planSteps.innerHTML = '';
          planSteps.classList.add('hidden');
        }
        if (planCrewList) {
          planCrewList.innerHTML = '';
          planCrewList.classList.add('hidden');
        }
        if (planEmpty) planEmpty.classList.remove('hidden');
        return;
      }

      const metaParts = [];
      if (context.wellName) metaParts.push(context.wellName);
      if (context.objectiveName) metaParts.push(`Objective: ${context.objectiveName}`);
      if (context.timestamp) metaParts.push(`Synced ${formatDateTime(context.timestamp)}`);
      if (planName) planName.textContent = context.name || 'Generated program';
      if (planMeta) planMeta.textContent = metaParts.join(' • ') || '—';
      if (planCost) planCost.textContent = context.cost || '—';
      if (planDuration) planDuration.textContent = context.duration || '—';
      if (planCrew) planCrew.textContent = context.crew || '—';

      if (planHighlight) {
        const highlightParts = [];
        if (context.objectiveDescription) highlightParts.push(context.objectiveDescription);
        if (context.sustainabilityHighlight) highlightParts.push(context.sustainabilityHighlight);
        const highlightText = highlightParts.join(' ');
        planHighlight.textContent = highlightText;
        planHighlight.classList.toggle('hidden', highlightText.length === 0);
      }

      if (planRisks) {
        if (Array.isArray(context.riskSummary) && context.riskSummary.length > 0) {
          planRisks.innerHTML = context.riskSummary
            .map((risk) => {
              const label = risk?.label || 'Moderate';
              const category = risk?.category ? risk.category.replace(/_/g, ' ') : 'Risk';
              return `
                <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${badgeClassForRisk(label)}">
                  <span class="text-[0.65rem] uppercase tracking-wide text-slate-200">${escapeHTML(category)}</span>
                  <span class="text-xs text-slate-100">${escapeHTML(label)}</span>
                </span>
              `;
            })
            .join('');
          planRisks.classList.remove('hidden');
        } else {
          planRisks.innerHTML = '';
          planRisks.classList.add('hidden');
        }
      }

      if (planSteps) {
        if (Array.isArray(context.topSteps) && context.topSteps.length > 0) {
          planSteps.innerHTML = context.topSteps
            .map(
              (step) => `
                <li class="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-200">
                  <span class="mr-2 font-semibold text-cyan-300">${escapeHTML(String(step.order || 1))}.</span>
                  ${escapeHTML(step.text || '')}
                </li>
              `
            )
            .join('');
          planSteps.classList.remove('hidden');
        } else {
          planSteps.innerHTML = '';
          planSteps.classList.add('hidden');
        }
      }

      if (planCrewList) {
        if (Array.isArray(context.personnel) && context.personnel.length > 0) {
          planCrewList.innerHTML = context.personnel
            .map(
              (person) => `
                <li class="rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200">
                  ${escapeHTML(person)}
                </li>
              `
            )
            .join('');
          planCrewList.classList.remove('hidden');
        } else {
          planCrewList.innerHTML = '';
          planCrewList.classList.add('hidden');
        }
      }

      if (planEmpty) planEmpty.classList.add('hidden');
    };

    const renderRequestList = () => {
      const sorted = state.requests.slice().sort((a, b) => {
        const statusDiff = (statusOrder[(a.status || '').toLowerCase()] ?? 99) - (statusOrder[(b.status || '').toLowerCase()] ?? 99);
        if (statusDiff !== 0) return statusDiff;
        const aTime = Date.parse(a.openedAt || 0);
        const bTime = Date.parse(b.openedAt || 0);
        return bTime - aTime;
      });

      requestList.innerHTML = '';
      if (sorted.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }
      if (emptyState) emptyState.classList.add('hidden');

      sorted.forEach((req) => {
        const isSelected = state.selectedId === req.id;
        const openedRelative = relativeTime(req.openedAt);
        const li = document.createElement('li');
        li.innerHTML = `
          <button type="button" data-request-id="${escapeHTML(req.id)}" class="w-full rounded-2xl border ${
            isSelected ? 'border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-900/20' : 'border-slate-800 bg-slate-900/40'
          } px-4 py-3 text-left transition hover:border-cyan-500/50 hover:bg-cyan-500/10">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-slate-100">${escapeHTML(req.id)}</span>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${badgeClassForStatus(req.status)}">
                ${escapeHTML((req.status || 'Pending').charAt(0).toUpperCase() + (req.status || 'Pending').slice(1))}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-300">${escapeHTML(req.title || 'Change request')}</p>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span class="inline-flex items-center gap-2">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${badgeClassForRisk(req.risk)}">${escapeHTML(req.risk || 'Medium')} risk</span>
                <span class="flex items-center gap-1">${formatDateTime(req.openedAt)}${openedRelative ? `<span class=\"text-slate-600\">· ${escapeHTML(openedRelative)}</span>` : ''}</span>
              </span>
              <span class="truncate">${escapeHTML(req.initiatedBy || '')}</span>
            </div>
          </button>
        `;
        requestList.appendChild(li);
      });
    };

    const renderDetail = () => {
      ensureSelection();
      const current = state.requests.find((req) => req.id === state.selectedId) || null;
      if (!current) {
        if (statusBadge) statusBadge.classList.add('hidden');
        if (categoryBadge) categoryBadge.classList.add('hidden');
        if (metaText) metaText.textContent = '';
        if (titleEl) titleEl.textContent = 'Select a change request';
        if (summaryEl) summaryEl.textContent = 'Choose a request from the list to review the justification, impact, and supporting evidence before granting remote approval.';
        if (impactList) impactList.innerHTML = '';
        if (watchersList) watchersList.innerHTML = '';
        if (attachmentsList) attachmentsList.innerHTML = '';
        if (timelineList) timelineList.innerHTML = '';
        setFeedback('');
        return;
      }

      if (statusBadge) {
        statusBadge.textContent = (current.status || 'Pending').toUpperCase();
        statusBadge.className = `rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeClassForStatus(current.status)}`;
        statusBadge.classList.remove('hidden');
      }
      if (categoryBadge) {
        if (current.category) {
          categoryBadge.textContent = current.category.toUpperCase();
          categoryBadge.className = 'rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200';
          categoryBadge.classList.remove('hidden');
        } else {
          categoryBadge.classList.add('hidden');
        }
      }
      if (metaText) {
        const relative = relativeTime(current.openedAt);
        const relativePart = relative ? ` (${relative})` : '';
        metaText.textContent = `Raised ${formatDateTime(current.openedAt)}${relativePart} by ${current.initiatedBy || 'unknown originator'}`;
      }
      if (titleEl) {
        titleEl.textContent = `${current.title || current.id}`;
      }
      if (summaryEl) {
        summaryEl.textContent = current.summary || 'No summary provided for this request.';
      }
      if (impactList) {
        const impactEntries = Object.entries(current.impact || {});
        if (impactEntries.length === 0) {
          impactList.innerHTML = '';
        } else {
          impactList.innerHTML = impactEntries
            .map(
              ([key, value]) => `
                <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">${escapeHTML(key)}</dt>
                  <dd class="mt-1 text-sm text-slate-200">${escapeHTML(value)}</dd>
                </div>
              `
            )
            .join('');
        }
      }
      if (watchersList) {
        if (!Array.isArray(current.watchers) || current.watchers.length === 0) {
          watchersList.innerHTML = '<li class="text-slate-500">No watchers assigned.</li>';
        } else {
          watchersList.innerHTML = current.watchers
            .map(
              (watcher) => `
                <li class="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1">
                  <span class="text-[0.7rem] font-semibold text-slate-200">${escapeHTML(watcher.name)}</span>
                  <span class="text-[0.65rem] uppercase tracking-wide text-slate-500">${escapeHTML(watcher.role)}</span>
                </li>
              `
            )
            .join('');
        }
      }
      if (attachmentsList) {
        if (!Array.isArray(current.attachments) || current.attachments.length === 0) {
          attachmentsList.innerHTML = '<li class="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-xs text-slate-500">No supporting files uploaded.</li>';
        } else {
          attachmentsList.innerHTML = current.attachments
            .map((attachment) => {
              const label = attachment?.label || 'Attachment';
              const type = (attachment?.type || 'file').toUpperCase();
              return `
                <li class="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  <span class="text-[0.65rem] uppercase tracking-wide text-cyan-200">${escapeHTML(type)}</span>
                  <span>${escapeHTML(label)}</span>
                </li>
              `;
            })
            .join('');
        }
      }
      if (timelineList) {
        if (!Array.isArray(current.timeline) || current.timeline.length === 0) {
          timelineList.innerHTML = '<li class="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">No activity logged yet.</li>';
        } else {
          timelineList.innerHTML = current.timeline
            .slice()
            .sort((a, b) => Date.parse(b.timestamp || 0) - Date.parse(a.timestamp || 0))
            .map((event) => {
              const action = (event.action || '').replace(/-/g, ' ');
              const sealLine = event.digitalSeal
                ? `<p class="mt-2 text-[0.65rem] font-mono uppercase tracking-wide text-cyan-300">Seal: ${escapeHTML(event.digitalSeal)}</p>`
                : '';
              return `
                <li class="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>${formatDateTime(event.timestamp)}</span>
                    <span class="font-semibold capitalize text-slate-300">${escapeHTML(action || 'update')}</span>
                  </div>
                  <p class="mt-2 text-sm text-slate-200">${escapeHTML(event.actor || 'Unknown')} <span class="text-xs uppercase tracking-wide text-slate-500">${escapeHTML(event.role || '')}</span></p>
                  <p class="mt-1 text-sm text-slate-300">${escapeHTML(event.message || '')}</p>
                  ${sealLine}
                </li>
              `;
            })
            .join('');
        }
      }

      const status = (current.status || '').toLowerCase();
      const isLocked = status !== 'pending' && status !== 'awaiting review';
      [emailInput, pinInput, commentInput].forEach((input) => {
        if (!input) return;
        input.disabled = isLocked;
        input.classList.toggle('opacity-60', isLocked);
      });
      form
        .querySelectorAll('button[data-decision]')
        .forEach((button) => {
          button.disabled = isLocked;
          button.classList.toggle('opacity-50', isLocked);
        });

      if (isLocked) {
        const lastDecision = (current.timeline || [])
          .slice()
          .find((event) => ['approved', 'rejected'].includes((event.action || '').toLowerCase()));
        const message = lastDecision
          ? `${(current.status || 'approved').toUpperCase()} by ${lastDecision.actor || 'unknown'} on ${formatDateTime(
              lastDecision.timestamp
            )}`
          : `Request ${current.status || 'closed'}.`;
        setFeedback(message, status === 'rejected' ? 'negative' : 'positive');
      } else {
        setFeedback('Enter your WellTegra credentials to sign remotely.');
      }
    };

    const renderFeed = () => {
      if (!feedList) return;
      if (state.feed.length === 0) {
        feedList.innerHTML = '';
        if (feedEmpty) feedEmpty.classList.remove('hidden');
        return;
      }
      if (feedEmpty) feedEmpty.classList.add('hidden');
      feedList.innerHTML = state.feed
        .slice()
        .sort((a, b) => {
          const aTime = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(a.timestamp || 0);
          const bTime = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(b.timestamp || 0);
          return bTime - aTime;
        })
        .map((entry) => {
          if (entry.type === 'plan-snapshot') {
            const metrics = entry.metrics || {};
            return `
              <li class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>${formatDateTime(entry.timestamp)}</span>
                  <span>Planner sync</span>
                </div>
                <p class="mt-2 text-sm font-semibold text-slate-200">Plan snapshot captured</p>
                <p class="mt-1 text-sm text-slate-300">Daily rate ${escapeHTML(String(metrics.totalDaily || 'n/a'))}, toolstring ${escapeHTML(String(metrics.length || 'n/a'))}, equipment ${escapeHTML(String(metrics.equipmentDaily || 'n/a'))}.</p>
              </li>
            `;
          }
          if (entry.type === 'signoff') {
            return `
              <li class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>${formatDateTime(entry.timestamp)}</span>
                  <span>${escapeHTML(entry.requestId || '')}</span>
                </div>
                <p class="mt-2 text-sm font-semibold text-slate-200">${entry.decision === 'reject' ? 'Request rejected' : 'Request approved'}</p>
                <p class="mt-1 text-sm text-slate-300">${escapeHTML(entry.signer || 'Unknown')} · ${escapeHTML(entry.role || '')}</p>
                ${
                  entry.comment
                    ? `<p class="mt-1 text-sm text-slate-400 italic">"${escapeHTML(entry.comment)}"</p>`
                    : ''
                }
                ${
                  entry.seal
                    ? `<p class="mt-2 text-[0.65rem] font-mono uppercase tracking-wide text-cyan-300">Seal: ${escapeHTML(entry.seal)}</p>`
                    : ''
                }
              </li>
            `;
          }
          return `
            <li class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>${formatDateTime(entry.timestamp)}</span>
                <span>${escapeHTML(entry.requestId || '')}</span>
              </div>
              <p class="mt-2 text-sm font-semibold text-slate-200">${escapeHTML(entry.headline || 'Activity recorded')}</p>
              <p class="mt-1 text-sm text-slate-300">${escapeHTML(entry.detail || '')}</p>
            </li>
          `;
        })
        .join('');
    };

    const renderAll = () => {
      ensureSelection();
      updateSummary();
      renderPlanContext();
      renderRequestList();
      renderDetail();
      renderFeed();
    };

    const openPanel = () => {
      ensureSelection();
      state.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      overlay.classList.remove('hidden');
      overlay.classList.add('grid');
      overlay.classList.remove('pointer-events-none');
      overlay.classList.add('pointer-events-auto');
      overlay.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('overflow-hidden');
      renderAll();
      if (releaseFocusTrap) releaseFocusTrap();
      releaseFocusTrap = trapFocusWithin(overlay);
      closeBtn.focus();
    };

    const closePanel = () => {
      overlay.classList.add('hidden');
      overlay.classList.remove('grid');
      overlay.classList.add('pointer-events-none');
      overlay.classList.remove('pointer-events-auto');
      overlay.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
      if (releaseFocusTrap) {
        releaseFocusTrap();
        releaseFocusTrap = null;
      }
      if (state.previousFocus && document.body.contains(state.previousFocus)) {
        state.previousFocus.focus();
      }
    };

    const trimFeed = () => {
      if (state.feed.length > MAX_FEED_ITEMS) {
        state.feed.length = MAX_FEED_ITEMS;
      }
    };

    const recordPlanSnapshot = (detail) => {
      const timestamp = detail?.timestamp || Date.now();
      const planDetail = detail?.plan || {};
      const rawMetrics = planDetail.metrics || {};
      const fallbackCost =
        rawMetrics.totalDaily ||
        planDetail.costFormatted ||
        (typeof planDetail.costUSD === 'number' && !Number.isNaN(planDetail.costUSD)
          ? `$${Math.round(planDetail.costUSD).toLocaleString()}`
          : null);
      const fallbackLength =
        rawMetrics.length ||
        (typeof planDetail.durationHours === 'number' && !Number.isNaN(planDetail.durationHours)
          ? `${planDetail.durationHours} hrs`
          : null);
      const fallbackEquipment =
        rawMetrics.equipmentDaily ||
        (typeof planDetail.personnelCount === 'number' && planDetail.personnelCount > 0
          ? `${planDetail.personnelCount} roles`
          : null);
      const metrics = {
        totalDaily: fallbackCost,
        length: fallbackLength,
        equipmentDaily: fallbackEquipment
      };

      const normalizedPersonnel = Array.isArray(planDetail.personnel)
        ? planDetail.personnel
            .map((person) => (typeof person === 'string' ? person : person?.name || ''))
            .filter(Boolean)
        : [];
      const rawTopSteps = Array.isArray(planDetail.topSteps) ? planDetail.topSteps : [];
      const normalizedSteps = rawTopSteps
        .map((step, index) => {
          if (typeof step === 'string') {
            return { order: index + 1, text: step };
          }
          return {
            order: step?.order || index + 1,
            text: step?.text || ''
          };
        })
        .filter((step) => step.text);

      state.planContext = {
        name: planDetail.name || 'Generated program',
        wellName: planDetail.wellName || null,
        objectiveName: planDetail.objectiveName || null,
        objectiveDescription: planDetail.objectiveDescription || null,
        cost: metrics.totalDaily || '—',
        duration: metrics.length || '—',
        crew: metrics.equipmentDaily || '—',
        personnel: normalizedPersonnel,
        personnelCount:
          typeof planDetail.personnelCount === 'number'
            ? planDetail.personnelCount
            : normalizedPersonnel.length,
        riskSummary: Array.isArray(planDetail.riskSummary) ? planDetail.riskSummary : [],
        sustainabilityHighlight: planDetail.sustainabilityHighlight || null,
        timestamp,
        topSteps: normalizedSteps
      };
      persistPlanContext(state.planContext);

      const entry = {
        id: `feed-plan-${timestamp}`,
        type: 'plan-snapshot',
        timestamp,
        metrics
      };
      state.feed.unshift(entry);
      trimFeed();
      persistFeed(state.feed);

      const snapshotMessage = `Planner synced — budget ${metrics.totalDaily || 'n/a'}, duration ${
        metrics.length || 'n/a'
      }, crew ${metrics.equipmentDaily || 'n/a'}.`;
      const isoTime = new Date(timestamp).toISOString();
      state.requests.forEach((req) => {
        if ((req.status || '').toLowerCase() === 'pending') {
          req.timeline = Array.isArray(req.timeline) ? req.timeline : [];
          req.timeline.push({
            timestamp: isoTime,
            actor: 'Planner Sync',
            role: 'System',
            action: 'plan-snapshot',
            message: snapshotMessage
          });
          req.updatedAt = isoTime;
        }
      });
      persistRequests(state.requests);
      renderAll();
    };

    const handleDecision = (decision) => {
      ensureSelection();
      const current = state.requests.find((req) => req.id === state.selectedId);
      if (!current) return;
      const normalizedStatus = (current.status || '').toLowerCase();
      if (normalizedStatus !== 'pending' && normalizedStatus !== 'awaiting review') {
        return;
      }

      const email = (emailInput?.value || '').trim().toLowerCase();
      const pin = (pinInput?.value || '').trim();
      const comment = (commentInput?.value || '').trim();

      const signer = authorizedSigners[email];
      if (!signer || signer.pin !== pin) {
        setFeedback('Signature failed. Verify your email and secure PIN.', 'negative');
        return;
      }

      const nowIso = new Date().toISOString();
      const seal = generateSeal(email);
      const action = decision === 'approve' ? 'approved' : 'rejected';
      const message = comment || (decision === 'approve' ? 'Approved via mobile communicator.' : 'Rejected via mobile communicator.');

      current.status = action;
      current.updatedAt = nowIso;
      current.timeline = Array.isArray(current.timeline) ? current.timeline : [];
      current.timeline.push({
        timestamp: nowIso,
        actor: signer.name,
        role: signer.role,
        action,
        message,
        digitalSeal: seal
      });

      persistRequests(state.requests);

      const feedEntry = {
        id: `feed-signoff-${current.id}-${nowIso}`,
        type: 'signoff',
        timestamp: Date.now(),
        requestId: current.id,
        decision: decision === 'approve' ? 'approve' : 'reject',
        signer: signer.name,
        role: signer.role,
        comment: comment || null,
        seal
      };
      state.feed.unshift(feedEntry);
      trimFeed();
      persistFeed(state.feed);

      if (pinInput) pinInput.value = '';
      if (decision === 'approve') {
        setFeedback(`Request approved securely as ${signer.name}.`, 'positive');
      } else {
        setFeedback(`Request rejected and logged to the audit trail.`, 'negative');
      }

      renderAll();
    };

    openBtn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closePanel();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
        closePanel();
      }
    });

    requestList.addEventListener('click', (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest('[data-request-id]') : null;
      if (!target) return;
      const requestId = target.getAttribute('data-request-id');
      if (!requestId) return;
      state.selectedId = requestId;
      renderAll();
    });

    form.addEventListener('click', (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest('button[data-decision]') : null;
      if (!button) return;
      event.preventDefault();
      const decision = button.getAttribute('data-decision');
      if (!decision) return;
      handleDecision(decision);
    });

    window.addEventListener('welltegra:plan-saved', (event) => {
      recordPlanSnapshot(event.detail || {});
    });

    window.addEventListener('welltegra:plan-reset', () => {
      state.planContext = null;
      persistPlanContext(null);
      renderAll();
    });

    renderAll();
  });
})();
