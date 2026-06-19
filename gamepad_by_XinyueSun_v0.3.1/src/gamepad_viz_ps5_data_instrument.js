/*

gamepad viz - data instrument view

Drop this into a Max jsui object in place of gamepad_viz_ps5.js.
It keeps the original message names, but redraws the controller as
a modular data display instead of a literal controller outline.

*/
autowatch = 1;

var _fgcolor = this.patcher.getattr("textcolor");
var _bgcolor = this.patcher.getattr("locked_bgcolor");
var _drawbg = 1;
var _show_values = 1;
var _linewidth = 3.0;
var _font_size = 10.0;
var _font_unit = 1.0;
var _press_alpha = 0.76;

var _state = {};
var _palette = {};
var _edit_layout = 0;
var _edit_parts = 0;
var _drag = null;
var _status_text = "";

var _default_layout = {
	l2: [0.048, 0.108, 0.270, 0.060],
	l1: [0.342, 0.115, 0.150, 0.050],
	r1: [0.504, 0.115, 0.150, 0.05],
	r2: [0.678, 0.108, 0.270, 0.060],
	touchpad: [0.10, 0.188, 0.32, 0.33],
	system: [0.0, 0.54, 0.32, 0.175],
	dpad: [0.048, 0.188, 0.27, 0.27],
	face: [0.68, 0.188, 0.27, 0.27],
    left_stick: [0.048, 0.48, 0.27, 0.27],
	right_stick: [0.68, 0.48, 0.27, 0.27]
};

var _layout_order = [
	"l2", "l1", "r1", "r2",
	"touchpad", "system",
	"left_stick", "dpad",
	"face", "right_stick"
];

var _default_label_offsets = {
	touchpad: [0.08, 0.035],
	system: [0.110, 0.035],
	dpad: [0.02, 0.04],
	face: [0.18, 0.04],
    left_stick: [0.06, 0.047],
	right_stick: [0.045, 0.047]
};

var _default_label_scales = {
	touchpad: 0.7,
	system: 0.7,
	left_stick: 0.7,
	dpad: 0.7,
	face: 0.7,
	right_stick: 0.7
};

var _default_parts = {
	left_stick_pad: [0.500, 0.500, 0.800],
	left_stick_value_x: [0.112, 0.78],
	left_stick_value_y: [0.112, 0.883],
	right_stick_pad: [0.500, 0.500, 0.800],
	right_stick_value_x: [0.112, 0.8],
	right_stick_value_y: [0.112, 0.883],
	dpad_up: [0.5, 0.3, 0.25, 0.25],
	dpad_down: [0.5, 0.7, 0.25, 0.25],
	dpad_left: [0.3, 0.500, 0.25, 0.25],
	dpad_right: [0.7, 0.500, 0.25, 0.25],
	face_y: [0.50, 0.28, 0.28],
	face_a: [0.50, 0.72, 0.28],
	face_x: [0.28, 0.50, 0.28],
	face_b: [0.72, 0.50, 0.28],
	touch_area: [0.505, 0.51, 0.820, 0.680],
	touch_f0_value: [0.10, 0.95],
	touch_f1_value: [0.50, 0.95],
	touch_click: [0.505, 0.51, 0.820, 0.680],
	system_back: [0.2, 0.5, 0.165, 0.6],
	system_guide: [0.4, 0.55, 0.165, 0.45],
    system_misc: [0.6, 0.55, 0.165, 0.45],
	system_start: [0.8, 0.5, 0.165, 0.6]
};

var _part_order = [
	"left_stick_pad", "left_stick_value_x", "left_stick_value_y",
	"right_stick_pad", "right_stick_value_x", "right_stick_value_y",
	"dpad_up", "dpad_down", "dpad_left", "dpad_right",
	"face_y", "face_a", "face_x", "face_b",
	"touch_area", "touch_f0_value", "touch_f1_value", "touch_click",
	"system_back", "system_guide", "system_start", "system_misc"
];

var _part_specs = {
	left_stick_pad: ["left_stick", "circle"],
	left_stick_value_x: ["left_stick", "point"],
	left_stick_value_y: ["left_stick", "point"],
	right_stick_pad: ["right_stick", "circle"],
	right_stick_value_x: ["right_stick", "point"],
	right_stick_value_y: ["right_stick", "point"],
	dpad_up: ["dpad", "rect"],
	dpad_down: ["dpad", "rect"],
	dpad_left: ["dpad", "rect"],
	dpad_right: ["dpad", "rect"],
	face_y: ["face", "circle"],
	face_a: ["face", "circle"],
	face_x: ["face", "circle"],
	face_b: ["face", "circle"],
	touch_area: ["touchpad", "rect"],
	touch_f0_value: ["touchpad", "point"],
	touch_f1_value: ["touchpad", "point"],
	touch_click: ["touchpad", "rect"],
	system_back: ["system", "rect"],
	system_guide: ["system", "rect"],
	system_start: ["system", "rect"],
	system_misc: ["system", "rect"]
};

var _default_text_scales = {
	header: 0.6,
	title: 0.78,
	button: 0.76,
	round_button: 0.6,
	trigger_label: 0.72,
	trigger_value: 0.66,
	value: 0.68,
	touch_value: 0.57,
	finger: 0.3,
	edit: 0.55,
	footer: 0.57
};

var _default_part_text_scales = {
	left_stick_values: 0.5,
	right_stick_values: 0.5,
	touch_f0_value: 0.48,
	touch_f1_value: 0.48
};

var _default_stick_styles = {
	left_cross: 0.8,
	left_center: 0.5,
	left_knob: 1.6,
	right_cross: 0.8,
	right_center: 0.5,
	right_knob: 1.6,
	touch_knob: 1.5
};

var _default_centered_layout = {
	touchpad: 1,
	system: 1
};

var _default_frame = {
	inset: 0.0,
	scale: 1.08,
	header_x: 0.05,
	header_y: 0.08
};

var _default_press_colors = {
	pill: [1.000, 0.463, 0.302, 0.8],//[0.82, 0.82, 0.82, 1.76] 
	shoulder: [0.9647, 0.5373, 0.3, 1],//[0.82, 0.82, 0.82, 1.76]
	round: [1.000, 0.463, 0.302, 1],//[0.82, 0.82, 0.82, 1.76]
	trigger: [0.906, 0.412, 0.259, 1.000],//[0.82, 0.82, 0.82, 1.0]
	touchpad: [0.906, 0.412, 0.259, 1.000],//[0.82, 0.82, 0.82, 1.76]
	stick: [1.000, 0.678, 0.337, 0.800],//[0.82, 0.82, 0.82, 0.7]
	touch_finger: [0.9647, 0.5373, 0.3, 1]//[0.82, 0.82, 0.82, 1.0]
};

var _layout = clone_layout(_default_layout);
var _label_offsets = clone_layout(_default_label_offsets);
var _label_scales = clone_object(_default_label_scales);
var _parts = clone_layout(_default_parts);
var _text_scales = clone_object(_default_text_scales);
var _part_text_scales = clone_object(_default_part_text_scales);
var _stick_styles = clone_object(_default_stick_styles);
var _centered_layout = clone_object(_default_centered_layout);
var _frame = clone_object(_default_frame);
var _press_colors = clone_object(_default_press_colors);
apply_all_centered_layout();

function clear()
{
	var k;
	for (k in _state) {
		_state[k].val = 0;
		_state[k].press = 0;
	}
	mgraphics.redraw();
}

function bang()
{
	mgraphics.redraw();
}

function anything()
{
	setstate(messagename, arguments[0]);
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
	_linewidth = Math.max(0.5, v);
	mgraphics.redraw();
}

function fontsize(v)
{
	_font_size = Math.max(6.0, v);
	mgraphics.redraw();
}

function layoutedit(v)
{
	_edit_layout = v ? 1 : 0;
	if (_edit_layout) {
		_edit_parts = 0;
	}
	_drag = null;
	_status_text = _edit_layout ? "drag move / shift resize / option title" : "layout edit off";
	mgraphics.redraw();
}

function partedit(v)
{
	_edit_parts = v ? 1 : 0;
	if (_edit_parts) {
		_edit_layout = 0;
	}
	_drag = null;
	_status_text = _edit_parts ? "part edit: drag handles / shift resize" : "part edit off";
	mgraphics.redraw();
}

function resetlayout()
{
	_layout = clone_layout(_default_layout);
	_label_offsets = clone_layout(_default_label_offsets);
	_label_scales = clone_object(_default_label_scales);
	_parts = clone_layout(_default_parts);
	_text_scales = clone_object(_default_text_scales);
	_part_text_scales = clone_object(_default_part_text_scales);
	_stick_styles = clone_object(_default_stick_styles);
	_centered_layout = clone_object(_default_centered_layout);
	_frame = clone_object(_default_frame);
	_press_colors = clone_object(_default_press_colors);
	apply_all_centered_layout();
	_drag = null;
	_status_text = "layout reset";
	mgraphics.redraw();
}

function textscale(name, val)
{
	if (name == "all") {
		var k;
		for (k in _text_scales) {
			_text_scales[k] = Math.max(0.1, val);
		}
	} else if (_text_scales[name] !== undefined) {
		_text_scales[name] = Math.max(0.1, val);
	} else if (_part_text_scales[name] !== undefined) {
		_part_text_scales[name] = Math.max(0.1, val);
	} else {
		post("\nunknown text scale: " + name + "\n");
	}
	_status_text = "textscale " + name + " " + val;
	mgraphics.redraw();
}

function titlescale(name, val)
{
	if (name == "all") {
		var k;
		for (k in _label_scales) {
			_label_scales[k] = Math.max(0.1, val);
		}
	} else if (_label_scales[name] !== undefined) {
		_label_scales[name] = Math.max(0.1, val);
	} else {
		post("\nunknown title scale: " + name + "\n");
	}
	_status_text = "titlescale " + name + " " + val;
	mgraphics.redraw();
}

function stickcross(name, val)
{
	val = clamp(val, 0, 1.5);

	if (name == "all") {
		_stick_styles.left_cross = val;
		_stick_styles.right_cross = val;
	} else if (name == "left") {
		_stick_styles.left_cross = val;
	} else if (name == "right") {
		_stick_styles.right_cross = val;
	} else {
		post("\nunknown stickcross target: " + name + "\n");
	}
	_status_text = "stickcross " + name + " " + val;
	mgraphics.redraw();
}

function stickcenter(name, val)
{
	val = clamp(val, 0, 1.0);

	if (name == "all") {
		_stick_styles.left_center = val;
		_stick_styles.right_center = val;
	} else if (name == "left") {
		_stick_styles.left_center = val;
	} else if (name == "right") {
		_stick_styles.right_center = val;
	} else {
		post("\nunknown stickcenter target: " + name + "\n");
	}
	_status_text = "stickcenter " + name + " " + val;
	mgraphics.redraw();
}

function stickknob(name, val)
{
	val = clamp(val, 0.05, 1.0);

	if (name == "all") {
		_stick_styles.left_knob = val;
		_stick_styles.right_knob = val;
	} else if (name == "left") {
		_stick_styles.left_knob = val;
	} else if (name == "right") {
		_stick_styles.right_knob = val;
	} else {
		post("\nunknown stickknob target: " + name + "\n");
	}
	_status_text = "stickknob " + name + " " + val;
	mgraphics.redraw();
}

function touchknob(val)
{
	_stick_styles.touch_knob = clamp(val, 0.2, 2.5);
	_status_text = "touchknob " + _stick_styles.touch_knob;
	mgraphics.redraw();
}

function frameinset(val)
{
	_frame.inset = clamp(val, 0, 0.25);
	_status_text = "frameinset " + _frame.inset;
	mgraphics.redraw();
}

function uiscale(val)
{
	_frame.scale = clamp(val, 0.2, 1.5);
	_status_text = "uiscale " + _frame.scale;
	mgraphics.redraw();
}

function headerpos(x, y)
{
	_frame.header_x = clamp(x, 0, 1);
	_frame.header_y = clamp(y, 0, 1);
	_status_text = "headerpos " + x + " " + y;
	mgraphics.redraw();
}

function presscolor(name, r, g, b, a)
{
	var color = parse_press_color(r, g, b, a);

	if (name == "all") {
		var k;
		for (k in _press_colors) {
			_press_colors[k] = clone_color(color);
		}
	} else if (_press_colors[name] !== undefined) {
		_press_colors[name] = clone_color(color);
	} else {
		post("\nunknown press color target: " + name + "\n");
	}
	_status_text = "presscolor " + name + " " + fmt_color(color);
	mgraphics.redraw();
}

function centerlayout(name, val)
{
	val = val ? 1 : 0;

	if (name == "all") {
		_centered_layout.touchpad = val;
		_centered_layout.system = val;
		apply_centered_layout("touchpad");
		apply_centered_layout("system");
	} else if (_layout[name]) {
		_centered_layout[name] = val;
		apply_centered_layout(name);
	} else {
		post("\nunknown centerlayout target: " + name + "\n");
	}

	_status_text = "centerlayout " + name + " " + val;
	mgraphics.redraw();
}

function printlayout()
{
	var i;
	var name;
	var box;

	post("\n// paste these values into _default_layout if you want to keep them\n");
	for (i = 0; i < _layout_order.length; i++) {
		name = _layout_order[i];
		box = _layout[name];
		post("\t" + name + ": [" + fmt(box[0]) + ", " + fmt(box[1]) + ", " + fmt(box[2]) + ", " + fmt(box[3]) + "]" + (i < _layout_order.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_label_offsets if you changed title positions\n");
	for (i = 0; i < _layout_order.length; i++) {
		name = _layout_order[i];
		if (_label_offsets[name]) {
			box = _label_offsets[name];
			post("\t" + name + ": [" + fmt(box[0]) + ", " + fmt(box[1]) + "]" + (i < _layout_order.length - 1 ? "," : "") + "\n");
		}
	}
	post("\n// paste these values into _default_label_scales if you changed title sizes\n");
	for (i = 0; i < _layout_order.length; i++) {
		name = _layout_order[i];
		if (_label_scales[name] !== undefined) {
			post("\t" + name + ": " + fmt(_label_scales[name]) + (i < _layout_order.length - 1 ? "," : "") + "\n");
		}
	}
	post("\n// paste these values into _default_parts if you changed internal positions\n");
	for (i = 0; i < _part_order.length; i++) {
		name = _part_order[i];
		box = _parts[name];
		post("\t" + name + ": [" + fmt_array(box) + "]" + (i < _part_order.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_text_scales if you changed text sizes\n");
	var keys = ["header", "title", "button", "round_button", "trigger_label", "trigger_value", "value", "touch_value", "finger", "edit", "footer"];
	for (i = 0; i < keys.length; i++) {
		name = keys[i];
		post("\t" + name + ": " + fmt(_text_scales[name]) + (i < keys.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_part_text_scales if you changed part text sizes\n");
	keys = ["left_stick_values", "right_stick_values", "touch_f0_value", "touch_f1_value"];
	for (i = 0; i < keys.length; i++) {
		name = keys[i];
		post("\t" + name + ": " + fmt(_part_text_scales[name]) + (i < keys.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_stick_styles if you changed stick style\n");
	keys = ["left_cross", "left_center", "left_knob", "right_cross", "right_center", "right_knob", "touch_knob"];
	for (i = 0; i < keys.length; i++) {
		name = keys[i];
		post("\t" + name + ": " + fmt(_stick_styles[name]) + (i < keys.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_centered_layout if you changed center mode\n");
	keys = ["touchpad", "system"];
	for (i = 0; i < keys.length; i++) {
		name = keys[i];
		post("\t" + name + ": " + (_centered_layout[name] ? 1 : 0) + (i < keys.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_frame if you changed frame/header\n");
	keys = ["inset", "scale", "header_x", "header_y"];
	for (i = 0; i < keys.length; i++) {
		name = keys[i];
		post("\t" + name + ": " + fmt(_frame[name]) + (i < keys.length - 1 ? "," : "") + "\n");
	}
	post("\n// paste these values into _default_press_colors if you changed press colors\n");
	keys = ["pill", "shoulder", "round", "trigger", "touchpad", "stick", "touch_finger"];
	for (i = 0; i < keys.length; i++) {
		name = keys[i];
		post("\t" + name + ": " + fmt_color(_press_colors[name]) + (i < keys.length - 1 ? "," : "") + "\n");
	}
	_status_text = "layout printed to Max Console";
	mgraphics.redraw();
}

function setstate(name, val)
{
	if (!_state[name]) {
		_state[name] = {};
		_state[name].val = val;
		_state[name].press = (val == 1);
	} else {
		if (val == 1 && _state[name].val == 0) {
			_state[name].press = true;
		}
		_state[name].val = val;
	}
	mgraphics.redraw();
}

function touchpad_generic(touchpad, finger, x, y, pressure)
{
	var name = "touch_finger0";

	if (finger > 0) {
		name = "touch_finger1";
	}

	setstate(name + "_x", x);
	setstate(name + "_y", y);
	setstate(name + "_pressure", pressure);
}

function touchpad_up(touchpad, finger, x, y, pressure)
{
	touchpad_generic(touchpad, finger, x, y, pressure);
}

function touchpad_down(touchpad, finger, x, y, pressure)
{
	touchpad_generic(touchpad, finger, x, y, pressure);
}

function touchpad_motion(touchpad, finger, x, y, pressure)
{
	touchpad_generic(touchpad, finger, x, y, pressure);
}

function clone_layout(src)
{
	var out = {};
	var k;
	var i;

	for (k in src) {
		out[k] = [];
		for (i = 0; i < src[k].length; i++) {
			out[k][i] = src[k][i];
		}
	}

	return out;
}

function clone_object(src)
{
	var out = {};
	var k;
	var i;

	for (k in src) {
		if (src[k] instanceof Array) {
			out[k] = [];
			for (i = 0; i < src[k].length; i++) {
				out[k][i] = src[k][i];
			}
		} else {
			out[k] = src[k];
		}
	}

	return out;
}

function clone_color(c)
{
	var out;
	var i;

	if (!(c instanceof Array)) {
		return c;
	}

	out = [];
	for (i = 0; i < c.length; i++) {
		out[i] = c[i];
	}

	return out;
}

function fmt(v)
{
	if (v === undefined || isNaN(v)) {
		return "0.000";
	}
	return v.toFixed(3);
}

function fmt_array(values)
{
	var out = [];
	var i;

	for (i = 0; i < values.length; i++) {
		out.push(fmt(values[i]));
	}

	return out.join(", ");
}

function fmt_color(c)
{
	if (c instanceof Array) {
		return "[" + fmt_array(c) + "]";
	}
	return "\"" + c + "\"";
}

mgraphics.init();
mgraphics.autofill = 0;
mgraphics.relative_coords = 1;
mgraphics.redraw();

function clamp(v, lo, hi)
{
	if (v < lo) {
		return lo;
	}
	if (v > hi) {
		return hi;
	}
	return v;
}

function state_value(name, fallback)
{
	if (_state[name]) {
		return _state[name].val;
	}
	return fallback;
}

function state_active(name)
{
	var active = 0;

	if (_state[name] && (_state[name].val || _state[name].press)) {
		active = 1;
		_state[name].press = false;
	}

	return active;
}

function scalar_mix(a, b, amount)
{
	return a * (1 - amount) + (b * amount);
}

function color_mix(a, b, amount)
{
	return [
		scalar_mix(a[0], b[0], amount),
		scalar_mix(a[1], b[1], amount),
		scalar_mix(a[2], b[2], amount),
		scalar_mix(a[3] === undefined ? 1 : a[3], b[3] === undefined ? 1 : b[3], amount)
	];
}

function set_color(c, alpha)
{
	var a = (alpha === undefined) ? (c[3] === undefined ? 1 : c[3]) : alpha;
	mgraphics.set_source_rgba(c[0], c[1], c[2], a);
}

function color_alpha(c, fallback)
{
	if (c instanceof Array && c[3] !== undefined) {
		return c[3];
	}
	return fallback;
}

function parse_press_color(r, g, b, a)
{
	var parsed;

	if (r instanceof Array) {
		return [
			clamp(r[0], 0, 1),
			clamp(r[1], 0, 1),
			clamp(r[2], 0, 1),
			clamp(r[3] === undefined ? _press_alpha : r[3], 0, 1)
		];
	}

	if (typeof r == "number") {
		return [
			clamp(r, 0, 1),
			clamp(g === undefined ? r : g, 0, 1),
			clamp(b === undefined ? r : b, 0, 1),
			clamp(a === undefined ? _press_alpha : a, 0, 1)
		];
	}

	parsed = parseFloat(r);
	if (!isNaN(parsed) && g !== undefined && b !== undefined) {
		return [
			clamp(parsed, 0, 1),
			clamp(parseFloat(g), 0, 1),
			clamp(parseFloat(b), 0, 1),
			clamp(a === undefined ? _press_alpha : parseFloat(a), 0, 1)
		];
	}

	return r || "fg";
}

function update_palette()
{
	var bg = [_bgcolor[0], _bgcolor[1], _bgcolor[2], _bgcolor[3] === undefined ? 1 : _bgcolor[3]];
	var fg = [_fgcolor[0], _fgcolor[1], _fgcolor[2], _fgcolor[3] === undefined ? 1 : _fgcolor[3]];
	var luma = (0.2126 * bg[0]) + (0.7152 * bg[1]) + (0.0722 * bg[2]);
	var dark = luma < 0.5;

	_palette.bg = bg;
	_palette.fg = fg;
	_palette.panel = [0.118, 0.118, 0.118, 1.000]; //color_mix(bg, fg, dark ? 0.00 : 0.07);//[0.18, 0.18, 0.18, 1.0]
	_palette.panel2 = [0.18, 0.18, 0.18, 1.0];//color_mix(bg, fg, dark ? 0.17 : 0.12);
	_palette.line = [0.9647, 0.5373, 0.3, 1]; //color_mix(bg, fg, dark ? 1.34 : 0.28) //[0.9647, 0.5373, 0.3, 1]
	_palette.muted = color_mix(bg, fg, dark ? 0.56 : 0.48);
	_palette.blue = dark ? [0.18, 0.72, 1.00, 1] : [0.00, 0.34, 0.82, 1];
	_palette.green = dark ? [0.33, 0.88, 0.60, 1] : [0.00, 0.52, 0.34, 1];
	_palette.warm = dark ? [1.00, 0.58, 0.24, 1] : [0.86, 0.32, 0.10, 1];
	_palette.pink = dark ? [1.00, 0.43, 0.70, 1] : [0.82, 0.12, 0.42, 1];
}

function press_color(name)
{
	var key = _press_colors[name] || "fg";

	if (key instanceof Array) {
		return key;
	}

	if (_palette[key]) {
		return _palette[key];
	}

	return _palette.fg;
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

function frame_scale()
{
	return (1 - (_frame.inset * 2)) * (_frame.scale || 1.0);
}

function frame_u(u)
{
	return 0.5 + ((u - 0.5) * frame_scale());
}

function frame_v(v)
{
	return 0.5 + ((v - 0.5) * frame_scale());
}

function frame_w(w)
{
	return w * frame_scale();
}

function frame_h(h)
{
	return h * frame_scale();
}

function frame_box(box)
{
	return [
		frame_u(box[0]),
		frame_v(box[1]),
		frame_w(box[2]),
		frame_h(box[3])
	];
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
	var measure = [0, 0];

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

function rect_path(u, v, w, h, aspect, radius)
{
	var x = x_from_u(u, aspect);
	var y = y_from_v(v);
	var ww = w_from_u(w, aspect);
	var hh = h_from_v(h);
	var rr = radius || 0.025;

	mgraphics.rectangle_rounded(x, y, ww, hh, rr, rr);
}

function fill_rect(u, v, w, h, aspect, radius, fill, alpha)
{
	rect_path(u, v, w, h, aspect, radius);
	set_color(fill, alpha);
	mgraphics.fill();
}

function stroke_rect(u, v, w, h, aspect, radius, stroke, alpha)
{
	rect_path(u, v, w, h, aspect, radius);
	set_color(stroke, alpha);
	mgraphics.stroke();
}

function fill_stroke_rect(u, v, w, h, aspect, radius, fill, stroke, fill_alpha, stroke_alpha)
{
	rect_path(u, v, w, h, aspect, radius);
	set_color(fill, fill_alpha);
	mgraphics.fill_preserve();
	set_color(stroke, stroke_alpha);
	mgraphics.stroke();
}

function circle_path(u, v, diameter, aspect)
{
	var d = h_from_v(diameter);
	var x = x_from_u(u, aspect) - (d * 0.5);
	var y = y_from_v(v) + (d * 0.5);

	mgraphics.ellipse(x, y, d, d);
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

function mouse_to_uv(x, y)
{
	var viewsize = mgraphics.size;
	var width = viewsize[0];
	var height = viewsize[1];

	return [
		clamp(x / width, 0, 1),
		clamp(y / height, 0, 1)
	];
}

function hit_layout(u, v)
{
	var i;
	var name;
	var box;

	for (i = _layout_order.length - 1; i >= 0; i--) {
		name = _layout_order[i];
		box = _layout[name];
		if (u >= box[0] && u <= box[0] + box[2] && v >= box[1] && v <= box[1] + box[3]) {
			return name;
		}
	}

	return null;
}

function apply_centered_layout(name)
{
	var box = _layout[name];

	if (box && _centered_layout[name]) {
		box[0] = clamp(0.5 - (box[2] * 0.5), 0, 1 - box[2]);
	}
}

function apply_all_centered_layout()
{
	var k;

	for (k in _centered_layout) {
		apply_centered_layout(k);
	}
}

function part_module(name)
{
	return _part_specs[name] ? _part_specs[name][0] : null;
}

function part_kind(name)
{
	return _part_specs[name] ? _part_specs[name][1] : null;
}

function part_center(name)
{
	var module = part_module(name);
	var kind = part_kind(name);
	var box;
	var part;

	if (!module || !_layout[module] || !_parts[name]) {
		return null;
	}

	box = _layout[module];
	part = _parts[name];

	return [box[0] + (part[0] * box[2]), box[1] + (part[1] * box[3])];
}

function hit_part(u, v)
{
	var best = null;
	var best_dist = 999;
	var i;
	var name;
	var center;
	var dist;

	for (i = _part_order.length - 1; i >= 0; i--) {
		name = _part_order[i];
		center = part_center(name);
		if (center) {
			dist = Math.sqrt(Math.pow(u - center[0], 2) + Math.pow(v - center[1], 2));
			if (dist < best_dist && dist < 0.095) {
				best = name;
				best_dist = dist;
			}
		}
	}

	return best;
}

function drag_layout(name, u, v)
{
	var box = _layout[name];

	if (!_centered_layout[name]) {
		box[0] = clamp(u - _drag.offset_u, 0, 1 - box[2]);
	}
	box[1] = clamp(v - _drag.offset_v, 0, 1 - box[3]);
	apply_centered_layout(name);
	mgraphics.redraw();
}

function resize_layout(name, u, v)
{
	var box = _layout[name];
	var min_w = 0.050;
	var min_h = 0.040;

	box[2] = clamp(u + _drag.offset_u - box[0], min_w, 1 - box[0]);
	box[3] = clamp(v + _drag.offset_v - box[1], min_h, 1 - box[1]);
	apply_centered_layout(name);
	mgraphics.redraw();
}

function drag_part(name, u, v)
{
	var module = part_module(name);
	var kind = part_kind(name);
	var box = _layout[module];
	var part = _parts[name];
	var rel_x;
	var rel_y;

	rel_x = clamp((u - _drag.offset_u - box[0]) / box[2], 0, 1);
	rel_y = clamp((v - _drag.offset_v - box[1]) / box[3], 0, 1);

	part[0] = kind == "rect" ? clamp(rel_x, part[2] * 0.5, 1 - (part[2] * 0.5)) : rel_x;
	part[1] = kind == "rect" ? clamp(rel_y, part[3] * 0.5, 1 - (part[3] * 0.5)) : rel_y;

	mgraphics.redraw();
}

function resize_part(name, u, v)
{
	var module = part_module(name);
	var kind = part_kind(name);
	var box = _layout[module];
	var part = _parts[name];
	var rel_x = clamp((u - box[0]) / box[2], 0, 1);
	var rel_y = clamp((v - box[1]) / box[3], 0, 1);
	var dx;
	var dy;

	if (kind == "point") {
		drag_part(name, u, v);
		return;
	}

	if (kind == "rect") {
		part[2] = clamp(Math.abs(rel_x - part[0]) * 2, 0.04, Math.min(part[0], 1 - part[0]) * 2);
		part[3] = clamp(Math.abs(rel_y - part[1]) * 2, 0.04, Math.min(part[1], 1 - part[1]) * 2);
	} else {
		dx = (rel_x - part[0]) * box[2];
		dy = (rel_y - part[1]) * box[3];
		part[2] = clamp((Math.sqrt((dx * dx) + (dy * dy)) * 2) / Math.min(box[2], box[3]), 0.05, 1.20);
	}

	mgraphics.redraw();
}

function drag_label(name, u, v)
{
	var box = _layout[name];
	var offset;

	if (!_label_offsets[name]) {
		return;
	}

	offset = _label_offsets[name];
	offset[0] = clamp(u - box[0], 0.004, box[2] - 0.004);
	offset[1] = clamp(v - box[1], 0.010, box[3] - 0.004);
	mgraphics.redraw();
}

function onclick(x, y, but, cmd, shift, capslock, option, ctrl)
{
	var uv;
	var name;
	var box;
	var mode = "move";
	var center;

	if (!_edit_layout && !_edit_parts) {
		return;
	}

	uv = mouse_to_uv(x, y);

	if (_edit_parts) {
		name = hit_part(uv[0], uv[1]);
		if (name) {
			center = part_center(name);
			_drag = {
				mode: shift ? "part_resize" : "part",
				name: name,
				offset_u: center ? uv[0] - center[0] : 0,
				offset_v: center ? uv[1] - center[1] : 0
			};
			if (shift) {
				resize_part(name, uv[0], uv[1]);
			} else {
				drag_part(name, uv[0], uv[1]);
			}
			mgraphics.redraw();
			return;
		}
		return;
	}

	name = hit_layout(uv[0], uv[1]);

	if (name) {
		box = _layout[name];
		if (option && _label_offsets[name]) {
			mode = "label";
		} else if (shift) {
			mode = "resize";
		}
		_drag = {
			mode: mode,
			name: name,
			offset_u: mode == "resize" ? box[0] + box[2] - uv[0] : uv[0] - box[0],
			offset_v: mode == "resize" ? box[1] + box[3] - uv[1] : uv[1] - box[1]
		};
		if (mode == "label") {
			drag_label(name, uv[0], uv[1]);
		}
		mgraphics.redraw();
	}
}

function ondrag(x, y, but, cmd, shift, capslock, option, ctrl)
{
	var uv;

	if ((!_edit_layout && !_edit_parts) || !_drag) {
		return;
	}

	uv = mouse_to_uv(x, y);
	if (_drag.mode == "part_resize") {
		resize_part(_drag.name, uv[0], uv[1]);
	} else if (_drag.mode == "part") {
		drag_part(_drag.name, uv[0], uv[1]);
	} else if (_drag.mode == "resize") {
		resize_layout(_drag.name, uv[0], uv[1]);
	} else if (_drag.mode == "label") {
		drag_label(_drag.name, uv[0], uv[1]);
	} else {
		drag_layout(_drag.name, uv[0], uv[1]);
	}
}

function onmouseup(x, y, but, cmd, shift, capslock, option, ctrl)
{
	_drag = null;
	mgraphics.redraw();
}

function draw_part_overlay(name, aspect)
{
	var center;
	var active;

	if (!_edit_parts) {
		return;
	}

	center = part_center(name);
	if (!center) {
		return;
	}

	active = _drag && _drag.name == name;
	fill_stroke_circle(center[0], center[1], active ? 0.028 : 0.020, aspect, active ? _palette.warm : _palette.green, active ? _palette.warm : _palette.green, active ? 0.85 : 0.46, 0.92);
	text_at(name, center[0] + 0.010, center[1] + 0.012, aspect, _text_scales.edit * 0.82, active ? _palette.warm : _palette.green, 0.88);
}

function draw_edit_overlay(u, v, w, h, name, aspect)
{
	if (!_edit_layout) {
		return;
	}

	stroke_rect(u, v, w, h, aspect, 0.035, _drag && _drag.name == name ? _palette.warm : _palette.blue, 0.88);
	fill_stroke_circle(u + w - 0.014, v + h - 0.014, 0.018, aspect, _palette.blue, _palette.blue, 0.32, 0.84);
	text_at(name, u + 0.014, v + h - 0.018, aspect, _text_scales.edit, _drag && _drag.name == name ? _palette.warm : _palette.blue, 0.92);
}

function draw_panel(u, v, w, h, title, aspect, layout_name)
{
	var offset = _label_offsets[layout_name] || [0.018, 0.045];
	var scale = _label_scales[layout_name] || _text_scales.title;

	fill_stroke_rect(u, v, w, h, aspect, 0.035, _palette.panel, _palette.line, 0.88, 0.70);
	text_at(title, u + offset[0], v + offset[1], aspect, scale, _palette.muted, 0.95);
}

function draw_value(label, value, u, v, aspect, c)
{
	if (!_show_values) {
		return;
	}
	text_at(label + " " + value.toFixed(3), u, v, aspect, _text_scales.value, c, 0.92);
}

function draw_pill_button(name, u, v, w, h, label, aspect, accent)
{
	var active = state_active(name);
	var active_color = name == "button_touchpad" ? press_color("touchpad") : press_color("pill");
	var active_alpha = color_alpha(active_color, _press_alpha);
	var fill = active ? active_color : _palette.panel2;
	var stroke = active ? active_color : _palette.line;

	fill_stroke_rect(u, v, w, h, aspect, 0.025, fill, stroke, active ? active_alpha : 0.56, active ? active_alpha : 0.95);
	text_center(label, u + (w * 0.5), v + (h * 0.54), aspect, _text_scales.button, active ? _palette.bg : _palette.fg, 0.95);
}

function draw_shoulder_button(name, u, v, w, h, label, aspect, accent)
{
	var active = state_active(name);
	var active_color = press_color("shoulder");
	var active_alpha = color_alpha(active_color, _press_alpha);
	var fill = active ? active_color : _palette.panel2;
	var stroke = active ? active_color : _palette.line;
	var text_color = active ? _palette.bg : _palette.fg;

	fill_stroke_rect(u, v, w, h, aspect, 0.025, fill, stroke, active ? active_alpha : 0.56, active ? active_alpha : 0.95);
	text_center(label, u + (w * 0.5), v + (h * 0.43), aspect, _text_scales.button, text_color, 0.95);
	text_center("SHOULDER", u + (w * 0.5), v + (h * 0.72), aspect, _text_scales.button * 0.42, text_color, 0.78);
}

function draw_round_button(name, u, v, diameter, label, aspect, accent)
{
	var active = state_active(name);
	var active_color = press_color("round");
	var active_alpha = color_alpha(active_color, _press_alpha);
	var fill = active ? active_color : _palette.panel2;
	var stroke = active ? active_color : _palette.line;

	fill_stroke_circle(u, v, diameter, aspect, fill, stroke, active ? active_alpha : 0.58, active ? active_alpha : 0.96);
	fill_stroke_circle(u, v, diameter * 0.58, aspect, _palette.panel, stroke, active ? 0.18 : 0.15, active ? active_alpha : 0.45);
	text_center(label, u, v + 0.003, aspect, _text_scales.round_button, active ? _palette.bg : _palette.fg, 0.95);
}

function draw_trigger(axis_name, u, v, w, h, label, aspect, accent)
{
	var val = clamp(state_value(axis_name, 0), 0, 1);
	var active = (val > 0.001) || state_active(axis_name);
	var trigger_color = press_color("trigger");
	var fill_w = Math.max(0.012, w * val);

	fill_stroke_rect(u, v, w, h, aspect, 0.026, _palette.panel, _palette.line, 0.82, 0.72);
	fill_rect(u, v, fill_w, h, aspect, 0.026, trigger_color, active ? color_alpha(trigger_color, 0.78) : 0.18);
	text_at(label, u + 0.014, v + (h * 0.61), aspect, _text_scales.trigger_label, active ? trigger_color : _palette.muted, active ? color_alpha(trigger_color, 0.96) : 0.96);
	text_at(val.toFixed(2), u + w - 0.072, v + (h * 0.61), aspect, _text_scales.trigger_value, _palette.muted, 0.92);
}

function draw_joy(name, u, v, w, h, label, aspect, accent, layout_name)
{
	var pad_part = _parts[layout_name + "_pad"] || [0.50, 0.51, 0.58];
	var value_x_part = _parts[layout_name + "_value_x"] || _parts[layout_name + "_values"] || [0.10, 0.72];
	var value_y_part = _parts[layout_name + "_value_y"] || [value_x_part[0], value_x_part[1] + 0.14];
	var value_scale = _part_text_scales[layout_name + "_values"] || _text_scales.value;
	var cross_scale = _stick_styles[name + "_cross"] || 1.0;
	var center_scale = _stick_styles[name + "_center"] || 0.28;
	var knob_scale = _stick_styles[name + "_knob"] || 0.42;
	var x = clamp(state_value("axis_" + name + "_x", 0), -1, 1);
	var raw_y = clamp(state_value("axis_" + name + "_y", 0), -1, 1);
	var y = -raw_y;
	var r = Math.sqrt((x * x) + (y * y));
	var theta = Math.atan2(y, x);
	var cx = u + (w * pad_part[0]);
	var cy = v + (h * pad_part[1]);
	var radius = Math.min(w, h) * pad_part[2] * 0.5;
	var px;
	var py;
	var moving;
	var pressed;
	var stick_color = press_color("stick");
	var stick_alpha = color_alpha(stick_color, 0.82);

	if (r > 1) {
		r = 1;
	}

	px = cx + (Math.cos(theta) * r * radius);
	py = cy + (Math.sin(theta) * r * radius);
	moving = r > 0.02;
	pressed = state_active("button_" + name + "_stick");

	draw_panel(u, v, w, h, label, aspect, layout_name);
	line_uv(cx - (radius * cross_scale), cy, cx + (radius * cross_scale), cy, aspect, _palette.line, 0.55);
	line_uv(cx, cy - (radius * cross_scale), cx, cy + (radius * cross_scale), aspect, _palette.line, 0.55);
	fill_stroke_circle(cx, cy, radius * 2.0, aspect, _palette.panel, _palette.line, 0.12, 0.75);
	fill_stroke_circle(cx, cy, radius * center_scale, aspect, _palette.panel2, _palette.line, 0.42, 0.52);
	line_uv(cx, cy, px, py, aspect, moving || pressed ? stick_color : _palette.line, moving || pressed ? 0.78 : 0.32);
	circle_path(px, py, radius * knob_scale, aspect);
	if (pressed) {
		set_color(stick_color, stick_alpha);
		mgraphics.fill_preserve();
	}
	set_color(pressed ? stick_color : _palette.line, pressed ? color_alpha(stick_color, 0.95) : 0.95);
	mgraphics.stroke();

	if (_show_values) {
		text_at("X " + x.toFixed(3), u + (w * value_x_part[0]), v + (h * value_x_part[1]), aspect, value_scale, _palette.muted, 0.92);
		text_at("Y " + y.toFixed(3), u + (w * value_y_part[0]), v + (h * value_y_part[1]), aspect, value_scale, _palette.muted, 0.92);
	}
	draw_part_overlay(layout_name + "_pad", aspect);
	draw_part_overlay(layout_name + "_value_x", aspect);
	draw_part_overlay(layout_name + "_value_y", aspect);
}

function draw_dpad(u, v, w, h, aspect, layout_name)
{
	var up = _parts.dpad_up;
	var down = _parts.dpad_down;
	var left = _parts.dpad_left;
	var right = _parts.dpad_right;

	draw_panel(u, v, w, h, "DPAD", aspect, layout_name);
	draw_pill_button("button_dpad_up", u + (w * (up[0] - up[2] * 0.5)), v + (h * (up[1] - up[3] * 0.5)), w * up[2], h * up[3], "U", aspect, _palette.green);
	draw_pill_button("button_dpad_down", u + (w * (down[0] - down[2] * 0.5)), v + (h * (down[1] - down[3] * 0.5)), w * down[2], h * down[3], "D", aspect, _palette.green);
	draw_pill_button("button_dpad_left", u + (w * (left[0] - left[2] * 0.5)), v + (h * (left[1] - left[3] * 0.5)), w * left[2], h * left[3], "L", aspect, _palette.green);
	draw_pill_button("button_dpad_right", u + (w * (right[0] - right[2] * 0.5)), v + (h * (right[1] - right[3] * 0.5)), w * right[2], h * right[3], "R", aspect, _palette.green);
	draw_part_overlay("dpad_up", aspect);
	draw_part_overlay("dpad_down", aspect);
	draw_part_overlay("dpad_left", aspect);
	draw_part_overlay("dpad_right", aspect);
}

function draw_face_buttons(u, v, w, h, aspect, layout_name)
{
	var y = _parts.face_y;
	var a = _parts.face_a;
	var x = _parts.face_x;
	var b = _parts.face_b;

	draw_panel(u, v, w, h, "FACE", aspect, layout_name);
	draw_round_button("button_y", u + (w * y[0]), v + (h * y[1]), Math.min(w, h) * y[2], "TRI", aspect, _palette.pink);
	draw_round_button("button_a", u + (w * a[0]), v + (h * a[1]), Math.min(w, h) * a[2], "X", aspect, _palette.blue);
	draw_round_button("button_x", u + (w * x[0]), v + (h * x[1]), Math.min(w, h) * x[2], "SQ", aspect, _palette.green);
	draw_round_button("button_b", u + (w * b[0]), v + (h * b[1]), Math.min(w, h) * b[2], "CIR", aspect, _palette.warm);
	draw_part_overlay("face_y", aspect);
	draw_part_overlay("face_a", aspect);
	draw_part_overlay("face_x", aspect);
	draw_part_overlay("face_b", aspect);
}

function draw_touch_finger(name, u, v, w, h, aspect, accent, label)
{
	var x = clamp(state_value("touch_" + name + "_x", 0), 0, 1);
	var y = clamp(state_value("touch_" + name + "_y", 0), 0, 1);
	var pressure = clamp(state_value("touch_" + name + "_pressure", 0), 0, 1);
	var press = 0;
	var px;
	var py;
	var d;
	var knob_scale = _stick_styles.touch_knob || 1.0;
	var touch_color = press_color("touch_finger");
	var touch_alpha = color_alpha(touch_color, 0);

	if (_state["touch_" + name + "_pressure"]) {
		press = _state["touch_" + name + "_pressure"].press;
		_state["touch_" + name + "_pressure"].press = false;
	}

	if (pressure <= 0 && !press) {
		return;
	}

	px = u + (w * x);
	py = v + (h * y);
	d = (0.035 + (pressure * 0.055)) * knob_scale;

	fill_stroke_circle(px, py, d, aspect, touch_color, touch_color, (0.25 + (pressure * 0.55)) * touch_alpha, 0.95 * touch_alpha);
	fill_stroke_circle(px, py, d * 0.2, aspect, _palette.bg, touch_color, 0.46, 0.88 * touch_alpha);
	text_center(label, px, py + d * 0.92, aspect, _text_scales.finger, touch_color, 0.82 * touch_alpha);
}

function draw_touchpad(u, v, w, h, aspect, layout_name)
{
	var area = _parts.touch_area;
	var f0 = _parts.touch_f0_value;
	var f1 = _parts.touch_f1_value;
	var click = _parts.touch_click;
	var area_u = u + (w * (area[0] - (area[2] * 0.5)));
	var area_v = v + (h * (area[1] - (area[3] * 0.5)));
	var area_w = w * area[2];
	var area_h = h * area[3];

	draw_panel(u, v, w, h, "TOUCHPAD", aspect, layout_name);

	draw_pill_button("button_touchpad", u + (w * (click[0] - click[2] * 0.5)), v + (h * (click[1] - click[3] * 0.5)), w * click[2], h * click[3], "CLICK", aspect, press_color("touchpad"));

	fill_stroke_rect(area_u, area_v, area_w, area_h, aspect, 0.038, _palette.panel2, _palette.line, 0.45, 0.70);

	line_uv(area_u, area_v + (area_h * 0.50), area_u + area_w, area_v + (area_h * 0.50), aspect, _palette.line, 0.35);
	line_uv(area_u + (area_w * 0.50), area_v, area_u + (area_w * 0.50), area_v + area_h, aspect, _palette.line, 0.35);

	draw_touch_finger("finger0", area_u, area_v, area_w, area_h, aspect, _palette.blue, "0");
	draw_touch_finger("finger1", area_u, area_v, area_w, area_h, aspect, _palette.warm, "1");

	draw_touch_value("finger0", u + (w * f0[0]), v + (h * f0[1]), aspect, "F0", "touch_f0_value");
	draw_touch_value("finger1", u + (w * f1[0]), v + (h * f1[1]), aspect, "F1", "touch_f1_value");
	draw_part_overlay("touch_area", aspect);
	draw_part_overlay("touch_f0_value", aspect);
	draw_part_overlay("touch_f1_value", aspect);
	draw_part_overlay("touch_click", aspect);
}

function draw_touch_value(name, u, v, aspect, label, scale_name)
{
	var pressure = clamp(state_value("touch_" + name + "_pressure", 0), 0, 1);
	var x = clamp(state_value("touch_" + name + "_x", 0), 0, 1);
	var y = clamp(state_value("touch_" + name + "_y", 0), 0, 1);
	var scale = _part_text_scales[scale_name] || _text_scales.touch_value;

	if (pressure <= 0) {
		text_at(label + " idle", u, v, aspect, scale, _palette.muted, 0.92);
	} else {
		text_at(label + " " + x.toFixed(2) + "," + y.toFixed(2), u, v, aspect, scale, _palette.muted, 0.92);
	}
}

function draw_system_buttons(u, v, w, h, aspect, layout_name)
{
	var back = _parts.system_back;
	var guide = _parts.system_guide;
	var start = _parts.system_start;
	var misc = _parts.system_misc;

	draw_panel(u, v, w, h, "SYSTEM", aspect, layout_name);

	draw_pill_button("button_back", u + (w * (back[0] - back[2] * 0.5)), v + (h * (back[1] - back[3] * 0.5)), w * back[2], h * back[3], "BACK", aspect, _palette.blue);
	draw_pill_button("button_guide", u + (w * (guide[0] - guide[2] * 0.5)), v + (h * (guide[1] - guide[3] * 0.5)), w * guide[2], h * guide[3], "PS", aspect, _palette.warm);
	draw_pill_button("button_start", u + (w * (start[0] - start[2] * 0.5)), v + (h * (start[1] - start[3] * 0.5)), w * start[2], h * start[3], "START", aspect, _palette.blue);
	draw_pill_button("button_misc1", u + (w * (misc[0] - misc[2] * 0.5)), v + (h * (misc[1] - misc[3] * 0.5)), w * misc[2], h * misc[3], "MISC", aspect, _palette.green);
	draw_part_overlay("system_back", aspect);
	draw_part_overlay("system_guide", aspect);
	draw_part_overlay("system_start", aspect);
	draw_part_overlay("system_misc", aspect);
}

function draw_header(aspect)
{
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
	var box;

	if (_drawbg) {
		set_color(_palette.bg, 1);
		mgraphics.rectangle(-aspect, 1, aspect * 2, 2);
		mgraphics.fill();
	}

	mgraphics.set_line_width(_linewidth / height);
	_font_unit = height / 256;
	mgraphics.set_font_size(_font_size * _font_unit);

	draw_header(aspect);

	box = frame_box(_layout.l2);
	draw_trigger("axis_left_trigger", box[0], box[1], box[2], box[3], "L2", aspect, _palette.warm);
	draw_edit_overlay(box[0], box[1], box[2], box[3], "l2", aspect);

	box = frame_box(_layout.l1);
	draw_shoulder_button("button_left_shoulder", box[0], box[1], box[2], box[3], "L1", aspect, _palette.blue);
	draw_edit_overlay(box[0], box[1], box[2], box[3], "l1", aspect);

	box = frame_box(_layout.r1);
	draw_shoulder_button("button_right_shoulder", box[0], box[1], box[2], box[3], "R1", aspect, _palette.blue);
	draw_edit_overlay(box[0], box[1], box[2], box[3], "r1", aspect);

	box = frame_box(_layout.r2);
	draw_trigger("axis_right_trigger", box[0], box[1], box[2], box[3], "R2", aspect, _palette.warm);
	draw_edit_overlay(box[0], box[1], box[2], box[3], "r2", aspect);

	box = frame_box(_layout.touchpad);
	draw_touchpad(box[0], box[1], box[2], box[3], aspect, "touchpad");
	draw_edit_overlay(box[0], box[1], box[2], box[3], "touchpad", aspect);

	box = frame_box(_layout.system);
	draw_system_buttons(box[0], box[1], box[2], box[3], aspect, "system");
	draw_edit_overlay(box[0], box[1], box[2], box[3], "system", aspect);

	box = frame_box(_layout.left_stick);
	draw_joy("left", box[0], box[1], box[2], box[3], "LEFT STICK", aspect, _palette.blue, "left_stick");
	draw_edit_overlay(box[0], box[1], box[2], box[3], "left_stick", aspect);

	box = frame_box(_layout.dpad);
	draw_dpad(box[0], box[1], box[2], box[3], aspect, "dpad");
	draw_edit_overlay(box[0], box[1], box[2], box[3], "dpad", aspect);

	box = frame_box(_layout.face);
	draw_face_buttons(box[0], box[1], box[2], box[3], aspect, "face");
	draw_edit_overlay(box[0], box[1], box[2], box[3], "face", aspect);

	box = frame_box(_layout.right_stick);
	draw_joy("right", box[0], box[1], box[2], box[3], "RIGHT STICK", aspect, _palette.pink, "right_stick");
	draw_edit_overlay(box[0], box[1], box[2], box[3], "right_stick", aspect);
}
