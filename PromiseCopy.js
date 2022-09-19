const MyPromise = require('./lib/myPromise')

MyPromise.deferred = MyPromise.defer = function(){
    const dfd = {};
    dfd.promise = new MyPromise((resolve,reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject;
    })
    return dfd;
}

module.exports = MyPromise