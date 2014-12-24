function Animator(animFunction) {
  if (!animFunction) {
    throw new Error("Argument Error: Must pass an animFunction");
  }
  this.val = 0;
  this.isPlaying = false;
  this.playDirection = 1;
  this.animFunction = animFunction;
  this.easingFunction = function(val) { return val; };
  this.duration = 1000;
  this.lastFrameTimestamp = null;
  this.pendingPromise = null;
}

Animator.lerp = function(val, valMin, valMax, targetMin, targetMax) {
  return targetMin + (targetMax - targetMin) * ((val - valMin) / (valMax - valMin));
};

Animator.partitionAnimation = function(val, min, max) {
  return Animator.lerp(Math.max(min, Math.min(val, max)), min, max, 0, 1);
};

Animator.prototype.playForward = function() {
  if (this.isPlaying) {
    if (this.playDirection == 1) {
      return this.pendingPromise;
    } else {
      this.pendingPromiseReject();
    }
  } else if (this.val == 1.0) {
    return Promise.resolve();
  }
  this.isPlaying = true;
  this.playDirection = 1;
  this.lastFrameTimestamp = null;
  this.newPromise();
  this.nextIteration();
  return this.pendingPromise;
};

Animator.prototype.playBackwards = function() {
  if (this.isPlaying) {
    if (this.playDirection == -1) {
      return this.pendingPromise;
    } else {
      this.pendingPromiseReject();
    }
  } else if (this.val == 0.0) {
    return Promise.resolve();
  }
  this.isPlaying = true;
  this.playDirection = -1;
  this.lastFrameTimestamp = null;
  this.newPromise();
  this.nextIteration();
  return this.pendingPromise;
};

Animator.prototype.stop = function() {
  this.isPlaying = false;
  this.lastFrameTimestamp = null;
  if (this.pendingPromise) {
    this.pendingPromiseReject();
  }
};

Animator.prototype.setDuration = function(duration) {
  this.duration = duration;
};

Animator.prototype.setEasing = function(easingFunc) {
  this.easingFunction = easingFunc;
};

Animator.prototype.nextIteration = function() {
  var self = this;
  if (this.isPlaying && this.animFunction) {
    if (this.lastFrameTimestamp !== null) {
      var currentFrameTimestamp = Date.now();
      var frameDelta = currentFrameTimestamp - this.lastFrameTimestamp;
      this.val += frameDelta / this.duration * this.playDirection;
    }

    if (this.playDirection == -1 && this.val <= 0) {
      this.val = 0;
      this.isPlaying = false;
      this.pendingPromiseResolve();
      this.pendingPromise = null;
      this.lastFrameTimestamp = null;
    } else if (this.playDirection == 1 && this.val >= 1.0) {
      this.val = 1;
      this.isPlaying = false;
      this.pendingPromiseResolve();
      this.pendingPromise = null;
      this.lastFrameTimestamp = null;
    }
    this.setVal(this.val);

    if (this.isPlaying) {
      this.lastFrameTimestamp = Date.now();
      requestAnimationFrame(function() {
        self.nextIteration();
      });
    }
  }
};

Animator.prototype.setVal = function(val) {
  this.val = val;
  this.animFunction(this.ease(this.val));
};

Animator.prototype.ease = function(val) {
  return this.easingFunction(val);
};

Animator.prototype.newPromise = function() {
  var self = this;
  this.pendingPromise = new Promise(function(resolve, reject) {
    self.pendingPromiseResolve = resolve;
    self.pendingPromiseReject = reject;
  });
};
