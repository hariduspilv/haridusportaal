"use strict";

const fs = require("fs");
const path = require("path");
const gaze = require("gaze");
const mkdirp = require("mkdirp");

class WebpackPlugin {
  constructor(options) {
    const opts = Object(options);
    const watch = Object(opts.watch);
    if ("string" !== typeof watch.pattern) {
      throw new TypeError("Undefined `watch.pattern`!");
    }
    this.baseOptions = {
      watch: {
        cwd: watch.cwd || process.cwd(),
        pattern: watch.pattern,
      },
    };
    this.isWatching = false;
    this.isWorking = false;
    this.delayTimer = null;
    this.files = {};
    this.writeFiles = this.writeFiles.bind(this);
    this.addFile = this.addFile.bind(this);
    this.exec = this.exec.bind(this);
  }

  main() {
    throw new Error("Unimplemented method!");
  }

  exec(cb) {
    if (this.isWorking) {
      "function" === typeof cb && cb();
      return;
    }
    this.isWorking = true;
    const context = this;
    Promise.resolve(this.main())
      .then(this.writeFiles)
      .then(function () {
        context.isWorking = false;
        "function" === typeof cb && cb();
      });
  }

  addFile(filePath, contents) {
    this.files[filePath] = contents;
  }

  writeFilesSync() {
    const files = this.files;
    Object.keys(files).reduce(function (fileDirs, filePath) {
      const fileDir = path.resolve(path.parse(filePath).dir);
      if (-1 === fileDirs.indexOf(fileDir)) {
        fileDirs.push(fileDir);
        mkdirp.sync(fileDir);
      }
      fs.writeFileSync(filePath, files[filePath]);
      const time = Number(new Date()) / 1000 - 10;
      fs.utimesSync(filePath, time, time);
      delete files[filePath];
      return fileDirs;
    }, []);
  };

  async writeFiles() {
    const files = this.files;
    const filePaths = Object.keys(files);
    if (!filePaths.length) {
      return Promise.resolve();
    }
    const fileDirs = filePaths.reduce(function (fileDirs, filePath) {
      const fileDir = path.resolve(path.parse(filePath).dir);
      if (-1 === fileDirs.indexOf(fileDir)) {
        fileDirs.push(fileDir);
      }
      return fileDirs;
    }, []);
    return Promise.all(
      fileDirs.map((fileDir) => mkdirp(fileDir))
    ).then(function () {
      return Promise.all(
        filePaths.map(function (filePath) {
          return new Promise(function (resolve, reject) {
            return fs.writeFile(filePath, files[filePath], function (err) {
              if (err) {
                return reject(err);
              }
              const time = Number(new Date()) / 1000 - 10000;
              return fs.utimes(filePath, time, time, function (err) {
                return err ? reject(err) : resolve();
              });
            });
          }).then(function () {
            delete files[filePath];
          });
        })
      );
    });
  }

  setWatching() {
    if (this.isWatching) {
      return Promise.resolve(false);
    }
    const context = this;
    const watchOption = this.baseOptions.watch;
    Object.defineProperty(this, "isWatching", {
      value: true,
      enumerable: true,
    });
    return new Promise(function (resolve, reject) {
      return gaze(
        watchOption.pattern,
        { cwd: watchOption.cwd },
        function (err, watcher) {
          if (err) {
            return reject(err);
          }
          watcher.on("all", function () {
            if (!context.isWorking) {
              clearTimeout(context.delayTimer);
              context.delayTimer = setTimeout(context.exec, 20);
            }
          });
          return resolve(true);
        }
      );
    });
  }

  apply(compiler) {
    const context = this;

    function run(_, cb) {
      context.exec(cb);
    }

    function watchRun(_, cb) {
      context.setWatching().then(function (isInit) {
        if (isInit) {
          return context.exec(cb);
        }
        return cb();
      });
    }

    if (compiler.hooks && compiler.hooks.run && compiler.hooks.run.tapAsync) {
      compiler.hooks.run.tapAsync("run-plugin-webpack", run);
      compiler.hooks.watchRun.tapAsync("run-plugin-webpack", watchRun);
    } else {
      compiler.plugin("run", run);
      compiler.plugin("watch-run", watchRun);
    }
  }
}

module.exports = WebpackPlugin;
