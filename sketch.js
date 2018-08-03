let model;

function setup() {
	init();
	pixelDensity(1);
	createCanvas(280, 280);
	background(255);
}

async function init(){
	model = await tf.loadModel('classifier/model.json');
}

function mouseDragged(){

	//Draw the line in the canvas
	if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0){
		stroke(0);
		strokeWeight(15);
		line(pmouseX, pmouseY, mouseX, mouseY);
	}
}

function preProcesingImage(){
	//Get the margin of the digit area
	
	loadPixels();
	let xmin = width - 1;
	let xmax = 0;
	let ymin = height - 1;
	let ymax = 0;

	for (let i = 0; i < width; i++){
	for (let j = 0; j < height; j++){
		let index = (i * width + j) * 4;

		let y = floor(index / 4 / width);
		let x = ((index / 4) % width);

		if (pixels[index] < 255 || pixels[index + 1] < 255 || pixels[index + 2] < 255){
			xmin = Math.min( xmin, x );
			xmax = Math.max( xmax, x );
			ymin = Math.min( ymin, y );
			ymax = Math.max( ymax, y );
		}

		}
	}

	updatePixels();

	const cropWidth = xmax - xmin;
	const cropHeight = (ymax - ymin);

	let canvasImage = get(xmin -10 , ymin - 10, cropWidth + 20, cropHeight + 20);


	canvasImage.loadPixels();

	//Revert color for matching the trining data
	for ( var i = 0; i < canvasImage.width * canvasImage.height; i++ )
	{
		canvasImage.pixels[i * 4] = 255 - canvasImage.pixels[i * 4];
		canvasImage.pixels[i * 4 + 1] = 255 - canvasImage.pixels[i * 4 + 1];
		canvasImage.pixels[i * 4 + 2] = 255 - canvasImage.pixels[i * 4 + 2];

	}
	
	canvasImage.updatePixels();

	//Center the Image 28x28
	var xOffset = 0;
	var yOffset = 0;
	var xScale = 1;
	var yScale = 1;
	const padding = 1;
	let w = canvasImage.width;
	let h = canvasImage.height;
	let scaledx = 28;
	let scaledy = 28;

	if ( w > h )
	{
		yOffset = ( scaledx / ( w + 2 * padding) ) * ( w - h ) / 2 + padding;
		yScale = h / w;

		xOffset = padding;

	}
	else if ( h > w )
	{
		xOffset = ( scaledy / h ) * ( h - w ) / 2 + padding;
		xScale = w / h;

		yOffset = padding;
	}

	image(canvasImage, xOffset, yOffset, scaledx * xScale - 2 * padding, scaledy * yScale - 2 * padding);
	let resizeImage = get(0,0, 28, 28);
	// image(resizeImage, 0, 0, 28,28);

	resizeImage.loadPixels();
	let pixelsResizeImage = [];
	for (let i = 0; i < resizeImage.width * resizeImage.height; i++){
		pixelsResizeImage[i] = (resizeImage.pixels[i * 4]) / 255.0;		
	}
	resizeImage.updatePixels();

	return pixelsResizeImage;
}


function guess() {
	let pixelsImg = preProcesingImage();
	tf.tidy(() => {
		const inputTensor = tf.tensor(pixelsImg, [1,28,28,1], "float32");
		// model.predict(input).print();
		pred = model.predict(inputTensor).argMax(1).toString();
		var num = pred.match(/\d/g);
		document.getElementById("predict").innerHTML = "Look like a <strong>" + num + "</strong>"
	});

}

function clearCanvas(){
	background(255);
	document.getElementById("predict").innerHTML = "";
}


