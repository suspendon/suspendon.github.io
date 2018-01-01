var grid_width = 8;
var grid_height = 8;
var tile_width = 64;
var tile_height = 64;
var grid = new Array();
var selected_x;
var selected_y;
var pc_pieces;
var human_pieces;
var pieces;
var human_to_move;
var gameover;
var images = new Array();
var images_s = new Array();

function init()
{
	window.gameover = false;
	window.selected_x = -1;
	window.selected_y = -1;
	window.pc_pieces = 4;
	window.human_pieces = 4;
	var parent_div = document.getElementById('grid');
	while (parent_div.firstChild) {
		parent_div.removeChild(parent_div.firstChild);
	}
	parent_div.style.width = (grid_width * tile_width) + "px";
	parent_div.style.height = (grid_height * tile_height) + "px";
	pieces = new Array();
	pieces["igor"] = {active: true, x: 4, y: 0, type: "king", human: false};
	pieces["vanya"] = {active: true, x: 3, y: 0, type: "crazy", human: false};
	pieces["zina"] = {active: true, x: 2, y: 0, type: "bishop", human: false};
	pieces["marina"] = {active: true, x: 5, y: 0, type: "bishop", human: false};
	pieces["fyodch"] = {active: true, x: 3, y: 7, type: "crazy", human:true};
	pieces["shefu"] = {active: true, x: 4, y: 7, type: "king", human:true};
	pieces["iura"] = {active: true, x: 2, y: 7, type: "bishop", human:true};
	pieces["marian"] = {active: true, x: 5, y: 7, type: "bishop", human:true};

	for (var key in window.pieces) {
		images[key] = new Image;
		images[key].src = "images/" + key + ".png";
		images_s[key] = new Image;
		images_s[key].src = "images/" + key + "_s.png";
	}

	generate_map_data();
	map_to_html();
	window.human_to_move = true;
}

function generate_map_data()
{
	for (x = 0; x < grid_width; x++) {
		window.grid[x] = [];
		for (y = 0; y < grid_height; y++) {
			window.grid[x][y] = "";
		}
	}
	for (var key in window.pieces) {
		window.grid[window.pieces[key].x][window.pieces[key].y] = key;
		if (window.pieces[key].human)
			window.human_pieces++;
		else
			window.pc_pieces++;
	}
}

function map_to_html()
{
	var img;
	var iDiv;
	var x = 0;
	var y = 0;
	for (x = 0; x < grid_width; x++) {
		for (y = 0; y < grid_height; y++) {
			// --- Output the image tag for this hex
			iDiv = document.createElement('div');
			iDiv.id = x + "_" + y;
			iDiv.className = 'cell';
			iDiv.style.position = "absolute";
			iDiv.style.left = x * tile_width;
			iDiv.style.top = y * tile_height;
			iDiv.style.backgroundColor =
			    (x + y) % 2 == 1 ? "Sienna" : "Moccasin";
			if (window.grid[x][y] != "") iDiv.style.backgroundImage =
			    "url('" + window.images[window.grid[x][y]].src + "')";
			document.getElementById('grid').appendChild(iDiv);
		}
	}
}

function handle_map_click(event)
{
	if (gameover || !human_to_move)
		return;
	var posx = 0;
	var posy = 0;
	if (event.pageX || event.pageY) {
		posx = event.pageX;
		posy = event.pageY;
	} else if (event.clientX || e.clientY) {
		posx = event.clientX + document.body.scrollLeft
		    + document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop
		    + document.documentElement.scrollTop;
	}
	// --- Apply offset for the map div
	var map = document.getElementById('grid');
	posx = posx - map.offsetLeft;
	posy = posy - map.offsetTop;
	x = posx / tile_width;
	y = posy / tile_height;
	cell_x = Math.floor(x);
	cell_y = Math.floor(y);

	if (cell_x >= 0 && cell_x < 8 && cell_y >= 0 && cell_y < 9) {
		// if nothing selected and clicked on human piece, select
		if (window.selected_x == -1) {
			if (window.grid[cell_x][cell_y] != "" && window.pieces[window.grid[cell_x][cell_y]].human) {
				window.selected_x = cell_x;
				window.selected_y = cell_y;
				document.getElementById(cell_x + "_" + cell_y).style.
				    backgroundImage =
				    "url('" +
				    images_s[window.grid[cell_x][cell_y]].src +
				    "')";
			}
		}
		// if selected and clicked are same, unselect
		else if (window.selected_x == cell_x
			 && window.selected_y == cell_y) {
			window.selected_x = -1;
			window.selected_y = -1;
			document.getElementById(cell_x + "_" +
						cell_y).style.backgroundImage =
			    "url('" + images[window.grid[cell_x][cell_y]].src + "')";
		}
		// if selected and clicked are different, check legality, move
		// unselect and (if not gameover) switch turn
		else {
			var legal =
			    is_legal(window.selected_x, window.selected_y, cell_x, cell_y);
			if (!legal)
				return;
			// if fyodch, randomize dst
			if (window.pieces[window.grid[window.selected_x][window.selected_y]].type ==
			    "crazy") {
				var available_moves = new Array();
				for (i = window.selected_x - 1;
				     i <= window.selected_x + 1; i++) {
					for (j = window.selected_y - 1;
					     j <= window.selected_y + 1; j++) {
						if (is_legal
						    (window.selected_x,
						     window.selected_y, i, j)) {
							available_moves.push({x: i, y: j});
						}
					}
				}
				var rnd = Math.floor(Math.random() * available_moves.length);
				cell_x = available_moves[rnd].x;
				cell_y = available_moves[rnd].y;
			}
			move(window.selected_x, window.selected_y, cell_x, cell_y);
			if (gameover) {
				x = window.confirm("Suspendon!!! Vrei să-i tragi încă una?");
				if (x) init();
				return;
			}
			window.selected_x = -1;
			window.selected_y = -1;
			think();
			if (gameover) {
				x = window.confirm("Ai pierdut. Mai încerci o dată?");
				if (x) init();
				return;
			}
		}
	}
}

function is_legal(src_x, src_y, dst_x, dst_y)
{
	// can't move outside the board
	if (dst_x < 0 || dst_x >= grid_height || dst_y < 0
	    || dst_y >= grid_width)
		return false;
	// can't move to same cell
	if (dst_x == src_x && dst_y == src_y)
		return false;
	var dx = Math.abs(dst_x - src_x);
	var dy = Math.abs(dst_y - src_y);
	if (window.human_to_move) {
		// no friendly fire
		if (window.grid[dst_x][dst_y] != ""
		    && window.pieces[window.grid[dst_x][dst_y]].human)
			return false;
	}
	// pc to move
	else {
		//no friendly fire
		if (window.grid[dst_x][dst_y] != ""
		    && !window.pieces[window.grid[dst_x][dst_y]].human)
			return false;
	}
	switch (window.pieces[window.grid[src_x][src_y]].type) {
		case "crazy":
		case "king":
			if (dx > 1 || dy > 1)
				return false;
			break;
		case "bishop":
			if (dx != 1 || dy != 1)
				return false;
			break;
		default:
			return false;
			break;
	}
	return true;
}

function move(src_x, src_y, dst_x, dst_y)
{
	// if there's a piece at dst, identify it
	// if it's igor, then gameover (SUSPENDON!)
	// else remove the piece and continue
	if (window.grid[dst_x][dst_y] != "") {
		if (window.grid[dst_x][dst_y] == "igor") {
			window.gameover = true;
		}
		window.pieces[window.grid[dst_x][dst_y]].active = false;
		if (window.pieces[window.grid[dst_x][dst_y]].human) human_pieces--;
		else pc_pieces--;
		if (human_pieces == 0) game_over = true;
	}
	var piece = window.grid[src_x][src_y];
	window.pieces[piece].x = dst_x;
	window.pieces[piece].y = dst_y;
	var src_div = document.getElementById(src_x + "_" + src_y);
	var dst_div = document.getElementById(dst_x + "_" + dst_y);
	window.grid[dst_x][dst_y] = window.grid[src_x][src_y];
	window.grid[src_x][src_y] = "";
	dst_div.style.backgroundImage =
	    "url('" + images[window.grid[dst_x][dst_y]].src + "')";
	src_div.style.backgroundImage = "";
	src_div.style.backgroundColor =
	    (src_x + src_y) % 2 == 1 ? "Sienna" : "Moccasin";
	display_quote(dst_x, dst_y);
	window.human_to_move = !window.human_to_move;
}

function think()
{
	// strategy: a random piece moves into a random cell :-)
	//select a piece
	var piece_name;
	var piece_id;
	var pos = new Array();
	for (x = 0; x < grid_width; x++) {
		pos[x] = [];
		for (y = 0; y < grid_height; y++) {
			pos[x][y] = window.grid[x][y];
		}
	}
	var available_moves = get_available_moves(pos, false);

	if (available_moves.length == 0) {
		window.gameover = true;
/**
		x = window.confirm("Suspendon!!! Vrei să-i tragi încă una?");
		}
		if (x) init();
**/
		return;
	}
	// randomize available moves
	for (i = available_moves.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = available_moves[i];
		available_moves[i] = available_moves[j];
		available_moves[j] = x;
	}

	var max = -999;
	var min;
	var min_new;
	var best_move = -1;
	var new_pos = new Array();
	var new_new_pos = new Array();
	var opponent_moves = new Array();
	for (var i = 0; i < available_moves.length; i++) {
//console.log(available_moves[i].src_x + "," + available_moves[i].src_y + "->" + available_moves[i].dst_x + "," + available_moves[i].dst_y);
		min = 999;
		for (var x = 0; x < grid_width; x++) {
			new_pos[x] = [];
			for (var y = 0; y < grid_height; y++) {
				new_pos[x][y] = window.grid[x][y];
			}
		}
		new_pos[available_moves[i].dst_x][available_moves[i].dst_y] = new_pos[available_moves[i].src_x][available_moves[i].src_y];
		new_pos[available_moves[i].src_x][available_moves[i].src_y] = "";

		opponent_moves = get_available_moves(new_pos, true);
		for (var j = 0; j < opponent_moves.length; j++) {
//console.log("  " + opponent_moves[j].src_x + "," + opponent_moves[j].src_y + "->" + opponent_moves[j].dst_x + "," + opponent_moves[j].dst_y);
			for (var x = 0; x < grid_width; x++) {
				new_new_pos[x] = [];
				for (var y = 0; y < grid_height; y++) {
					new_new_pos[x][y] = new_pos[x][y];
				}
			}
			new_new_pos[opponent_moves[j].dst_x][opponent_moves[j].dst_y] = new_new_pos[opponent_moves[j].src_x][opponent_moves[j].src_y];
			new_new_pos[opponent_moves[j].src_x][opponent_moves[j].src_y] = "";
			min_new = evaluate_position(new_new_pos);
			new_new_pos.length = 0;
			if (min_new < min) {
				min = min_new;
			}
//console.log("    " + min);
		}
		if (min > max) {
			max = min;
			best_move = i;
//console.log("New best score: " + max);
		}
		opponent_moves.length = 0;
		new_pos.length = 0;
	}
//console.log("Best move is: " + available_moves[best_move].src_x + "," + available_moves[best_move].src_y + "->" + available_moves[best_move].dst_x + "," + available_moves[best_move].dst_y + " (" + max + ")");
	move(available_moves[best_move].src_x, available_moves[best_move].src_y, available_moves[best_move].dst_x, available_moves[best_move].dst_y);
	pos.length = 0;
}

function get_available_moves(pos, human) {
	var moves = new Array();
	moves.length = 0;
	var src_x = 0;
	var src_y = 0;
	for (var x = 0; x < window.grid_width; x++) {
		for (var y = 0; y < window.grid_height; y++) {
			if (pos[x][y] == "") continue;
			if (window.pieces[pos[x][y]].human == human && window.pieces[pos[x][y]].active) {
				src_x = window.pieces[pos[x][y]].x;
				src_y = window.pieces[pos[x][y]].y;
				for (var i = src_x - 1; i <= src_x + 1; i++) {
					for (var j = src_y - 1; j <= src_y + 1; j++) {
						if (is_legal(src_x, src_y, i, j)) {
							moves.push({src_x: src_x, src_y: src_y, dst_x: i, dst_y: j});
						}
					}
				}
			}
		}
	}
	return moves;
}

function display_quote(x, y) {
	name = window.grid[x][y];
	nr = Math.floor(Math.random() * quotes[name].length);
	// get coordinates
	var parent_div = document.getElementById(x + "_" + y);
	var offsets = parent_div.getBoundingClientRect();
	var x_pos = offsets.x;
	var y_pos = offsets.y;
	// position div
	iDiv = document.getElementById("quote");
	iDiv.position = "absolute";
	iDiv.style.left = x_pos + 'px';
	iDiv.style.top = y_pos + tile_height / 2 + 'px';
	iDiv.innerHTML = "<b>" + quotes[name][nr] + "</b>";
	iDiv.style.display = "inline-block";
	setTimeout(function() {
		document.getElementById("quote").style.display = "none";
	}, 3000);
}

function evaluate_position(pos, human) {
	//evaluate pieces
	var material = 0;
	var diff = 0;
	for (var x = 0; x < window.grid_width; x++) {
		for (var y = 0; y < window.grid_height; y++) {
			if (pos[x][y] == "") continue;
			switch (window.pieces[pos[x][y]].type) {
				case "king":
					diff = 2;
					break;
				case "bishop":
					diff = 1;
					break;
				case "crazy":
					diff = 0.5;
					break;
			}
			if (window.pieces[pos[x][y]].human) material -= diff;
			else material += diff;
		}
	}
	// evaluate king safety
	var king_x = -1;
	var king_y = -1;
		for (var x = 0; x < window.grid_width; x++) {
		for (var y = 0; y < window.grid_height; y++) {
			if (pos[x][y] != "" && window.pieces[pos[x][y]].type == "king" && !window.pieces[pos[x][y]].human) {
				king_x = x;
				king_y = y;
				break;
			}
		}
	}
	if (king_x == -1) return -99;
	var king_safety = 4;
	var distance = 0;
	for (var x = 0; x < window.grid_width; x++) {
		for (var y = 0; y < window.grid_height; y++) {
			if (pos[x][y] != "" && window.pieces[pos[x][y]].human) {
				distance = Math.abs(x - king_x) + Math.abs(y - king_y);
				if (distance < king_safety) king_safety = distance;
			}
		}
	}
	return material + king_safety;
}
