autowatch = 1;
inlets = 1;
outlets = 2;

var open = [1, 1, 1, 1, 1, 1, 1, 1];
var autoPack = 1;
var startX = 468;
var edgePadding = 5;

var panels = [
	{name: "p1_bpatcher", x: 400, y: 7.5, w: 468, h: 155, gap: 5},
	{name: "p2_bpatcher", x: 218, y: 7.5, w: 468, h: 155, gap: 5},
	{name: "p3_bpatcher", x: 366, y: 7.5, w: 706, h: 155, gap: 8},
	{name: "p4_bpatcher", x: 514, y: 7.5, w: 503, h: 155, gap: 8},
	{name: "p5_bpatcher", x: 662, y: 7.5, w: 468, h: 155, gap: 8},
	{name: "p6_bpatcher", x: 810, y: 7.5, w: 703, h: 155, gap: 8},
	{name: "p7_bpatcher", x: 1010, y: 7.5, w: 261, h: 155, gap: 8},
	{name: "p8_bpatcher", x: 1210, y: 7.5, w: 646, h: 155, gap: 8}
];

function loadbang()
{
	applyLayout();
}

function bang()
{
	applyLayout();
}

function list()
{
	var a = arrayfromargs(arguments);
	setPanel(a[0], a[1]);
}

function anything()
{
	var a = arrayfromargs(arguments);
	if (messagename == "autopack") {
		autopack(a[0]);
		return;
	}
	if (messagename == "startx") {
		startx(a[0]);
		return;
	}
	if (messagename == "panelrect" && a.length >= 5) {
		panelrect(a[0], a[1], a[2], a[3], a[4]);
		return;
	}
	if (messagename == "panelx" && a.length >= 2) {
		panelx(a[0], a[1]);
		return;
	}
	if (messagename == "panely" && a.length >= 2) {
		panely(a[0], a[1]);
		return;
	}
	if (messagename == "panelw" && a.length >= 2) {
		panelw(a[0], a[1]);
		return;
	}
	if (messagename == "panelh" && a.length >= 2) {
		panelh(a[0], a[1]);
		return;
	}
	if (messagename == "panelgap" && a.length >= 2) {
		panelgap(a[0], a[1]);
		return;
	}
	if (a.length > 0) {
		setPanel(messagename, a[0]);
	}
}

function setPanel(index, value)
{
	var i = parseInt(index, 10) - 1;
	if (i < 0 || i >= panels.length) {
		return;
	}

	open[i] = value ? 1 : 0;
	applyLayout();
}

function applyLayout()
{
	var x = startX;
	var rightEdge = startX;
	var anyOpen = 0;
	var i;
	var panel;

	for (i = 0; i < panels.length; i++) {
		panel = panels[i];
		if (open[i]) {
			anyOpen = 1;
				showPanel(panel.name);
				if (autoPack) {
					movePanel(panel.name, x, panel.y, panel.w, panel.h);
					rightEdge = x + panel.w;
					x += panel.w + panel.gap;
				} else {
					movePanel(panel.name, panel.x, panel.y, panel.w, panel.h);
					rightEdge = Math.max(rightEdge, panel.x + panel.w);
				}
			} else {
				hidePanel(panel.name);
			}
		}
	updateDeviceWidth(rightEdge + (anyOpen ? edgePadding : -7));
}

function autopack(v)
{
	autoPack = v ? 1 : 0;
	applyLayout();
}

function startx(v)
{
	startX = numberOr(startX, v);
	applyLayout();
}

function panelrect(index, x, y, w, h)
{
	var panel = getPanel(index);
	if (!panel) {
		return;
	}

	panel.x = numberOr(panel.x, x);
	panel.y = numberOr(panel.y, y);
	panel.w = numberOr(panel.w, w);
	panel.h = numberOr(panel.h, h);
	applyLayout();
}

function panelx(index, x)
{
	var panel = getPanel(index);
	if (panel) {
		panel.x = numberOr(panel.x, x);
		applyLayout();
	}
}

function panely(index, y)
{
	var panel = getPanel(index);
	if (panel) {
		panel.y = numberOr(panel.y, y);
		applyLayout();
	}
}

function panelw(index, w)
{
	var panel = getPanel(index);
	if (panel) {
		panel.w = numberOr(panel.w, w);
		applyLayout();
	}
}

function panelh(index, h)
{
	var panel = getPanel(index);
	if (panel) {
		panel.h = numberOr(panel.h, h);
		applyLayout();
	}
}

function panelgap(index, gap)
{
	var panel = getPanel(index);
	if (panel) {
		panel.gap = numberOr(panel.gap, gap);
		applyLayout();
	}
}

function getPanel(index)
{
	var i = parseInt(index, 10) - 1;
	if (i < 0 || i >= panels.length) {
		return null;
	}
	return panels[i];
}

function numberOr(fallback, value)
{
	var parsed = parseFloat(value);
	return isNaN(parsed) ? fallback : parsed;
}

function showPanel(name)
{
	outlet(0, "script", "show", name);
	outlet(0, "script", "sendbox", name, "hidden", 0);
}

function hidePanel(name)
{
	outlet(0, "script", "hide", name);
	outlet(0, "script", "sendbox", name, "hidden", 1);
}

function movePanel(name, x, y, w, h)
{
	outlet(0, "script", "sendbox", name, "presentation_rect", x, y, w, h);
	outlet(0, "script", "sendbox", name, "patching_rect", x, y, w, h);
}

function updateDeviceWidth(width)
{
	outlet(1, "setwidth", Math.max(120, Math.ceil(width)));
}
