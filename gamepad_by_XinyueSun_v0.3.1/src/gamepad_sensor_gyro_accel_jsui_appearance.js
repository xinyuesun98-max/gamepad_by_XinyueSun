/*

gamepad sensor gyro / accel jsui

Use either:
  [route sensor_gyro sensor_accel]
    outlet 1 -> jsui inlet 1, outlet 2 -> jsui inlet 2

or send named messages directly:
  sensor_gyro x y z
  sensor_accel x y z

*/

autowatch = 1;
inlets = 2;
outlets = 0;

var _fgcolor = safe_attr("textcolor", [0.9, 0.9, 0.9, 1]);
var _bgcolor = safe_attr("locked_bgcolor", [0.1, 0.1, 0.1, 1]);
var _drawbg = 1;
var _show_values = 1;
var _font_size = 10.0;
var _font_unit = 1.0;
var _linewidth = 2.0;
var _gyro_scale = 0.015;
var _accel_range = 2.0;
var _gyro_range = 8.0;

// Appearance controls for the POSE BOX.
// X and Z form the largest face; Y is the thickness/depth.
var _box_size_x = 3.0;
var _box_size_y = 0.8;
var _box_size_z = 1.5;
var _box_display_scale = 1.25;
var _box_line_width = 5.0;
var _box_line_color = [0.9647, 0.5373, 0.3, 1];
var _box_fill_color = [0.9647, 0.5373, 0.3, 0.];
var _panel_line_width = 3.0;
var _panel_fill_color = null;//[0.118, 0.118, 0.118, 0.85];
var _panel_border_color = [1, 1, 1, 0.1]; //[1, 1, 1, 0.75] //[0.9647, 0.5373, 0.3, 1]
var _axis_length_x = 0.8;
var _axis_length_y = 0.8;
var _axis_length_z = 0.8;
var _axis_alpha_x = 0.8;
var _axis_alpha_y = 0.85;
var _axis_alpha_z = 0.85;
var _vector_bar_height = 0.0650;
var _vector_row_spacing = 0.00;
var _vector_title_scale = 0.8;
var _vector_label_scale = 0.88;
var _vector_value_scale = 0.80;
var _vector_label_x = 0.055;
var _vector_bar_x = 0.14;
var _vector_bar_width = 0.8;
var _vector_value_x = 0.66;
var _gyro_axis_y = [0.05, 0.128, 0.205];
var _accel_axis_y = [0.05, 0.128, 0.205];
var _gyro_vector_colors = [
	[0.906, 0.412, 0.259, 1.000],
	[0.965, 0.537, 0.106, 1],
	[0.9647, 0.5373, 0.3, 1]//0.906 0.412 0.259 1.000
];
var _accel_vector_colors = [
    [0.9647, 0.5373, 0.3, 1],//	0.9647, 0.5373, 0.3, 1
    [0.906, 0.412, 0.259, 1.000],//1.000, 0.463, 0.302, 1 //0.906 0.412 0.259 1.000
	[0.965, 0.537, 0.106, 1]//0.965, 0.537, 0.106, 1
];
var _gyro_title_pos = [0.145, -0.085];
var _accel_title_pos = [0.145, -0.085];
var _gyro_title_color = [1.00, 1, 1, 1];
var _accel_title_color = [1, 1, 1, 1];

var _gyro = [0, 0, 0];
var _gyro_offset = [0, 0, 0];
var _raw_accel = [0, 0, 0];
var _accel = [0, 0, 0];
var _accel_sign = [-1, 1, -1];
var _raw_roll = 0;
var _raw_pitch = 0;
var _raw_box_z_rot = 0;
var _roll_zero = 0;
var _pitch_zero = 0;
var _box_z_zero = 0;
var _roll_sign = -1;
var _pitch_sign = -1;
var _box_z_sign = -1;
var _yaw_sign = -1;
var _model_y_sign = 1;
var _roll = 0;
var _pitch = 0;
var _box_z_rot = 0;
var _draw_roll = 0;
var _draw_box_z_rot = 0;
var _smooth_amount = 0.3;
var _yaw = 0;
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
	_gyro = [0, 0, 0];
	_gyro_offset = [0, 0, 0];
	_raw_accel = [0, 0, 0];
	_accel = [0, 0, 0];
	_raw_roll = 0;
	_raw_pitch = 0;
	_raw_box_z_rot = 0;
	_roll_zero = 0;
	_pitch_zero = 0;
	_box_z_zero = 0;
	_roll = 0;
	_pitch = 0;
	_box_z_rot = 0;
	_draw_roll = 0;
	_draw_box_z_rot = 0;
	_yaw = 0;
	mgraphics.redraw();
}

function zero()
{
	_gyro_offset = [_gyro[0], _gyro[1], _gyro[2]];
	_roll_zero = _roll_sign * _raw_roll;
	_pitch_zero = _pitch_sign * _raw_pitch;
	_box_z_zero = _box_z_sign * _raw_box_z_rot;
	_yaw = 0;
	update_accel_angles();
	_draw_roll = _roll;
	_draw_box_z_rot = _box_z_rot;
	mgraphics.redraw();
}

function calibrate()
{
	zero();
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

function boxsize(x, y, z)
{
	_box_size_x = Math.max(0.05, x);
	_box_size_y = Math.max(0.05, y);
	_box_size_z = Math.max(0.05, z);
	mgraphics.redraw();
}

function boxscale(v)
{
	_box_display_scale = Math.max(0.05, v);
	mgraphics.redraw();
}

function boxlinewidth(v)
{
	_box_line_width = Math.max(0.5, v);
	mgraphics.redraw();
}

function panellinewidth(v)
{
	_panel_line_width = Math.max(0.5, v);
	mgraphics.redraw();
}

function panelfillcolor(r, g, b, a)
{
	_panel_fill_color = make_color(r, g, b, a);
	mgraphics.redraw();
}

function panelbordercolor(r, g, b, a)
{
	_panel_border_color = make_color(r, g, b, a);
	mgraphics.redraw();
}

function axislength(x, y, z)
{
	_axis_length_x = Math.max(0.01, x);
	_axis_length_y = Math.max(0.01, y);
	_axis_length_z = Math.max(0.01, z);
	mgraphics.redraw();
}

function axisalpha(x, y, z)
{
	_axis_alpha_x = clamp(x, 0, 1);
	_axis_alpha_y = clamp(y, 0, 1);
	_axis_alpha_z = clamp(z, 0, 1);
	mgraphics.redraw();
}

function boxlinecolor(r, g, b, a)
{
	_box_line_color = make_color(r, g, b, a);
	mgraphics.redraw();
}

function boxfillcolor(r, g, b, a)
{
	_box_fill_color = make_color(r, g, b, a);
	mgraphics.redraw();
}

function vectorbarheight(v)
{
	_vector_bar_height = Math.max(0.006, v);
	mgraphics.redraw();
}

function vectorrowspacing(v)
{
	_vector_row_spacing = Math.max(0.020, v);
	_gyro_axis_y = [0.105, 0.105 + _vector_row_spacing, 0.105 + (_vector_row_spacing * 2)];
	_accel_axis_y = [0.105, 0.105 + _vector_row_spacing, 0.105 + (_vector_row_spacing * 2)];
	mgraphics.redraw();
}

function vectorxpos(label_x, bar_x, value_x)
{
	_vector_label_x = label_x;
	_vector_bar_x = bar_x;
	_vector_value_x = value_x;
	mgraphics.redraw();
}

function vectorbarwidth(v)
{
	_vector_bar_width = Math.max(0.01, v);
	mgraphics.redraw();
}

function gyroaxispos(axis, y)
{
	set_axis_y(_gyro_axis_y, axis, y);
	mgraphics.redraw();
}

function accelaxispos(axis, y)
{
	set_axis_y(_accel_axis_y, axis, y);
	mgraphics.redraw();
}

function vectortextscale(title, label, value)
{
	_vector_title_scale = Math.max(0.1, title);
	_vector_label_scale = Math.max(0.1, label);
	_vector_value_scale = Math.max(0.1, value);
	mgraphics.redraw();
}

function gyrotitlepos(x, y)
{
	_gyro_title_pos = [x, y];
	mgraphics.redraw();
}

function acceltitlepos(x, y)
{
	_accel_title_pos = [x, y];
	mgraphics.redraw();
}

function gyrotitlecolor(r, g, b, a)
{
	_gyro_title_color = make_color(r, g, b, a);
	mgraphics.redraw();
}

function acceltitlecolor(r, g, b, a)
{
	_accel_title_color = make_color(r, g, b, a);
	mgraphics.redraw();
}

function gyroaxiscolor(axis, r, g, b, a)
{
	set_axis_color(_gyro_vector_colors, axis, r, g, b, a);
	mgraphics.redraw();
}

function accelaxiscolor(axis, r, g, b, a)
{
	set_axis_color(_accel_vector_colors, axis, r, g, b, a);
	mgraphics.redraw();
}

function fontsize(v)
{
	_font_size = Math.max(6.0, v);
	mgraphics.redraw();
}

function smooth(v)
{
	_smooth_amount = clamp(v, 0.01, 1.0);
}

function gyroscale(v)
{
	_gyro_scale = Math.max(0, v);
}

function accelrange(v)
{
	_accel_range = Math.max(0.01, v);
	mgraphics.redraw();
}

function gyrorange(v)
{
	_gyro_range = Math.max(0.01, v);
	mgraphics.redraw();
}

function invertx(v)
{
	_roll_sign = v ? -1 : 1;
	_roll_zero = _roll_sign * _raw_roll;
	update_accel_angles();
	mgraphics.redraw();
}

function inverty(v)
{
	_pitch_sign = v ? -1 : 1;
	_pitch_zero = _pitch_sign * _raw_pitch;
	update_accel_angles();
	mgraphics.redraw();
}

function invertz(v)
{
	_yaw_sign = v ? -1 : 1;
	_yaw = 0;
	mgraphics.redraw();
}

function modelflip(v)
{
	_model_y_sign = v ? -1 : 1;
	mgraphics.redraw();
}

function accelxsign(v)
{
	_accel_sign[0] = v ? -1 : 1;
	apply_accel_sign();
}

function accelzsign(v)
{
	_accel_sign[2] = v ? -1 : 1;
	apply_accel_sign();
}

function boxzsign(v)
{
	_box_z_sign = v ? -1 : 1;
	_box_z_zero = _box_z_sign * _raw_box_z_rot;
	update_accel_angles();
	mgraphics.redraw();
}

function list()
{
	if (inlet === 0) {
		set_gyro(args_to_xyz(arguments));
	} else {
		set_accel(args_to_xyz(arguments));
	}
}

function anything()
{
	var values = args_to_xyz(arguments);

	if (messagename == "sensor_gyro" || messagename == "gyro") {
		set_gyro(values);
	} else if (messagename == "sensor_accel" || messagename == "accel") {
		set_accel(values);
	}
}

function sensor_gyro(x, y, z)
{
	set_gyro(args_to_xyz(arguments));
}

function gyro(x, y, z)
{
	set_gyro(args_to_xyz(arguments));
}

function sensor_accel(x, y, z)
{
	set_accel(args_to_xyz(arguments));
}

function accel(x, y, z)
{
	set_accel(args_to_xyz(arguments));
}

function set_gyro(v)
{
	_gyro = [
		v[0] - _gyro_offset[0],
		v[1] - _gyro_offset[1],
		v[2] - _gyro_offset[2]
	];
	_yaw += clamp(_gyro[2] * _gyro_scale * _yaw_sign, -0.25, 0.25);
	mgraphics.redraw();
}

function set_accel(v)
{
	_raw_accel = v;
	apply_accel_sign();
}

function apply_accel_sign()
{
	_accel = [
		_raw_accel[0] * _accel_sign[0],
		_raw_accel[1] * _accel_sign[1],
		_raw_accel[2] * _accel_sign[2]
	];
	update_accel_angles();
	mgraphics.redraw();
}

function update_accel_angles()
{
	var ax = _accel[0];
	var ay = _accel[1];
	var az = _accel[2];
	var normal = Math.max(0.001, Math.abs(ay));

	_raw_roll = Math.atan2(az, normal);
	_raw_box_z_rot = Math.atan2(ax, normal);
	_raw_pitch = 0;
	_roll = (_roll_sign * _raw_roll) - _roll_zero;
	_pitch = (_pitch_sign * _raw_pitch) - _pitch_zero;
	_box_z_rot = (_box_z_sign * _raw_box_z_rot) - _box_z_zero;
}

function update_smooth_pose()
{
	_draw_roll += (_roll - _draw_roll) * _smooth_amount;
	_draw_box_z_rot += (_box_z_rot - _draw_box_z_rot) * _smooth_amount;
}

function paint()
{
	_fgcolor = safe_attr("textcolor", _fgcolor);
	_bgcolor = safe_attr("locked_bgcolor", _bgcolor);
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
	update_smooth_pose();

	draw_box_model(0.025, 0.025, 0.95, 0.61, aspect);
	draw_vector_panel("GYRO", _gyro, 0.025, 0.675, 0.465, 0.305, _gyro_range, "rad/s", aspect, _gyro_vector_colors, _gyro_axis_y, _gyro_title_pos, _gyro_title_color);
	draw_vector_panel("ACCEL", _accel, 0.510, 0.675, 0.465, 0.305, _accel_range, "g", aspect, _accel_vector_colors, _accel_axis_y, _accel_title_pos, _accel_title_color);
}

function draw_header(aspect)
{
	text_at("SENSOR GYRO / ACCEL", 0.06, 0.08, aspect, 0.72, _palette.fg, 0.94);
	text_at("route-ready jsui", 0.72, 0.08, aspect, 0.52, _palette.muted, 0.88);
}

function draw_box_model(u, v, w, h, aspect)
{
	var hx = _box_size_x * 0.5;
	var hy = _box_size_y * 0.5;
	var hz = _box_size_z * 0.5;
	var front = [
		[-hx, hy, -hz],
		[hx, hy, -hz],
		[hx, hy, hz],
		[-hx, hy, hz]
	];
	var back = [
		[-hx, -hy, -hz],
		[hx, -hy, -hz],
		[hx, -hy, hz],
		[-hx, -hy, hz]
	];
	var i;
	var c = u + (w * 0.5);
	var mid = v + (h * 0.50);
	var scale = Math.min(w / Math.max(_box_size_x * 2.2, 0.1), h / Math.max(_box_size_z * 1.55, 0.1));
	scale *= _box_display_scale;

	mgraphics.set_line_width(_panel_line_width / mgraphics.size[1]);
	fill_stroke_rect(u, v, w, h, aspect, 0.028, panel_fill_color(), panel_border_color(), panel_fill_alpha(0.84), panel_border_alpha(0.70));
	mgraphics.set_line_width(_linewidth / mgraphics.size[1]);
	text_at("POSE BOX", u + 0.032, v + 0.055, aspect, 0.62, _palette.muted, 0.95);

	mgraphics.set_line_width(_box_line_width / mgraphics.size[1]);
	fill_poly3(front, c, mid, scale, aspect, _box_fill_color, color_alpha(_box_fill_color, 0.22));
	draw_poly3(back, c, mid, scale, aspect, _box_line_color, color_alpha(_box_line_color, 0.42) * 0.42, 1);
	for (i = 0; i < front.length; i++) {
		draw_line3(front[i], back[i], c, mid, scale, aspect, _box_line_color, color_alpha(_box_line_color, 0.64) * 0.64);
	}
	draw_poly3(front, c, mid, scale, aspect, _box_line_color, color_alpha(_box_line_color, 0.98), 1);
	mgraphics.set_line_width(_linewidth / mgraphics.size[1]);

	draw_axis(c, mid, scale, aspect, [_axis_length_x, 0, 0], "X", _palette.red, _axis_alpha_x);
	draw_axis(c, mid, scale, aspect, [0, _axis_length_y, 0], "Y", _palette.green, _axis_alpha_y);
	draw_axis(c, mid, scale, aspect, [0, 0, _axis_length_z], "Z", _palette.blue, _axis_alpha_z);
}

function draw_rect3(origin, w, h, c, mid, scale, aspect, color, alpha)
{
	draw_poly3([
		[origin[0], origin[1], origin[2]],
		[origin[0] + w, origin[1], origin[2]],
		[origin[0] + w, origin[1] + h, origin[2]],
		[origin[0], origin[1] + h, origin[2]]
	], c, mid, scale, aspect, color, alpha, 1);
}

function draw_poly3(points, c, mid, scale, aspect, color, alpha, closed)
{
	var i;

	for (i = 0; i < points.length - 1; i++) {
		draw_line3(points[i], points[i + 1], c, mid, scale, aspect, color, alpha);
	}
	if (closed && points.length > 2) {
		draw_line3(points[points.length - 1], points[0], c, mid, scale, aspect, color, alpha);
	}
}

function fill_poly3(points, c, mid, scale, aspect, color, alpha)
{
	var i;
	var p;

	if (points.length < 3) {
		return;
	}

	p = project_point(rotate_model_point(points[0]), c, mid, scale);
	mgraphics.move_to(x_from_u(p[0], aspect), y_from_v(p[1]));
	for (i = 1; i < points.length; i++) {
		p = project_point(rotate_model_point(points[i]), c, mid, scale);
		mgraphics.line_to(x_from_u(p[0], aspect), y_from_v(p[1]));
	}
	mgraphics.close_path();
	set_color(color, alpha);
	mgraphics.fill();
}

function draw_line3(a, b, c, mid, scale, aspect, color, alpha)
{
	var p0 = project_point(rotate_model_point(a), c, mid, scale);
	var p1 = project_point(rotate_model_point(b), c, mid, scale);

	line_uv(p0[0], p0[1], p1[0], p1[1], aspect, color, alpha);
}

function draw_axis(c, mid, scale, aspect, endpoint, label, color, alpha)
{
	var p0 = project_point(rotate_model_point([0, 0, 0]), c, mid, scale);
	var p1 = project_point(rotate_model_point(endpoint), c, mid, scale);

	line_uv(p0[0], p0[1], p1[0], p1[1], aspect, color, alpha);
}

function draw_vector_panel(title, vec, u, v, w, h, range, unit, aspect, colors, axis_y, title_pos, title_color)
{
	var labels = ["X", "Y", "Z"];
	var i;
	var row_v;
	var val;
	var amount;
	var bar_w = w * _vector_bar_width;
	var bar_u = u + (_vector_bar_x * w);
	var zero_u = bar_u + (bar_w * 0.5);
	var bar_h = _vector_bar_height;

	mgraphics.set_line_width(_panel_line_width / mgraphics.size[1]);
	fill_stroke_rect(u, v, w, h, aspect, 0.028, panel_fill_color(), panel_border_color(), panel_fill_alpha(0.84), panel_border_alpha(0.70));
	mgraphics.set_line_width(_linewidth / mgraphics.size[1]);
	text_at(title, u + title_pos[0], v + title_pos[1], aspect, _vector_title_scale, title_color, 0.95);

	for (i = 0; i < 3; i++) {
		row_v = v + axis_y[i];
		val = vec[i];
		amount = clamp(val / range, -1, 1);
		text_at(labels[i], u + (_vector_label_x * w), row_v + (bar_h * 0.70), aspect, _vector_label_scale, colors[i], color_alpha(colors[i], 0.95));
		fill_rect(bar_u, row_v, bar_w, bar_h, aspect, 0.012, [1.000, 0.463, 0.302, 1], 0.10);
		line_uv(zero_u, row_v - 0.005, zero_u, row_v + bar_h + 0.006, aspect, _palette.line, 0.80);
		if (amount >= 0) {
			fill_rect(zero_u, row_v, (bar_w * 0.5) * amount, bar_h, aspect, 0.012, colors[i], color_alpha(colors[i], 0.72));
		} else {
			fill_rect(zero_u + ((bar_w * 0.5) * amount), row_v, (bar_w * 0.5) * -amount, bar_h, aspect, 0.012, colors[i], color_alpha(colors[i], 0.72));
		}
		if (_show_values) {
			text_at(val.toFixed(3), u + (_vector_value_x * w), row_v + (bar_h * 0.72), aspect, _vector_value_scale, _palette.fg, 0.88);
		}
	}
}

function draw_gravity_disc(u, v, d, aspect)
{
	var ax = clamp(_accel[0] / _accel_range, -1, 1);
	var ay = clamp(_accel[1] / _accel_range, -1, 1);
	var mag = Math.sqrt((_accel[0] * _accel[0]) + (_accel[1] * _accel[1]) + (_accel[2] * _accel[2]));
	var px = u + (d * 0.5) + (ax * d * 0.36);
	var py = v + (d * 0.5) - (ay * d * 0.36);

	fill_stroke_circle(u + (d * 0.5), v + (d * 0.5), d, aspect, _palette.panel, _palette.line, 0.30, 0.70);
	line_uv(u + (d * 0.5), v + 0.03, u + (d * 0.5), v + d - 0.03, aspect, _palette.line, 0.42);
	line_uv(u + 0.03, v + (d * 0.5), u + d - 0.03, v + (d * 0.5), aspect, _palette.line, 0.42);
	fill_stroke_circle(px, py, d * 0.16, aspect, _palette.green, _palette.green, 0.78, 0.95);
	text_center("ACCEL XY", u + (d * 0.5), v - 0.020, aspect, 0.48, _palette.muted, 0.92);
	if (_show_values) {
		text_center("|a| " + mag.toFixed(2), u + (d * 0.5), v + d + 0.045, aspect, 0.45, _palette.muted, 0.92);
	}
}

function draw_yaw_dial(u, v, d, aspect)
{
	var cx = u + (d * 0.5);
	var cy = v + (d * 0.5);
	var p = angle_point(cx, cy, d * 0.39, _yaw);

	fill_stroke_circle(cx, cy, d, aspect, _palette.panel, _palette.line, 0.30, 0.70);
	line_uv(cx, cy, p[0], p[1], aspect, _palette.warm, 0.95);
	fill_stroke_circle(p[0], p[1], d * 0.13, aspect, _palette.warm, _palette.warm, 0.76, 0.95);
	text_center("GYRO Z", cx, v - 0.020, aspect, 0.48, _palette.muted, 0.92);
	if (_show_values) {
		text_center(_gyro[2].toFixed(2), cx, v + d + 0.045, aspect, 0.45, _palette.muted, 0.92);
	}
}

function rotate_point(p)
{
	var x = p[0];
	var y = p[1];
	var z = p[2];
	var cy = Math.cos(_yaw);
	var sy = Math.sin(_yaw);
	var cp = Math.cos(_pitch);
	var sp = Math.sin(_pitch);
	var cr = Math.cos(_roll);
	var sr = Math.sin(_roll);
	var nx;
	var ny;
	var nz;

	nx = (x * cy) - (y * sy);
	ny = (x * sy) + (y * cy);
	x = nx;
	y = ny;

	ny = (y * cr) - (z * sr);
	nz = (y * sr) + (z * cr);
	y = ny;
	z = nz;

	nx = (x * cp) + (z * sp);
	nz = (-x * sp) + (z * cp);
	x = nx;
	z = nz;

	return [x, y, z];
}

function rotate_model_point(p)
{
	var x = p[0];
	var y = p[1] * _model_y_sign;
	var z = p[2];
	var cz = Math.cos(_draw_box_z_rot);
	var sz = Math.sin(_draw_box_z_rot);
	var cr = Math.cos(_draw_roll);
	var sr = Math.sin(_draw_roll);
	var nx;
	var ny;
	var nz;

	nx = (x * cz) - (y * sz);
	ny = (x * sz) + (y * cz);
	x = nx;
	y = ny;

	ny = (y * cr) - (z * sr);
	nz = (y * sr) + (z * cr);
	y = ny;
	z = nz;

	return [x, y, z];
}

function project_point(p, c, mid, scale)
{
	var perspective = 2.8 / (2.8 - (p[1] * 0.32));

	return [
		c + (p[0] * scale * perspective),
		mid - (p[2] * scale * perspective)
	];
}

function angle_point(cx, cy, radius, angle)
{
	return [
		cx + (Math.cos(angle - (Math.PI * 0.5)) * radius),
		cy + (Math.sin(angle - (Math.PI * 0.5)) * radius)
	];
}

function args_to_xyz(args)
{
	var x = 0;
	var y = 0;
	var z = 0;

	if (args.length > 0) {
		x = parseFloat(args[0]);
	}
	if (args.length > 1) {
		y = parseFloat(args[1]);
	}
	if (args.length > 2) {
		z = parseFloat(args[2]);
	}

	return [
		isNaN(x) ? 0 : x,
		isNaN(y) ? 0 : y,
		isNaN(z) ? 0 : z
	];
}

function safe_attr(name, fallback)
{
	var value;

	try {
		value = this.patcher.getattr(name);
		if (value && value.length >= 3) {
			return value;
		}
	} catch (e) {
	}

	return fallback;
}

function update_palette()
{
	var bg = color4(_bgcolor);
	var fg = color4(_fgcolor);
	var luma = (0.2126 * bg[0]) + (0.7152 * bg[1]) + (0.0722 * bg[2]);
	var dark = luma < 0.5;

	_palette.bg = bg;
	_palette.fg = fg;
	_palette.panel = [0.118, 0.118, 0.118, 1.000];//mix_color(bg, fg, dark ? 0.0 : 0.07);
	_palette.panel2 = mix_color(bg, fg, dark ? 0.17 : 0.12);
	_palette.line = mix_color(bg, fg, dark ? 0.34 : 0.28);
	_palette.muted = mix_color(bg, fg, dark ? 0.60 : 0.50);
	_palette.red = dark ? [1.00, 0.36, 0.32, 1] : [0.82, 0.12, 0.09, 1];
	_palette.green = dark ? [0.32, 0.88, 0.58, 1] : [0.00, 0.50, 0.28, 1];
	_palette.blue = dark ? [0.22, 0.66, 1.00, 1] : [0.00, 0.32, 0.78, 1];
	_palette.warm = dark ? [1.00, 0.64, 0.24, 1] : [0.86, 0.36, 0.08, 1];
}

function mix_color(a, b, amount)
{
	return [
		(a[0] * (1 - amount)) + (b[0] * amount),
		(a[1] * (1 - amount)) + (b[1] * amount),
		(a[2] * (1 - amount)) + (b[2] * amount),
		(a[3] * (1 - amount)) + (b[3] * amount)
	];
}

function color4(c)
{
	return [
		c[0],
		c[1],
		c[2],
		c[3] === undefined ? 1 : c[3]
	];
}

function color_alpha(c, fallback)
{
	if (c && c[3] !== undefined) {
		return c[3];
	}
	return fallback;
}

function panel_fill_color()
{
	return _panel_fill_color || _palette.panel;
}

function panel_border_color()
{
	return _panel_border_color || _palette.line;
}

function panel_fill_alpha(fallback)
{
	return _panel_fill_color ? color_alpha(_panel_fill_color, fallback) : fallback;
}

function panel_border_alpha(fallback)
{
	return _panel_border_color ? color_alpha(_panel_border_color, fallback) : fallback;
}

function make_color(r, g, b, a)
{
	return [
		clamp(r, 0, 1),
		clamp(g, 0, 1),
		clamp(b, 0, 1),
		clamp(a === undefined ? 1 : a, 0, 1)
	];
}

function axis_index(axis)
{
	if (axis == "x" || axis == "X" || axis === 0) {
		return 0;
	}
	if (axis == "y" || axis == "Y" || axis === 1) {
		return 1;
	}
	if (axis == "z" || axis == "Z" || axis === 2) {
		return 2;
	}
	return -1;
}

function set_axis_color(colors, axis, r, g, b, a)
{
	var i = axis_index(axis);

	if (i >= 0) {
		colors[i] = make_color(r, g, b, a);
	}
}

function set_axis_y(rows, axis, y)
{
	var i = axis_index(axis);

	if (i >= 0) {
		rows[i] = y;
	}
}

function set_color(c, alpha)
{
	var a = alpha === undefined ? (c[3] === undefined ? 1 : c[3]) : alpha;
	mgraphics.set_source_rgba(c[0], c[1], c[2], a);
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
	var measure = [txt.length * _font_size * _font_unit * scale * 0.45, _font_size * _font_unit * scale];

	try {
		measure = mgraphics.text_measure(txt);
	} catch (e) {
	}

	set_color(c, alpha);
	mgraphics.set_font_size(_font_size * _font_unit * scale);
	mgraphics.move_to(x - (measure[0] * 0.5), y + (measure[1] * 0.35));
	mgraphics.show_text(txt);
}

function rect_path(u, v, w, h, aspect, radius)
{
	mgraphics.rectangle_rounded(x_from_u(u, aspect), y_from_v(v), w_from_u(w, aspect), h_from_v(h), radius || 0.02, radius || 0.02);
}

function fill_rect(u, v, w, h, aspect, radius, fill, alpha)
{
	rect_path(u, v, w, h, aspect, radius);
	set_color(fill, alpha);
	mgraphics.fill();
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

function rad_to_deg(v)
{
	return v * 180 / Math.PI;
}
