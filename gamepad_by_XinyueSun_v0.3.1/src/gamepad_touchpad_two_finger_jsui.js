/*

Two-finger touchpad display for Max jsui.

Drop this file into a [jsui gamepad_touchpad_two_finger_jsui.js] object.

Supported messages:
  touchpad_down touchpad finger x y pressure
  touchpad_motion touchpad finger x y pressure
  touchpad_up touchpad finger x y pressure
  finger finger x y pressure
  list finger x y pressure
  clear
  values 0/1
  drawbg 0/1
  linewidth n
  fontsize n

Coordinates are normalized 0..1.
Mouse test:
  drag = finger 0
  shift + drag = finger 1

*/

autowatch = 1;
inlets = 1;
outlets = 2;

var _fgcolor = this.patcher.getattr("textcolor");
var _bgcolor = this.patcher.getattr("locked_bgcolor");

var _drawbg = 0;
var _show_values = 1;
var _linewidth = 5.0;
var _font_size = 10.0;
var _font_unit = 1.0;
var _drag_finger = -1;
var _node_size = 0.15;
var _node_pressure_size = 0.0;
var _node_idle_size = 0.0;

var _fingers = [
	{x: 0.30, y: 0.45, pressure: 0.0, active: 0, flash: 0},
	{x: 0.70, y: 0.55, pressure: 0.0, active: 0, flash: 0}
];

var _palette = {};

mgraphics.init();
mgraphics.autofill = 0;
mgraphics.relative_coords = 1;
mgraphics.redraw();

function bang()
{
	mgraphics.redraw();
}

function clear()
{
	var i;
	for (i = 0; i < _fingers.length; i++) {
		_fingers[i].pressure = 0.0;
		_fingers[i].active = 0;
		_fingers[i].flash = 0;
	}
	mgraphics.redraw();
}

function drawbg(v)
{
	_drawbg = v ? 1 : 0;
	mgraphics.redraw();
}

function values(v)
{
	_show_values = v ? 1 : 0;
	mgraphics.redraw();
}

function linewidth(v)
{
	_linewidth = Math.max(0.5, parseFloat(v));
	mgraphics.redraw();
}

function fontsize(v)
{
	_font_size = Math.max(6.0, parseFloat(v));
	mgraphics.redraw();
}

function list()
{
	var a = arrayfromargs(arguments);
	if (a.length >= 4) {
		set_finger(a[0], a[1], a[2], a[3], 1, "motion");
	}
}

function finger(f, x, y, pressure)
{
	set_finger(f, x, y, pressure, pressure > 0, "motion");
}

function anything()
{
	var a = arrayfromargs(arguments);

	if (messagename == "touchpad_down") {
		read_touch_message(a, 1, "down");
		return;
	}
	if (messagename == "touchpad_motion") {
		read_touch_message(a, 1, "motion");
		return;
	}
	if (messagename == "touchpad_up") {
		read_touch_message(a, 0, "up");
		return;
	}

	// Convenience aliases: f0 x y pressure, f1 x y pressure.
	if (messagename == "f0" && a.length >= 3) {
		set_finger(0, a[0], a[1], a[2], a[2] > 0, "motion");
		return;
	}
	if (messagename == "f1" && a.length >= 3) {
		set_finger(1, a[0], a[1], a[2], a[2] > 0, "motion");
		return;
	}
}

function read_touch_message(a, active, event_name)
{
	var finger_index;
	var x;
	var y;
	var pressure;

	// Expected from gamepad_viz_ps5.js:
	// touchpad_motion touchpad finger x y pressure
	if (a.length >= 5) {
		finger_index = a[1];
		x = a[2];
		y = a[3];
		pressure = a[4];
	} else if (a.length >= 4) {
		finger_index = a[0];
		x = a[1];
		y = a[2];
		pressure = a[3];
	} else {
		return;
	}

	set_finger(finger_index, x, y, pressure, active, event_name);
}

function set_finger(f, x, y, pressure, active, event_name)
{
	var index = clamp(Math.floor(parseFloat(f)), 0, 1);
	var p = _fingers[index];

	p.x = clamp(parseFloat(x), 0, 1);
	p.y = clamp(parseFloat(y), 0, 1);
	p.pressure = clamp(parseFloat(pressure), 0, 1);
	p.active = active ? 1 : 0;
	p.flash = active ? 1 : p.flash;

	outlet(0, index, p.x, p.y, p.pressure, p.active);
	outlet(1, "touchpad_" + event_name, 0, index, p.x, p.y, p.pressure);
	mgraphics.redraw();
}

function onclick(x, y, but, cmd, shift, capslock, option, ctrl)
{
	_drag_finger = shift ? 1 : 0;
	set_from_mouse(_drag_finger, x, y, 1.0, "down");
}

function ondrag(x, y, but, cmd, shift, capslock, option, ctrl)
{
	if (_drag_finger < 0) {
		_drag_finger = shift ? 1 : 0;
	}
	set_from_mouse(_drag_finger, x, y, but ? 1.0 : 0.0, but ? "motion" : "up");
}

function onmouseup(x, y, but, cmd, shift, capslock, option, ctrl)
{
	if (_drag_finger >= 0) {
		set_from_mouse(_drag_finger, x, y, 0.0, "up");
	}
	_drag_finger = -1;
}

function set_from_mouse(finger_index, x, y, pressure, event_name)
{
	var uv = mouse_to_pad_uv(x, y);
	set_finger(finger_index, uv[0], uv[1], pressure, pressure > 0, event_name);
}

function paint()
{
	_fgcolor = this.patcher.getattr("textcolor");
	_bgcolor = this.patcher.getattr("locked_bgcolor");
	update_palette();

	var viewsize = mgraphics.size;
	var width = viewsize[0];
	var height = viewsize[1];
	var aspect = width / height;

	if (_drawbg) {
		set_color(_palette.bg, 1);
		mgraphics.rectangle(-aspect, 1, aspect * 2, 2);
		mgraphics.fill();
	}

	mgraphics.set_line_width(_linewidth / height);
	_font_unit = height / 256;
	mgraphics.set_font_size(_font_size * _font_unit);

	draw_touchpad_only(aspect);
}

function draw_touchpad_only(aspect)
{
	var pad = [0.12, 0.12, 0.750, 0.750];
	var i;

	draw_pad_area(pad[0], pad[1], pad[2], pad[3], aspect);

	for (i = 0; i < _fingers.length; i++) {
		draw_finger(i, pad[0], pad[1], pad[2], pad[3], aspect);
	}
}

function draw_pad_area(u, v, w, h, aspect)
{
	var i;
	var gu;
	var gv;
	var grid_lines = 3;

	fill_stroke_rect(u, v, w, h, aspect, 0.55, _palette.pad, _palette.pad_line, 0.6, 0.80);

	mgraphics.set_line_width(2.6 / mgraphics.size[1]);
	for (i = 1; i <= grid_lines; i++) {
		gu = u + (w * i / (grid_lines + 1));
		line_uv(gu, v + 0.005, gu, v + h - 0.005, aspect, _palette.grid, 0.16);
	}
	for (i = 1; i <= grid_lines; i++) {
		gv = v + (h * i / (grid_lines + 1));
		line_uv(u + 0.005, gv, u + w - 0.005, gv, aspect, _palette.grid, 0.16);
	}
	mgraphics.set_line_width(_linewidth / mgraphics.size[1]);
}

function draw_finger(index, u, v, w, h, aspect)
{
	var p = _fingers[index];
	var active = p.active || p.flash;
	var pressure = clamp(p.pressure, 0, 1);
	var d = _node_size + (pressure * _node_pressure_size);
	var radius_y = d * 0.5;
	var radius_x = radius_y / aspect;
	var fu = u + radius_x + clamp(p.x, 0, 1) * (w - (radius_x * 2));
	var fv = v + radius_y + clamp(p.y, 0, 1) * (h - (radius_y * 2));
	var color = index === 0 ? _palette.finger0 : _palette.finger1;

	if (!active) {
		fill_stroke_circle(fu, fv, _node_idle_size, aspect, _palette.black2, color, 0, 0.72);
		return;
	}

	fill_stroke_circle(fu, fv, d, aspect, color, color, 1, 0.92);

	p.flash *= 0.78;
	if (p.flash < 0.04) {
		p.flash = 0;
	}
}

function distance_between_fingers()
{
	var dx = _fingers[0].x - _fingers[1].x;
	var dy = _fingers[0].y - _fingers[1].y;
	return clamp(Math.sqrt((dx * dx) + (dy * dy)), 0, 1);
}

function update_palette()
{
	_palette.bg = [0.165, 0.165, 0.165, 1];
	_palette.device_bg = [0.190, 0.190, 0.190, 1];
	_palette.header = [0.295, 0.295, 0.295, 1];
	_palette.header_line = [0.420, 0.420, 0.420, 1];
	_palette.side = [0.135, 0.135, 0.135, 1];
	_palette.side_button = [0.100, 0.105, 0.105, 1];
	_palette.black = [0.055, 0.058, 0.058, 1];
	_palette.black2 = [0.072, 0.074, 0.074, 1];
	_palette.pad = [0.060, 0.064, 0.064, 1];
	_palette.pad_line = [0.190, 0.190, 0.190, 1];
	_palette.bottom = [0.215, 0.215, 0.215, 1];
	_palette.dark_line = [0.040, 0.040, 0.040, 1];
	_palette.title = [0.770, 0.770, 0.730, 1];
	_palette.fg = [0.820, 0.820, 0.780, 1];
	_palette.muted = [0.580, 0.580, 0.550, 1];
	_palette.icon = [0.560, 0.560, 0.560, 1];
	_palette.grid = [1.000, 0.678, 0.337, 1.000];//0.906 0.412 0.259 1.000 //0.906, 0.412, 0.259, 1.000
	_palette.orange = [1.000, 0.565, 0.265, 1];
	_palette.blue = [0.205, 0.310, 0.900, 1];
	_palette.cyan = [0.000, 0.830, 0.925, 1];
	_palette.grey_knob = [0.520, 0.520, 0.500, 1];
	_palette.finger0 = _palette.orange;
	_palette.finger1 = [1.000, 0.700, 0.310, 1];
}

function mouse_to_pad_uv(x, y)
{
	var viewsize = mgraphics.size;
	var u = clamp(x / viewsize[0], 0, 1);
	var v = clamp(y / viewsize[1], 0, 1);
	var pad = [0.035, 0.055, 0.930, 0.870];

	return [
		clamp((u - pad[0]) / pad[2], 0, 1),
		clamp((v - pad[1]) / pad[3], 0, 1)
	];
}

function x_from_u(u, aspect)
{
	return -aspect + (u * aspect * 2.0);
}

function y_from_v(v)
{
	return 1.0 - (v * 2.0);
}

function w_from_u(w, aspect)
{
	return w * aspect * 2.0;
}

function h_from_v(h)
{
	return h * 2.0;
}

function fu_to_u(x, aspect)
{
	return (x + aspect) / (aspect * 2.0);
}

function set_color(c, alpha)
{
	var a = alpha === undefined ? c[3] : alpha;
	mgraphics.set_source_rgba(c[0], c[1], c[2], a);
}

function rect_path(u, v, w, h, aspect, radius)
{
	mgraphics.rectangle_rounded(x_from_u(u, aspect), y_from_v(v), w_from_u(w, aspect), h_from_v(h), radius, radius);
}

function fill_stroke_rect(u, v, w, h, aspect, radius, fill, stroke, fill_alpha, stroke_alpha)
{
	rect_path(u, v, w, h, aspect, radius);
	set_color(fill, fill_alpha);
	mgraphics.fill_preserve();
	set_color(stroke, stroke_alpha);
	mgraphics.stroke();
}

function fill_rect(u, v, w, h, aspect, fill, alpha)
{
	mgraphics.rectangle(x_from_u(u, aspect), y_from_v(v), w_from_u(w, aspect), h_from_v(h));
	set_color(fill, alpha);
	mgraphics.fill();
}

function circle_path(u, v, diameter, aspect)
{
	var d = h_from_v(diameter);
	mgraphics.ellipse(x_from_u(u, aspect) - (d * 0.5), y_from_v(v) + (d * 0.5), d, d);
}

function fill_stroke_circle(u, v, diameter, aspect, fill, stroke, fill_alpha, stroke_alpha)
{
	circle_path(u, v, diameter, aspect);
	set_color(fill, fill_alpha);
	mgraphics.fill_preserve();
	set_color(stroke, stroke_alpha);
	mgraphics.stroke();
}

function line_uv(u1, v1, u2, v2, aspect, c, alpha)
{
	set_color(c, alpha);
	mgraphics.move_to(x_from_u(u1, aspect), y_from_v(v1));
	mgraphics.line_to(x_from_u(u2, aspect), y_from_v(v2));
	mgraphics.stroke();
}

function text_at(txt, u, v, aspect, scale, c, alpha)
{
	set_color(c, alpha);
	mgraphics.set_font_size(_font_size * _font_unit * scale);
	mgraphics.move_to(x_from_u(u, aspect), y_from_v(v));
	mgraphics.show_text(txt);
}

function text_center(txt, u, v, aspect, scale, c, alpha)
{
	var x = x_from_u(u, aspect);
	var y = y_from_v(v);
	var measure;

	set_color(c, alpha);
	mgraphics.set_font_size(_font_size * _font_unit * scale);
	try {
		measure = mgraphics.text_measure(txt);
	} catch (e) {
		measure = [txt.length * _font_size * _font_unit * scale * 0.45, _font_size * _font_unit * scale];
	}
	mgraphics.move_to(x - (measure[0] * 0.5), y + (measure[1] * 0.35));
	mgraphics.show_text(txt);
}

function rgba(c, fallback_alpha)
{
	return [
		c[0],
		c[1],
		c[2],
		c[3] === undefined ? fallback_alpha : c[3]
	];
}

function mix(a, b, amount)
{
	return [
		(a[0] * (1 - amount)) + (b[0] * amount),
		(a[1] * (1 - amount)) + (b[1] * amount),
		(a[2] * (1 - amount)) + (b[2] * amount),
		(a[3] * (1 - amount)) + (b[3] * amount)
	];
}

function clamp(v, lo, hi)
{
	if (isNaN(v)) {
		return lo;
	}
	if (v < lo) {
		return lo;
	}
	if (v > hi) {
		return hi;
	}
	return v;
}
