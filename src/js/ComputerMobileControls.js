/*
SkyFox Team Controller.
On Desktop computer version we use THREE.FlyControls.
On Mobile phones we using Our Controls System.

IN: 
json_params = {
	Camera: THREE.Camera
};
*/
var THREEx = THREEx || {};
THREEx.ComputerMobileControls = function (json_params)
{
	if(json_params)
	{
		if(json_params.Camera)
			this.Camera = json_params.Camera;
		else
			throw new Error("We have no Camera!");
		
		if(json_params.MovingSpeed)
			this.MovingSpeed = json_params.MovingSpeed;
		else
			this.MovingSpeed = 100;

		if(json_params.RotationSpeed)
			this.RotationSpeed = json_params.RotationSpeed;
		else
			this.RotationSpeed = 30;			
	}
	this.touchUpdate = this.touchUpdate.bind(this);

	this.OrientationParameters = {
		alpha: 0,
		beta: 0,
		gamma: 0,
		deviceMotionInterval: 0,
		
		touchRotRadX: 0,
		touchRotRadY: 0,
		touchDeltaTime: 0,
		
		shakeTimer: 0,
		shakeTimerStep: 0.1
	};

	this.DEVICE_TYPES = {
		DESKTOP: 0,
		MOBILE: 1
	};

 	var testExp = new RegExp('Android|webOS|iPhone|iPad|' +
    		       'BlackBerry|Windows Phone|'  +
    		       'Opera Mini|IEMobile|Mobile' , 
    		      'i');
  
    if (testExp.test(navigator.userAgent)){
    	this.DeviceType = this.DEVICE_TYPES.MOBILE;
    }else{
    	this.DeviceType = this.DEVICE_TYPES.DESKTOP;
    }


	this.AccelerometerControlButton = document.createElement("button");
	this.AccelerometerControlButton.setAttribute("id", "AccelerometerControlButton");
    this.AccelerometerControlButton.className = "AccelerometerControlButton";
    // document.body.appendChild(this.AccelerometerControlButton);

	this.TouchControlButton = document.createElement("button");
	this.TouchControlButton.setAttribute("id", "TouchControlButton");
    this.TouchControlButton.className = "TouchControlButton";
    // document.body.appendChild(this.TouchControlButton);

	this.AccelerometerControlButton.addEventListener("click", function () {
		this.TouchControlButton.style.visibility = "visible";
		this.AccelerometerControlButton.style.visibility = "hidden";
		this.RotateHammer.enable = false;
		this.update = this.accelerometerUpdate;
	}.bind(this));

	this.TouchControlButton.addEventListener("click", function () {
		this.TouchControlButton.style.visibility = "hidden";
		this.AccelerometerControlButton.style.visibility = "visible";
		this.RotateHammer.enable = true;
		this.update = this.touchUpdate;
	}.bind(this));

	this.FrontMovingButton = document.createElement("div");
	this.FrontMovingButton.setAttribute("id", "FrontMovingButton");
    this.FrontMovingButton.className = "FrontMovingButton";
	// document.body.appendChild(this.FrontMovingButton);

	this.FrontMovingButton.onmousedown = function (event)
	{
	 	this.FrontMovingOn = true;
	}.bind(this);

	this.FrontMovingButton.ontouchstart = function (event)
	{
	 	this.FrontMovingOn = true;
	}.bind(this);

	this.FrontMovingButton.onmouseup = function (event)
	{
	 	this.FrontMovingOn = false;
	}.bind(this);

	this.FrontMovingButton.ontouchend = function (event)
	{
	 	this.FrontMovingOn = false;
	}.bind(this);

	this.BackMovingButton = document.createElement("div");
	this.BackMovingButton.setAttribute("id", "BackMovingButton");
    this.BackMovingButton.className = "BackMovingButton";
	// document.body.appendChild(this.BackMovingButton);

	this.BackMovingButton.onmousedown = function (event)
	{
	 	this.BackMovingOn = true;
	}.bind(this);

	this.BackMovingButton.ontouchstart = function (event)
	{
	 	this.BackMovingOn = true;
	}.bind(this);

	this.BackMovingButton.onmouseup = function (event)
	{
	 	this.BackMovingOn = false;
	}.bind(this);

	this.BackMovingButton.ontouchend = function (event)
	{
	 	this.BackMovingOn = false;
	}.bind(this);



	//mouse/touch controller
	this.RotateHammer = new Hammer(document.body);
	this.RotateHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
	this.RotateHammer.on("pan", function (event) {

		this.OrientationParameters.touchRotRadX = THREE.Math.degToRad(event.deltaX/this.RotationSpeed);
		this.OrientationParameters.touchRotRadY = THREE.Math.degToRad(event.deltaY/this.RotationSpeed);
		this.OrientationParameters.touchDeltaTime = event.deltaTime;

	}.bind(this));


	this.AccelerometerControls = new THREE.DeviceOrientationControls(this.Camera);
	this.update = this.accelerometerUpdate;

!
	if (window.DeviceMotionEvent !== undefined || this.DeviceType === this.DEVICE_TYPES.MOBILE) {
		document.body.appendChild(this.BackMovingButton);
	    document.body.appendChild(this.AccelerometerControlButton);
	    document.body.appendChild(this.TouchControlButton);
		document.body.appendChild(this.FrontMovingButton);

		this.RotateHammer.enable = false;
		this.update = this.accelerometerUpdate;

		window.addEventListener("devicemotion", this.onDeviceMotion.bind(this));			
		window.addEventListener("deviceorientation", this.onDeviceOrientation.bind(this));					
	} else {
		if(document.body.contains(this.AccelerometerControlButton))
			document.body.removeChild(this.AccelerometerControlButton);
		if(document.body.contains(this.TouchControlButton))
			document.body.removeChild(this.TouchControlButton);
		this.RotateHammer.enable = true;
		this.update = this.touchUpdate;
	}

};

THREEx.ComputerMobileControls.prototype.accelerometerUpdate  = function (delta)
{
	this.AccelerometerControls.update();
	
	if(this.FrontMovingOn)
	{
		this.AntiVec = this.Camera.getWorldDirection();
		this.AntiVec.normalize();
		this.AntiVec.multiplyScalar(this.MovingSpeed);
		this.Camera.position.add(this.AntiVec);				
	}

	if(this.BackMovingOn)
	{
		this.AntiVec = this.Camera.getWorldDirection();
		this.AntiVec.normalize();
		this.AntiVec.multiplyScalar(-this.MovingSpeed);
		this.Camera.position.add(this.AntiVec);				
	}
};

THREEx.ComputerMobileControls.prototype.touchUpdate = function(delta)
{

	this.Camera.rotation.y -= this.OrientationParameters.touchRotRadX*delta;
	this.Camera.rotation.x -= this.OrientationParameters.touchRotRadY*delta;	


	if(Math.abs(this.OrientationParameters.touchRotRadX) > 0.005)
	{
		this.OrientationParameters.touchRotRadX -= this.OrientationParameters.touchRotRadX/10;			
	} else if(this.OrientationParameters.touchRotRadX)
		this.OrientationParameters.touchRotRadX = 0;

	if(Math.abs(this.OrientationParameters.touchRotRadY) > 0.005)
	{
		this.OrientationParameters.touchRotRadY -= this.OrientationParameters.touchRotRadY/10;			
	} else if(this.OrientationParameters.touchRotRadY)
		this.OrientationParameters.touchRotRadY = 0;	

	if(this.FrontMovingOn)
	{
		this.AntiVec = this.Camera.getWorldDirection();
		this.AntiVec.normalize();
		this.AntiVec.multiplyScalar(this.MovingSpeed);
		this.Camera.position.add(this.AntiVec);				
	}

	if(this.BackMovingOn)
	{
		this.AntiVec = this.Camera.getWorldDirection();
		this.AntiVec.normalize();
		this.AntiVec.multiplyScalar(-this.MovingSpeed);
		this.Camera.position.add(this.AntiVec);				
	}
};


// Наш обработчик ускорения
THREEx.ComputerMobileControls.prototype.onDeviceMotion = function (event) {

	this.OrientationParameters.alpha = event.rotationRate.alpha;
	this.OrientationParameters.beta = -event.rotationRate.beta;
	this.OrientationParameters.deviceMotionInterval = event.interval;

	this.OrientationParameters.phi = 0;
	this.OrientationParameters.theta = 0;
};

// Наш обработчик ускорения
THREEx.ComputerMobileControls.prototype.onDeviceOrientation = function (event) {

	this.OrientationParameters.alpha = event.alpha;
	this.OrientationParameters.beta = -event.beta;
	this.OrientationParameters.deviceMotionInterval = event.interval;

	this.OrientationParameters.phi = 0;
	this.OrientationParameters.theta = 0;
};