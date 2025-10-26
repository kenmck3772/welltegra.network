const wellData = {
  totalDepth: 10435,
  casings: [
    { id: '30in', top: 0, bottom: 608, od: 30.0, color: '#888888' },
    { id: '20in', top: 0, bottom: 2090, od: 20.0, color: '#777777' },
    { id: '13-3/8in', top: 0, bottom: 4931, od: 13.375, color: '#666666' },
    { id: '9-5/8in', top: 0, bottom: 9060, od: 9.625, color: '#555555' }
  ],
  liners: [{ id: '5-1/2in', top: 8527, bottom: 10433, od: 5.5, color: '#444444' }],
  tubing: [{ id: '5-1/2in', top: 0, bottom: 8546, od: 5.5, color: '#0e7490' }],
  perforations: [
    { top: 9642, bottom: 9686, color: '#f59e0b' },
    { top: 9750, bottom: 9780, color: '#f59e0b' }
  ],
  fluids: {
    level: 8200,
    type: 'Brine',
    gradient: 0.45,
    gasType: 'Gas'
  }
};

const procedureData = [
  { id: 'step-1', text: 'Toolbox Talk & Prepare Rig Up', depth: 0, duration: 2.0 },
  { id: 'step-2', text: 'Rig Up Slickline PCE & Test', depth: 0, duration: 4.0 },
  { id: 'step-3', text: 'Run in hole to check for obstructions', depth: 8500, duration: 3.5 },
  { id: 'step-4', text: 'Pull out of hole', depth: 0, duration: 3.0 },
  { id: 'step-5', text: 'Run in hole with 5.5\" Plug', depth: 8540, duration: 3.5 },
  { id: 'step-6', text: 'Set plug & test', depth: 8540, duration: 2.0 },
  { id: 'step-7', text: 'Pull out of hole', depth: 0, duration: 3.0 },
  { id: 'step-8', text: 'Rig Down Slickline PCE', depth: 0, duration: 4.0 }
];

const equipmentCatalog = {
  'TS-001': { id: 'TS-001', name: 'Rope Socket', length: 1.5, od: 1.875, dailyRate: 50 },
  'TS-003': { id: 'TS-003', name: 'Stem', length: 5.0, od: 1.875, dailyRate: 75 },
  'TS-007': { id: 'TS-007', name: 'Spang Jar', length: 4.0, od: 2.125, dailyRate: 150 },
  'FSH-001': { id: 'FSH-001', name: '2 Prong Grab', length: 2.5, od: 2.25, dailyRate: 120 }
};

const personnelCatalog = {
  'PERS-001': { id: 'PERS-001', name: 'Wellsite Engineer', dailyRate: 3600 },
  'PERS-004': { id: 'PERS-004', name: 'Wireline Engineer', dailyRate: 2640 }
};

const state = {
  toolstring: [],
  personnel: [],
  toolDepth: 0,
  activeStep: null
};

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('well-schematic');
  const ctx = canvas?.getContext('2d') ?? null;
  const container = document.getElementById('schematic-container');
  const tooltip = document.getElementById('well-tooltip');
  const procedurePanel = document.getElementById('procedure-panel');
  const toolstringList = document.getElementById('toolstring-list');
  const personnelList = document.getElementById('personnel-list');
  const metricLength = document.getElementById('metric-length');
  const metricOd = document.getElementById('metric-od');
  const metricEquip = document.getElementById('metric-equip-cost');
  const metricPers = document.getElementById('metric-pers-cost');
  const metricTotal = document.getElementById('metric-total-cost');
  const toast = document.getElementById('toast');

  const resizeCanvas = () => {
    if (!canvas || !container || !ctx) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawWellbore();
  };

  const depthToY = (depth) => {
    if (!canvas) return 0;
    const scale = canvas.height / wellData.totalDepth;
    return depth * scale;
  };

  const yToDepth = (y) => {
    if (!canvas) return 0;
    const scale = canvas.height / wellData.totalDepth;
    return Math.max(0, Math.min(wellData.totalDepth, y / scale));
  };

  const odToWidth = (od) => {
    if (!canvas) return 0;
    const maxOd = 30;
    const scale = canvas.width * 0.8;
    return (od / maxOd) * scale;
  };

  const drawWellbore = () => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;

    [...wellData.casings, ...wellData.liners].forEach((item) => {
      ctx.fillStyle = item.color;
      const topY = depthToY(item.top);
      const bottomY = depthToY(item.bottom);
      const width = odToWidth(item.od);
      ctx.fillRect(centerX - width / 2, topY, width, bottomY - topY);
    });

    wellData.tubing.forEach((item) => {
      ctx.fillStyle = item.color;
      const topY = depthToY(item.top);
      const bottomY = depthToY(item.bottom);
      const width = odToWidth(item.od);
      ctx.fillRect(centerX - width / 2, topY, width, bottomY - topY);
    });

    wellData.perforations.forEach((perf) => {
      ctx.fillStyle = perf.color;
      const topY = depthToY(perf.top);
      const bottomY = depthToY(perf.bottom);
      const tubing = wellData.tubing[0];
      const tubingWidth = odToWidth(tubing.od);
      ctx.fillRect(centerX - tubingWidth / 2 - 10, topY, 10, bottomY - topY);
      ctx.fillRect(centerX + tubingWidth / 2, topY, 10, bottomY - topY);
    });

    if (wellData.fluids) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      const topY = depthToY(wellData.fluids.level);
      const bottomY = depthToY(wellData.totalDepth);
      const tubingWidth = odToWidth(wellData.tubing[0].od);
      ctx.fillRect(centerX - tubingWidth / 2, topY, tubingWidth, bottomY - topY);
    }

    if (state.toolstring.length > 0) {
      const totalLength = state.toolstring.reduce((sum, item) => sum + (item.length || 0), 0);
      const toolLengthPx = depthToY(totalLength);
      const toolTopY = depthToY(state.toolDepth);
      const toolOd = state.toolstring.reduce((max, item) => Math.max(max, item.od || 0), 0);
      const toolWidthPx = odToWidth(toolOd);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(centerX - toolWidthPx / 2, toolTopY, toolWidthPx, toolLengthPx);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, toolTopY);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${state.toolDepth.toFixed(0)} ft`, centerX + toolWidthPx / 2 + 10, toolTopY + toolLengthPx / 2);
    }
  };

  const selectProcedureStep = (stepId, depth) => {
    if (state.activeStep) {
      document.getElementById(state.activeStep)?.classList.remove('bg-slate-800', 'border-cyan-500');
    }

    const stepEl = document.getElementById(stepId);
    if (stepEl) {
      stepEl.classList.add('bg-slate-800', 'border-cyan-500');
      state.activeStep = stepId;
    }

    state.toolDepth = depth;
    drawWellbore();
  };

  const formatCurrency = (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const updateMetrics = () => {
    const totalLength = state.toolstring.reduce((sum, item) => sum + (item.length || 0), 0);
    const maxOd = state.toolstring.reduce((max, item) => Math.max(max, item.od || 0), 0);
    const equipCost = state.toolstring.reduce((sum, item) => sum + (item.dailyRate || 0), 0);
    const persCost = state.personnel.reduce((sum, person) => sum + (person.dailyRate || 0), 0);
    const totalCost = equipCost + persCost;

    if (metricLength) metricLength.textContent = `${totalLength.toFixed(2)} ft`;
    if (metricOd) metricOd.textContent = `${maxOd.toFixed(2)} in`;
    if (metricEquip) metricEquip.textContent = formatCurrency(equipCost);
    if (metricPers) metricPers.textContent = formatCurrency(persCost);
    if (metricTotal) metricTotal.textContent = formatCurrency(totalCost);
  };

  const renderList = (containerEl, items, type) => {
    if (!containerEl) return;
    if (items.length === 0) {
      containerEl.innerHTML = type === 'tool' ? 'No tools added.' : 'No personnel added.';
      containerEl.classList.add('text-slate-400');
      return;
    }

    const rows = items
      .map((item, index) => {
        if (type === 'tool') {
          return `<div class="mb-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-100"><span class="text-sm">${item.name} <span class="text-xs text-slate-400">(${(item.od || 0).toFixed(2)}\" OD &middot; ${(item.length || 0).toFixed(1)} ft)</span></span><button type="button" class="text-xs font-semibold text-red-300 hover:text-red-200" data-remove-tool="${index}">Remove</button></div>`;
        }
        return `<div class="mb-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-100"><span class="text-sm">${item.name}</span><button type="button" class="text-xs font-semibold text-red-300 hover:text-red-200" data-remove-personnel="${index}">Remove</button></div>`;
      })
      .join('');

    containerEl.innerHTML = rows;
    containerEl.classList.remove('text-slate-400');
  };

  const updateUi = () => {
    renderList(toolstringList, state.toolstring, 'tool');
    renderList(personnelList, state.personnel, 'personnel');
    updateMetrics();
    drawWellbore();
  };

  const addTool = (toolId) => {
    const tool = equipmentCatalog[toolId];
    if (!tool) return;
    state.toolstring.push(tool);
    updateUi();
  };

  const addPersonnel = (personId) => {
    const person = personnelCatalog[personId];
    if (!person) return;
    if (!state.personnel.some((existing) => existing.id === personId)) {
      state.personnel.push(person);
      updateUi();
      return;
    }
    if (personId === 'PERS-004') {
      state.personnel.push({ ...person, id: `${personId}-${state.personnel.length}` });
      updateUi();
    }
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  };

  const loadProcedure = () => {
    if (!procedurePanel) return;
    procedurePanel.innerHTML = '';
    procedureData.forEach((step) => {
      const wrapper = document.createElement('button');
      wrapper.type = 'button';
      wrapper.id = step.id;
      wrapper.className = 'mb-3 w-full rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-left transition focus:outline-none focus-visible:ring focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 hover:border-cyan-500';
      wrapper.innerHTML = `<span class="block text-sm font-semibold text-slate-100">${step.text}</span><span class="mt-1 block text-xs text-slate-400">Target depth: ${step.depth} ft &middot; Est. duration: ${step.duration.toFixed(1)} hrs</span>`;
      wrapper.addEventListener('click', () => selectProcedureStep(step.id, step.depth));
      procedurePanel.appendChild(wrapper);
    });
  };

  const handleCanvasMove = (event) => {
    if (!canvas || !tooltip) return;
    const rect = canvas.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const depth = yToDepth(y);
    let fluid = wellData.fluids.gasType;
    let hydrostatic = 0;

    if (depth > wellData.fluids.level) {
      fluid = wellData.fluids.type;
      hydrostatic = (depth - wellData.fluids.level) * wellData.fluids.gradient;
    }

    tooltip.innerHTML = `<div>Depth: <span class="font-semibold">${depth.toFixed(0)} ft</span></div><div>Fluid: <span class="font-semibold">${fluid}</span></div><div>Pressure: <span class="font-semibold">${hydrostatic.toFixed(0)} psi</span></div>`;
    tooltip.classList.remove('hidden');
    const tooltipRect = tooltip.getBoundingClientRect();
    let xPosition = event.clientX + 16;
    let yPosition = event.clientY + 16;

    if (xPosition + tooltipRect.width > window.innerWidth) {
      xPosition = event.clientX - tooltipRect.width - 16;
    }
    if (yPosition + tooltipRect.height > window.innerHeight) {
      yPosition = event.clientY - tooltipRect.height - 16;
    }

    tooltip.style.transform = `translate(${xPosition}px, ${yPosition}px)`;
  };

  const hideTooltip = () => {
    if (!tooltip) return;
    tooltip.classList.add('hidden');
  };

  document.querySelectorAll('[data-add-tool]').forEach((button) => {
    button.addEventListener('click', () => addTool(button.dataset.addTool));
  });

  document.querySelectorAll('[data-add-personnel]').forEach((button) => {
    button.addEventListener('click', () => addPersonnel(button.dataset.addPersonnel));
  });

  document.getElementById('clear-toolstring')?.addEventListener('click', () => {
    state.toolstring = [];
    updateUi();
  });

  document.getElementById('clear-personnel')?.addEventListener('click', () => {
    state.personnel = [];
    updateUi();
  });

  toolstringList?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const removeIndex = target.dataset.removeTool;
    if (removeIndex !== undefined) {
      state.toolstring.splice(Number(removeIndex), 1);
      updateUi();
    }
  });

  personnelList?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const removeIndex = target.dataset.removePersonnel;
    if (removeIndex !== undefined) {
      state.personnel.splice(Number(removeIndex), 1);
      updateUi();
    }
  });

  document.getElementById('save-plan')?.addEventListener('click', () => {
    const plan = {
      toolstring: state.toolstring,
      personnel: state.personnel,
      metrics: {
        length: metricLength?.textContent,
        maxOd: metricOd?.textContent,
        equipmentDaily: metricEquip?.textContent,
        personnelDaily: metricPers?.textContent,
        totalDaily: metricTotal?.textContent
      }
    };
    console.table(plan);
    showToast('Job plan saved');
  });

  canvas?.addEventListener('mousemove', handleCanvasMove);
  canvas?.addEventListener('mouseleave', hideTooltip);
  window.addEventListener('resize', resizeCanvas);

  loadProcedure();
  resizeCanvas();
  updateUi();
});
