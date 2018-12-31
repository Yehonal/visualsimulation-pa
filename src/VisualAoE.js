/**
 * Documentation in the source code. Private methods are defined
 * as local functions, while exposed ones are members of the returned object tg.
 * @param {Object} canvas jQuery DOM object for the canvas element
 * @param {Object} opts   Settings array, see default values and explanation below
 */
var VisualAoE = function (canvas, opts) {
    var tg = {};

	// Default settings
	tg.settings = {
		lossQuantity: 0.03, // Width ( Mass ) loss per cycle
		minSleep: 10, // Min sleep time (For the animation)
		loopLoss: 1, // % width maintained for loops
		mainLoss: 1, // % width maintained after looping
		time: 0.3, // time / time
		exceptionProb: 0.4, // Chance of not starting a new loop ( Exception (?) )
		colorful: false, // Use colors for new recursions
		fastMode: true, // Fast growth mode
		fadeOut: false, // Fade slowly to black
		fadeAmount: 0.05, // How much per iteration
		runSpawn: true, // Automatically create recursions
		//spawnInterval: 250, // Spawn interval in ms
		fadeInterval: 250, // Fade interval in ms
		initialMass: 1, // Initial loop width
		indicateNewLoop: true, // Display a visual indicator when a new loop is born
		fitScreen: true, // Resize canvas to fit screen,
		infinite: false,
		cleanNow: false,
		stringColor: '#ffffff',
		bgColor: [0, 0, 0]
	};

	tg.settings = $.extend(tg.settings, opts);

	// Initialize the canvas
	var canvas = {
		$el: canvas,
		ctx: canvas[0].getContext("2d"),
		WIDTH: canvas.width(),
		HEIGHT: canvas.height(),
		canvasMinX: canvas.offset().left,
		canvasMaxX: canvas.canvasMinX + canvas.WIDTH,
		canvasMinY: canvas.offset().top,
		canvasMaxY: canvas.canvasMinY + canvas.HEIGHT
	};

	// Generation intervals
	var intervals = {
		generation: null,
		fading: null
	}

	tg.start = function () {
		// Clear intervals
		tg.stop();
		// Check runSpawn
		if (tg.settings.runSpawn) {
			loop(canvas.WIDTH / 2, canvas.HEIGHT, 0, -3, tg.settings.initialMass*10, 30, 0, tg.settings.stringColor);
		}
		// Check autoFade
		if (tg.settings.fadeOut) {
			intervals.fading = setInterval(function () {
				fade()
			}, tg.settings.fadeInterval);
		}
	};

	/**
	 * Stop generating recursions
	 * @return {void}
	 */
	tg.stop = function () {
		clearInterval(intervals.generation);
		clearInterval(intervals.fading);
		clear();
	};

	/**
	 * Recursive function that generates the loops. This is the important part of the
	 * generator. At any given point it continues in a logical manner, creating something similar
	 * to a tree (at least using the default settings)
	 * Appropriate tweaking of the settings can produce quite interesting results.
	 * @param  {float} x           Current location, x coordinate
	 * @param  {float} y           Current location, y coordinate
	 * @param  {float} dx          Variation of the x coordinate, indicates where it will move
	 * @param  {float} dy          Variation of the y coordinate, indicates where it will move
	 * @param  {float} w           Current width
	 * @param  {float} growthRate  This loop's growth rate
	 * @param  {int} lifetime      Cycles that have already happened
	 * @param  {String} stringColor string color
	 * @return {void}
	 */
	function loop(x, y, dx, dy, w, growthRate, lifetime, stringColor) {
		canvas.ctx.lineWidth = w - lifetime * tg.settings.lossQuantity;
		canvas.ctx.beginPath();
		canvas.ctx.moveTo(x, y);
		if (tg.settings.fastMode) growthRate *= 0.5;
		// Calculate new coords
		x = x + dx;
		y = y + dy;
		// Change dir
		dx = dx + Math.sin(Math.random() + lifetime) * tg.settings.time;
		dy = dy + Math.cos(Math.random() + lifetime) * tg.settings.time;
		// Check if loops are getting too low
		if (!tg.settings.infinite && w < 6 && y > canvas.HEIGHT - Math.random() * (0.3 * canvas.HEIGHT)) w = w * 0.8;
		// Draw the next segment of the loop
		canvas.ctx.strokeStyle = stringColor || tg.settings.stringColor;
		canvas.ctx.lineTo(x, y);
		canvas.ctx.stroke();
		// Generate new loops
		// they should spawn after a certain lifetime has been met, although depending on the width
		if (lifetime > 5 * w + Math.random() * 100 && Math.random() > tg.settings.exceptionProb) {
			setTimeout(function () {
				// Indicate the birth of a new loop
				if (tg.settings.indicateNewLoop) {
					circle(x, y, w, 'rgba(255,0,0,0.4)');
				}
				loop(x, y, 2 * Math.sin(Math.random() + lifetime), 2 * Math.cos(Math.random() + lifetime), (w - lifetime * tg.settings.lossQuantity) * tg.settings.loopLoss, growthRate + Math.random() * 100, 0, stringColor);
				// When it loops, it looses a bit of width
				w *= tg.settings.mainLoss;
			}, 2 * growthRate * Math.random() + tg.settings.minSleep);
		}
		// Continue the loop
		if (tg.settings.infinite || (w - lifetime * tg.settings.lossQuantity >= 1)) setTimeout(function () {
			loop(x, y, dx, dy, w, growthRate, ++lifetime, stringColor);
		}, growthRate);
	}

	// -------------------------------//
	//       Internal functions       //
	// -------------------------------//

	// Clear the canvas
	function clear() {
		canvas.ctx.clearRect(0, 0, canvas.WIDTH, canvas.HEIGHT);
	}

	/**
	 * Draw a circle
	 * @param  {int} 	x     Center x coordinate
	 * @param  {int} 	y     Center y coordinate
	 * @param  {int} 	rad   Radius
	 * @param  {String} color HTML color
	 * @return {void}
	 */
	function circle(x, y, rad, color) {
		// Circle
		canvas.ctx.lineWidth = 1;
		canvas.ctx.strokeStyle = color;
		canvas.ctx.beginPath();
		canvas.ctx.arc(x, y, rad, 0, Math.PI * 2, true);
		canvas.ctx.closePath();
		canvas.ctx.stroke();
	}

	/**
	 * Fade the canvas
	 * @return {void}
	 */
	function fade() {
		if (!tg.settings.fadeOut) return true;
		canvas.ctx.fillStyle = "rgba(" + tg.settings.bgColor[0] + "," + tg.settings.bgColor[1] + "," + tg.settings.bgColor[2] + "," + tg.settings.fadeAmount + ")";
		canvas.ctx.fillRect(0, 0, canvas.WIDTH, canvas.HEIGHT);
	}

	/**
	 * Resize the canvas to the window size
	 * @param  {Object} e Event object
	 * @return {void}
	 */
	function resizeCanvas(e) {
		canvas.WIDTH = window.innerWidth;
		canvas.HEIGHT = window.innerHeight;

		canvas.$el.attr('width', canvas.WIDTH);
		canvas.$el.attr('height', canvas.HEIGHT);
	}

	/**
	 * Return a new color, depending on the colorful setting
	 * @return {String} HTML color
	 */
	function newColor() {
		if (!tg.settings.colorful) return '#fff';
		return '#' + Math.round(0xffffff * Math.random()).toString(16);
	}

	/**
	 * Resize the canvas to fit the screen
	 * @return {void}
	 */
	tg.resizeCanvas = function () {
		canvas.WIDTH = window.innerWidth;
		canvas.HEIGHT = window.innerHeight;

		canvas.$el.attr('width', canvas.WIDTH);
		canvas.$el.attr('height', canvas.HEIGHT);
	}

	if (tg.settings.fitScreen) tg.resizeCanvas();

	return tg;

};