const PENDING = 'PENGDING'
const REJECTED = 'REJECTED'
const FULFILLED = 'fulfilled'

// [[Resolve]](promise, x)使用resolvePromise函数实现
// x为onFulfilled或onRejected函数的return值
// promise2为该then里创建的primise，将在then函数执行完return出去
function resolvePromise(promise2, x, resolve, reject) {
    let self = this;
    //PromiseA+ 2.3.1
    if (promise2 === x) {
        reject(new TypeError('Chaining cycle'));
    }
    if (x && typeof x === 'object' || typeof x === 'function') {
        let used; //PromiseA+2.3.3.3.3 只能调用一次
        try {
            let then = x.then;
            if (typeof then === 'function') {
                //PromiseA+2.3.3
                then.call(x, (y) => {
                    //PromiseA+2.3.3.1
                    if (used) return;
                    used = true;
                    resolvePromise(promise2, y, resolve, reject);
                }, (r) => {
                    //PromiseA+2.3.3.2
                    if (used) return;
                    used = true;
                    reject(r);
                });

            }else{
                //PromiseA+2.3.3.4
                if (used) return;
                used = true;
                resolve(x);
            }
        } catch (e) {
            //PromiseA+ 2.3.3.2
            if (used) return;
            used = true;
            reject(e);
        }
    } else {
        //PromiseA+ 2.3.3.4
        resolve(x);
    }
}
class MyPromise{
    constructor(executor){
        const self = this;
        self.status = PENDING;
        self.onFulfilled = [];
        self.onRejected = [];
        // Promise A+ 2.1
    function resolve(value){
        if (self.status === PENDING) {
            self.status = FULFILLED;
            self.value = value;
            self.onFulfilled.forEach((fn) => fn());
          }
    };
    function reject(reason) {
        if (self.status === PENDING) {
            self.status = REJECTED;
            self.reason = reason;
            self.onRejected.forEach((fn) => fn());
          }
      };
      try{
        executor(resolve,reject);
      }catch(err){
          reject(err)
      }
    }

    then(onFulfilled,onRejected){
        //PromiseA+ 2.2.1 / PromiseA+ 2.2.5 / PromiseA+ 2.2.7.3 / PromiseA+ 2.2.7.4
        onFulfilled = typeof onFulfilled === 'function'?onFulfilled:(value)=>value;
        onRejected = typeof onRejected === 'function'?onRejected:(reason)=>{throw reason};
        let self = this;
        //PromiseA+ 2.2.7
        let promise2 = new Promise((resolve,reject)=>{
            if (self.status === FULFILLED) {
                 //PromiseA+ 2.2.2
                //PromiseA+ 2.2.4 --- setTimeout
                setTimeout(() => {
                    try {
                        //PromiseA+ 2.2.7.1
                        let x = onFulfilled(self.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        //PromiseA+ 2.2.7.2
                        reject(e);
                    }
                });
            }
            else if (self.status === REJECTED) {
                //PromiseA+ 2.2.3
                setTimeout(() => {
                    try {
                        let x = onRejected(self.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                });
            }
            else if (self.status === PENDING) {
                self.onFulfilled.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(self.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
                self.onRejected.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(self.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            }
        })
        return promise2;
    }

    reject(){

    }
}

module.exports = MyPromise