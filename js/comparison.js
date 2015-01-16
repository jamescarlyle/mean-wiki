angular.module('comparison', [])
// service for Items
.service('Comparison', function() {
	this.compare = function(localItem, remoteItem) {
		// attribution to http://harmen.no-ip.org/javascripts/diff/ via stackoverflow.com - unfortunately the domain has gone away and there is no license notice
		var table = '';

		function make_row(x, y, type, text) {
			var row = '<tr';
			if (type == '+') row += ' class="success"';
			else if (type == '-') row += ' class="danger"';
			row += '>';

			row += '<td>' + y + '</td>';
			row += '<td>' + x + '</td>';
			if (type == ' ') {
				row += '<td>' + type + ' ' + text + '</td>';
				row += '<td>' + type + ' ' + text + '</td>';
			} else if (type == '+') {
				row += '<td>' + ' ' + '</td>';
				row += '<td>' + type + ' ' + text + '</td>';
			} else if (type == '-') {
				row += '<td>' + type + ' ' + text + '</td>';
				row += '<td>' + ' ' + '</td>';
			}

			row += '</tr>';
			table += row;
		}

		function get_diff(matrix, a1, a2, x, y) {
			if (x > 0 && y > 0 && a1[y - 1] === a2[x - 1]) {
				get_diff(matrix, a1, a2, x - 1, y - 1);
				make_row(x, y, ' ', a1[y - 1]);
			} else {
				if (x > 0 && (y === 0 || matrix[y][x - 1] >= matrix[y - 1][x])) {
					get_diff(matrix, a1, a2, x - 1, y);
					make_row(x, '', '+', a2[x - 1]);
				} else if (y > 0 && (x === 0 || matrix[y][x - 1] < matrix[y - 1][x])) {
					get_diff(matrix, a1, a2, x, y - 1);
					make_row('', y, '-', a1[y - 1]);
				} else {
					return;
				}
			}
		}

		function diff(a1, a2) {
			var matrix = new Array(a1.length + 1);
			var x, y;

			for (y = 0; y < matrix.length; y++) {
				matrix[y] = new Array(a2.length + 1);

				for (x = 0; x < matrix[y].length; x++) {
					matrix[y][x] = 0;
				}
			}

			for (y = 1; y < matrix.length; y++) {
				for (x = 1; x < matrix[y].length; x++) {
					if (a1[y - 1] === a2[x - 1]) {
						matrix[y][x] = 1 + matrix[y - 1][x - 1];
					} else {
						matrix[y][x] = Math.max(matrix[y - 1][x], matrix[y][x - 1]);
					}
				}
			}

			get_diff(matrix, a1, a2, x - 1, y - 1);
		}

		diff(remoteItem.content.split('\n'), localItem.content.split('\n'));
		return '<table class="table table-striped"><tr><td>remote number</td><td>local number</td><td>remote line</td><td>local line</td></tr>' 
		+ table + '</table>';
	}
	
})
;