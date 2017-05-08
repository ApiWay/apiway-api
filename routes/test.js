var Promise = require('promise');

a().then(b).then(c)
function a() {
  return new Promise((resolve, reject) => {
    console.log("a")
    // resolve(1)
  })
}
function b() {
  return new Promise((resolve, reject) => {
      console.log("b")
      // resolve(2)
})
}
function c() {
  return new Promise((resolve, reject) => {
      wonsole.log("c")
      resolve(3)
})
}
