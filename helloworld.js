var level = 1;
var shirt = "pinkArgyleSweater";


var HelloWorld = function(x, y, id, params) {
this.x = x;
this.y = y;
this.id = id;
this.message = "Hello, World!";
collideable(this);
inputHook(this);
this.step = function() {
this.x += 1;
};

this.anotherFunction = function(amt) {
this.x -= amt;
};

this.onCollision = function(other) {
if (other instanceof AnObject) {
this.x += 100;
}
else if (other instanceof AnotherObject) {
this.y += 100;
}
else if (other instanceof AThirdObject) {
destroyInstance(this);
}
else if (other instanceof GoodMeasure) {
destroyInstance(this);
}

};

this.handleInput = function(input) {
if (getInputType(input) == "keydown") {
if (getKeyPressed(input) == "UP") {
y -= 2;
}

}

if (getInputType(input) == "keyup") {
if (getKeyPressed(input) == "SPACE") {
x = 10;
}

}

if (getInputType(input) == "mousedown") {
alert('hi!');
}

if (getInputType(input) == "mouseup") {
alert('hola');
}


};


};

