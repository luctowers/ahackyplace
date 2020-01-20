// Assembles pushed items that appear in a given timespan and passes them as an array to a callback 
class WindowBatch {

  // time window is in milliseconds
  constructor(timeWindow, callback) {
    this.timeWindow = timeWindow;
    this.callback = callback;
    this.batch = [];
  }

  push(item) {
    // add to batch
    this.batch.push(item);

    // if bacth length is not one, a batch is in progress and a timeout has already been set
    if (this.batch.length != 1)
      return;

    // if execution reaches this point, this is the beginning of a new time-window/batch
    // set a timeout that will fire the callback after the window had elapsed
    var self = this;
    this.timeout = setTimeout(() => {
      self.callback(self.batch);
      self.batch = []; // new batch
    }, this.timeWindow);
  }

  cancel() {
    if (typeof this.timeout === undefined)
      return;
    clearTimeout(this.timeout);
    delete this.timeout;
    this.batch = [];
  }
  
}

module.exports = WindowBatch;
