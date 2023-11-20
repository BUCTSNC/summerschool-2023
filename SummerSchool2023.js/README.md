# JavaScript 入门（下）

## JavaScript 访问浏览器资源

在浏览器中运行的 JavaScript 可以对浏览器进行一定程度的控制，包括获取和改变 HTML 文档的内容，获取和改变浏览器窗口的属性，控制浏览器进行网络访问等。

在浏览器中调试 JavaScript 时，可以使用 F12 打开控制台

### window 对象（BOM）

在浏览器中，对窗口层面的访问是通过全局变量`window`实现的。于此同时，例如通过修改`window.location`属性实现导航：

```js
window.location = "https://www.baidu.com";
```

同时，`window`对象也扮演了浏览器 JavaScript 的“全局”角色，即`window`下的所有成员（属性、方法）都可以作为全局变量被访问到。例如：

```js
// 下面两行是等效的
window.location = "https://www.baidu.com";
location = "https://www.baidu.com";
// 又比如控制浏览器返回上一页
window.history.back();
history.back();
// 添加事件监听器
window.addEventListener("resize", () => {
  console.log("resized");
});
addEventListener("resize", () => {
  console.log("resized");
});
```

### document 对象（DOM）

对文档内容的动态修改（即 HTML 内容本身）是通过全局变量`document`（亦是`window.document`）来进行的。

以修改文档的标题（显示在窗口标题栏，设定于`<head><title></title></head>`中）为例：

```js
document.title = "SNC";
```

要对页面上具体的元素进行修改，可以使用`document`下的选择函数找到对应的元素。

```js
// 按ID查找
document.getElementById(id);
// 按类名查找
document.getElementsByClassName(className);
// 按元素名查找
document.getElementsByTagName(tagName);
// document.getElementsByXX方法返回的结果是HTMLCollection，使用for of语法可以遍历：
for (const element of htmlColl) {
  console.log(element);
}
// 此外还有其他方式可以遍历整个文档树，此处不多介绍。
```

获得元素对象后，可以直接读取和修改其中的内容：

```js
// 选择元素
const app = document.getElementById(id);
// 清空内容
app.innerHTML = "";
// 创建新的元素
const p = docuement.createElement("p");
// 设置标签内文字
p.innerText = "hello, world";
// 添加到页面上
app.appendChild(p);
// 此外还有其他的修改方式，此处不多介绍
```

### 事件监听器

通过在元素对象的`onXX`属性上赋值函数，或通过`addEventListener`方法添加事件监听函数，都可以在元素发生某个事件时进行对应的行为。

```js
function alertOnClick() {
  alert("Clicked");
}
// onclick方式，onxx属性的名称遵循HTML全小写规范
btn.onclick = alertOnClick;
// addEventListener方式
btn.addEventListener(alertOnClick);
```

事件发生时，通常意味着一些（用于描述事件的）数据产生，因此用来处理事件的函数是可以接受一个函数，用于处理事件的具体细节的。

```js
function calculatePow(event) {
  // 对多数元素而言，event.target就是事件发生所在的元素对象
  // 对input元素而言，其value属性是用户输入的文本内容
  const inputNumber = Number(event.target.value);
  if (Number.isNaN(inputNumber)) {
    para.innerText = "非法输入，请重试";
  } else {
    para.innerText = String(Math.pow(inputNumber, 2));
  }
}

inp.addEventListener("input", calculatePow);
```

## 事件、事件循环与事件驱动编程

### 两个例子

对绝大多数程序来说，指令是按照人所编写的代码顺序执行的，除非遇到分支语法，会导致部分代码被跳过；或是遇到循环结构，使得部分代码被反复执行。即代码执行到最后一句之后，程序就结束了。

但我们观察刚才例子中的 JavaScript 代码：

```js
// 获取元素对象
const inp = document.getElementById("inp");
const para = document.getElementById("para");
// 声明函数
function calculatePow(event) {
  const inputNumber = Number(event.target.value);
  if (Number.isNaN(inputNumber)) {
    para.innerText = "非法输入，请重试";
  } else {
    para.innerText = String(Math.pow(inputNumber, 2));
  }
}
// 绑定事件
inp.addEventListener("input", calculatePow);
```

理论上而言，执行完`inp.addEventListener`后，这个 JavaScript 程序就结束了，但是事实上我们不断修改`input`框中的值，`p`标签中的值亦随之变化，这就意味着函数`calculatePow`实际上仍在反复执行，这显然是某种循环结构的特点，但是在语法中并未体现。

我们再看另一个例子，是 JavaScript 中用于间隔一段时间执行指定代码的函数：`setInterval`，使用 Node.js 来运行：

```js
// interval.js
setInterval(() => {
  console.log("hello, world");
}, 5000);

console.log("Interval set");
```

类似的，从理论上来说，当程序输出`Interval set`时，这个 JavaScript 文件的执行就应该结束了，但实际上的输出是在显示`Interval set`之后，再反复输出`hello, world`字符串，而且程序不会自动结束。

结合上述两个例子，我们可以知道，JavaScript 文件中的代码执行完后，JavaScript 运行时进程不一定会立即结束，而是有可能进入到某种循环结构中——事件循环。

### 事件

不同于一般循环结构的特点，我们可以发现尽管上述两个例子中的代码表现出重复执行的特点，但他们的执行是有条件的：

- 对第一个例子，只有当**输入发生改变**时，函数才会被再次执行
- 对第二个例子，只有当**时间再次经过至少 5000 毫秒**时，函数才会被再次执行

这里当 XX 时中的 XX 即是事件。对于 JavaScript 而言，不同的场景下可能会有不同的事件，事件是具有外源性的，例如：

- 用户与 HTML 控件交互会发生交互事件（点击、聚焦、输入……），这些事件并不是由我们的代码造成的，而是用户操作产生的；
- 计时器会随着时间的推移而被触发，这种事件的发生的根本原因是系统时钟的值向前推移了，而非代码本身触发了事件
- （从数据流中）接收到数据，尽管再接收到数据之前必定执行了数据请求的代码，但接受数据事件本身是由数据的发送方产生的，例如通过`fetch`函数发起请求后，接收到数据的根本原因是服务器响应了数据

事件发生的时间具有不可预测性，是指从程序的角度来看，可能会发生的若干事件的顺序是不可知的，例如此时代码可能需要处理以下事件：

- 计时器 1 触发
- 计时器 2 触发
- 用户点击元素 1
- 用户点击元素 2
- 接收到数据

从程序的角度来看（程序内部并没有具有单位的时间概念，只有先后顺序），以上事件的顺序完全无法确定，因此也无法生成具有固定顺序的指令供 CPU 执行。因此，事件循环 EventLoop 机制需要循环检查事件是否发生，再将已发生事件的函数放入执行队列依次执行。

### 事件循环

我们在正式介绍事件循环之前，需要再次梳理一下 JavaScript 代码的执行方式。

首先，一切 JavaScript 代码（非交互式）的执行首先需要启动一个运行时环境，例如浏览器或 Node.js，随后由运行时程序载入一个 JavaScript 文件\*，称为主文件、入口文件或入口点 entrypoint，其作用类似于其他语言的`main`函数/方法。

> \*: 浏览器中的多个`script`标签（不带`type="module"`字段的）可以看作是自上而下连接成一个文件。

主文件自上而下执行，过程中也可能通过模块机制调用执行其他的 JavaScript 文件中的代码，并最终再次回到主文件，直至最后一个语句执行完成。

在此过程中，一些代码（例如上文提到的 onxx，addEventListener，setInterval，setTimeout 等）可能会向事件表 Event Table 中注册事件和对应的处理函数 handler（也可称为回调函数 callback）。当事件表不为空时，运行时就不会结束执行，而是进入事件循环。

事件循环机制会检查事件表中的事件是否发生，并将已经发生的事件对应的函数放入任务队列中执行。任务队列执行后，事件循环会再次重复该过程，直至事件表被清空。

对于只会发生一次的事件，例如`setTimeout`设置的延迟执行，当事件触发后，它就会从事件表中被移除；而其他的事件则不会自动被移除，除非在任务队列中的函数执行了解除注册的代码，例如`removeEventListener`，`el.onclick = null`。当然，任务队列中的函数也可以继续向事件表中注册新的事件和对应的函数。

> 网络上存在一些教程介绍事件循环中的宏任务与微任务之间的区别、执行顺序等内容，截止目前为止 ECMAScript 规范中并无定义，亦有可能随着执行引擎的变化而修改，具体实践中应该将不同事件的发生顺序看作是随机的，不应该强行预测。

![准备插图]()

### 事件驱动编程

可以看到，JavaScript 进行网页开发，很多时候都是去考虑如何进行用户交互，而用户交互中，用户的操作即是一系列事件。开发者的开发过程就是围绕这些事件去编写对应的函数以进行处理，这种编程模式即是事件驱动编程。

## 异步编程 Promise

显示情况下，我们确实需要一些事件按照一定的顺序发生，例如设计一个共享文件用的 Web 应用，访问它的主页时，服务端需要：

1. 确定共享目录下有哪些文件
2. 确定每个文件的类型、大小、创建日期和修改日期

这两个任务分别需要使用`readdir`函数和`stat`函数才能完成，而更进一步的，`stat`函数需要完整的文件路径才能调用，这意味着它必须在`readdir`函数获得结果后才能被调用。

```js
// 一个理想的调用过程是这样的：
try {
  const fileList = readdir(rootName);
  const fileStats = fileList.map((filename) => stat(`${rootName}/${filename}`));
  console.log(fileStats);
} catch (err) {
  console.log("Failed to stat files under the directory", err);
}
```

但是实际上，`readdir`和`stat`都是面向文件系统的请求，要获得数据必须要等待文件系统响应触发获得数据的事件，并不能在事件循环外完成。由此，代码就会变得非常难写：

```js
const { readdir, stat } = require("node:fs");
// 注意，readdir作为在JavaScript代码中直接调用的函数，它在主文件执行阶段被执行
// 而作为参数的(err, fileList) => {}则是在事件循环阶段被执行
readdir(rootName, (err, fileList) => {
  if (err !== null)
    return console.log("Failed to stat files under the directory", err);
  fileList.forEach((filename) => {
    stat(`${rootName}/${filename}`, (err, fileStat) => {
      // 如何把多个stat的结果合成一个数组?
    });
  });
});
```

此时我们已经发现，尽管事件循环提供了非阻塞式的执行代码的能力，但是实际上的编写非常复杂。这里可以给出上面例子可以课后继续思考，大致的解法如下所示：

```js
const { readdir, stat } = require("node:fs");
readdir(rootName, (err, fileList) => {
  if (err !== null)
    return console.log("Failed to stat files under the directory", err);
  const fileStats = [];
  fileList.forEach((filename) => {
    stat(`${rootName}/${filename}`, (err, fileStat) => {
      if (err !== null) {
        console.log("Failed to stat files under the directory", err);
        fileStats.push(null);
      } else {
        fileStats.push(fileStat);
        if (fileStats.length === fileList) {
          if (fileStats.every((fileStat) => fileStat !== null)) {
            console.log(fileStats);
          } else {
            console.log("Some error happened.");
          }
        }
      }
    });
  });
});
```

显然，这种编程方法过于反人类，并不易于理解，因此在 2017 年，ECMAScript 标准正式引入了`Promise`内置对象。

```js
const { readdir, stat } = require("node:fs/promises");

readdir(rootName) // Promise<Array<string>>
  .then((fileList) => fileList.map((filename) => stat(filename))) // Promise<Array<Promise<Stat>>>
  .then((statList) => Promise.all(statList)) // Promise<Array<Stat>>
  .then((statList) => console.log(statList));
```

每个`Promise`实例代表一个未来可能发生的事件，在任意时刻，这个事件可能尚未发生，则 Promise 的内部状态为`pending`，事件发生时，则该状态会被改变，由于`Promise`通常与数据的请求有关，改变后的状态可能为则可能为`resolved`（代表请求成功）或`rejected`（代表请求失败）。

`Promise`实例上存在三种方法：`then`，`catch`，`finally`。

### then 方法

通过`then`方法注册一个函数，注册的函数在原实例状态变为`resolved`时被调用，被调用的函数会获得一个参数，即事件对应的数据内容。

`then`方法返回一个新的`Promise`实例，新实例`resolved`时给出的参数是注册函数的返回值。

需要注意的是，多层的`Promise`实例会自然合并，换言之当内部的函数本身就返回一个`Promise`实例时，并不会出现下一个`then`方法中注册的函数接到的参数是`Promise`实例的情况。例如：

```js
// 从镜像选择服务器上获得地理位置最近的服务器，并从那个服务器上获取数据
fetch(mirrorSelectServer)
  .then((res) => res.text())
  .then((nearestServer) => fetch(nearestServer))
  .then((res) => res.text())
  .then((data) => console.log(data));
```

尽管第三行的`fetch`本身返回的是`Promise<Response>`结构，`.then`返回了一个`Promise<Promise<Response>>`，但实际上第四行的`res`参数仍旧是`Response`，因为`Promise<Promise<Response>>`完全的等价于`Promise<Response>`。

### catch 方法

类似于`then`方法，但用于处理`rejected`的情况。同样会返回一个新的`Promise`实例，其内部是被注册函数的返回值。

无论是`then`或`catch`方法，新生成的实例进入的状态取决于：

1. `Promise`实例链上的状态
2. 当前注册的函数执行时使用`return`或`throw`跳出

首先解释第一点：

例如由连续的多个`then`或`catch`调用，例如：

```js
taskA.then(callback1).then(callback2).catch(callback3);
```

如果`taskA`本身进入了`rejected`状态，则`callback1`不会被执行，其状态直接传递到`catch`方法注册的`callback3`中。

如果`taskA`本身成功执行，而`callback1`或`callback2`进行了`throw`跳出，则后续两个生成的`Promise`实例会进入`rejected`状态，然后进入到`callback3`。

继续加长这个链条

```js
taskA
  .then(callback1)
  .then(callback2)
  .catch(callback3)
  .then(callback4)
  .then(callback5);
```

此处，`catch(callback3)`扮演了错误边界的作用，此前发生的所有错误都会在此被拦截，后续的`callback4`将会收到来自`callback2`或`callback3`返回的值。

一些特殊情况下，对错误情况的捕获不使用`catch`方法，而是使用`then`方法的第二参数（onRejected）：

```js
fetch(someServerURL)
  .then((res) => res.json())
  .catch((err) => ({ status: 1, message: "Network Error" }))
  .then((data) => {
    // handle data here
  })
  .catch((err) => {
    // handle error here
  });
```

在浏览器中使用`fetch`函数时，可以使用第三行的`catch`捕获网络错误，但实际上这里的`catch`也可能捕获到`res.json()`无法正常解析接收到的内容而产生的错误，并给出一个不正确的结论（即原本是数据结构错误，但是最终认为是网络故障）。修改后的代码为：

```js
fetch(someServerURL)
  .then(
    (res) => res.json(),
    (err) => ({ status: 1, message: "Network Error" })
  )
  .then((data) => {
    // handle data here
  })
  .catch((err) => {
    // handle error here
  });
```

### finally 方法

`finally`方法无视`Promise`对象究竟进入`rejected`或`resolved`状态，一旦离开`pending`状态即可执行注册的函数。

`finally`方法注册的函数的返回值没有意义，当函数`return`跳出时，该方法返回的`Promise`实例内部状态与原始`Promise`实例一致；但如果是`throw`跳出，则新的实例会进入`rejected`状态，值为`throw`后的值。

一般来说，`finally`方法用于作为请求后的清理工作。例如，某个任务需要逐个下载一系列文件，并执行一定的操作，最后在`finally`中，可以将已经下载的文件全部删除。

总结来说，Promise 的`then`，`catch`和`finally`方法的行为模式和 JavaScript 标准语法的`try catch finally`代码块是基本一致的。

### thenable 和 PromiseLike

`thenable`和`PromiseLike`是一类与标准`Promise`具有相同行为特点的结构。其中一些是在 ES2017 标准实现前，JavaScript 程序员对`Promise`的探索性实现；另一些则是为了特殊目的而设计的结构。

以例如数据库工具`prisma`为例，其函数返回`PrismaPromise`实例，我们可以和`fetch`返回的标准实例做区别：

```js
const fetchPromise = fetch("https://www.baidu.com"); // 此时，一个HTTP请求已经发出了
const dbQueryPromise = prisma.user.findUnique({ where: { id: userId } }); // 此时，并没有任何数据库请求被发出

fetchPromise.then((res) => res.json()).then(console.log);
dbQueryPromise // 这是一个PrismaPromise，只有调用then方法时才会真正发起数据库请求
  .then((result) => {
    const { id, username, createdAt, updatedAt } = result;
    return { id, username, createdAt, updatedAt };
  }) // 数据库请求是在这里发出的
  .then(console.log);
```

这种单独实现的`PromiseLike`对象从调用者的角度来看与标准`Promise`无异，但是能够达到一些特殊的目的，例如这里的`PrismaPromise`就可以确保尽可能晚地发起数据库请求。

### Promise 静态方法

`Promise`类本身提供了四个静态方法用来处理一系列（`Array<Promise<T>>`）实例。

- `all`：返回一个新实例，系列中所有实例都进入`resolved`状态时，进入`resolved`状态；系列中任意一个`rejected`时，进入`rejected`状态
- `allSettled`：返回一个新实例，数组中所有实例离开`pending`状态时，进入`resolved`状态；内部的数组中每个元素都是对象，可能结构为：`{status:"fulfilled", value: T}` 或 `{status: "rejected", reason: E}`
- `race`：返回一个新实例，当系列中任意一个实例离开`pending`状态时（第一个），新实例进入到这个实例所表示的状态；
- `any`：类似于`race`，但优先进入到最先`resolved`状态，除非系列中所有实例都`rejected`，才会进入`rejected`状态。

### async/await

回到上面的`readdir`和`stat`的例子中，我们想要的代码和最终`Promise`的实现仍有较大的差异，基于回调函数的思考模式依然是较为麻烦的。

```js
const { readdir, stat } = require("node:fs");

try {
  const fileList = readdir(rootName);
  const fileStats = fileList.map((filename) => stat(`${rootName}/${filename}`));
  console.log(fileStats);
} catch (err) {
  console.log("Failed to stat files under the directory", err);
}
```

```js
const { readdir, stat } = require("node:fs/promises");

readdir(rootName)
  .then((fileList) => fileList.map((filename) => stat(`${rootName}/${filename}`)))
  .then((statList) => Promise.all(statList))
  .then((statList) => console.log(statList))
  .catch((err) => console.log("Failed to stat files under the directory", err);)
```

ES2017 标准中引入了新语法：`async`/`await`

- `async`可以用于修饰函数声明，例如`async function() {}`或`async () => {}`，被`async`修饰过的函数的返回值会被强制加工成一个`Promise`实例。
- `await`可以在`async`函数内使用，作用于一个`Promise`实例，用于中断当前函数，直至取得`Promise`实例`resolved`的值；若实例进入`rejected`状态，则需要在外部使用`try catch`进行捕获。

```js
const { readdir, stat } = require("node:fs/promises");

async function getFileStats(rootName) {
  try {
    const fileList = await readdir(rootName);
    const promiseStats = fileList.map((filename) => stat(filename));
    const stats = await Promise.all(promiseStats);
    console.log(stats);
  } catch (err) {
    console.log("Failed to stat files under the directory", err);
  }
}

getFileStats(rootName);
```

> 为什么`await`只能在`async`函数中使用？`await`意味着要获得`Promise`实例的结果，而结果必然在至少下一个事件循环中才能得到，如果在一个普通的函数中使用`await`进行中断等待，则这个普通函数无法在主文件执行/任务队列中执行完成，这是不符合普通函数行为模式的。

> 不要使用`return await XXX`语法，因为`async`函数的返回值一定是`Promise`实例，此处`await`等待解析没有任何意义。

> `async`/`await`可以作用于上文提到的`thenable`和`PromiseLike`对象。

## Node.js

Node.js 是一个非浏览器 JavaScript 运行时，其 JavaScript 引擎采用了与 Chromium 相同的 V8 引擎，事件循环机制则利用`libuv`库直接调用操作系统的事件循环，二者分别提供了较高的计算性能和 IO 性能。

Node.js 中没有`window`和`document`对象，但是提供了和本地资源交互用的[API](https://nodejs.org/dist/latest/docs/api/)。其中比较常用的有：

- fs：用于访问本地文件系统
- http：用于建立 HTTP 客户端和服务器
- path：用于处理文件路径
- process：用于访问当前进程的各种资源
- stream：用于处理数据流
- crypto：用于进行密码学操作
- child_process：用于管理子进程
- cluster：用于建立 Node.js 进程集群
- ……

### CommonJS

Node.js 诞生的时代，ESM 模块规范尚未制定。尽管浏览器中可以通过连续引用多个 JavaScript 文件的形式来实现模块的导入，但对于 Node.js 作为更具通用性的运行时环境，有必要提供类似于 Java 或 Python 那样的模块化机制，这就是 CommonJS 规范。

CommonJS 规范与没有模块规范的 ES3 和 ES5 标准完全没有冲突，唯一的区别在于 Node.js 中的 JavaScript 程序可以调用 Node.js API 中的`require`函数引入其他文件中通过`module.exports`导出的值。

```js
// moduleA.js
function sqrt(x) {
  return x ** 2;
}

module.exports = sqrt;

// main.js
const sqrt = require("./moduleA.js");
console.log(sqrt(8));
```

要导出多个值，可以使用：

```js
// moduleB.js
const pi = 3.14;
const e = 2.71;

module.exports = {
  pi,
  e,
};

// main.js
const moduleB = require("./moduleB.js");
console.log(moduleB.pi);
console.log(moduleB.e);
// ES6标准中，支持了解构赋值(Destructuring Assignment)
const { pi, e } = require("./moduleB.js");
```

`require`函数也可以用来引入 Node.js 的各个模块：

```js
const crypto = require("crypto");
const { readFile, writeFile } = require("fs");
```

为表示 Node.js 模块的特殊性，也可以使用`node:xx`来引入：

```js
const crypto = require("node:crypto");
const { readFile, writeFile } = require("node:fs");
```

### Example：Node.js 加密和解密文件

参见：

- `crytoFile.js`
- `decryptFile.js`

课后任务：将这两个文件（以及`package.json`）的模块引入模式从 CommonJS 改为 ESM，并修改为 async/await 形式的代码。

注意，使用 ESM 模式后，可以直接在函数外顶级作用域中使用 await 关键字（但仍然不可以在普通函数里使用）。

`fs`模块有一个 Promise 版本，引用 ID 为`node:fs/promises`，其中的`readFile`和`writeFile`都可以直接使用

`scrypt`函数没有 Promise 版本，但可以通过`node:utils`模块的`promisify`函数转换，下面提供一个示例：

```js
import { promisify } from "node:util";
import { scrypt } from "node:crypto";

const scryptPromise = promisify(scrypt);

const key = await scryptPromise("123123", "apple", 24);
```

你也可以尝试自己实现一个`promisify`函数，参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise)

### ESM

ES2017 标准中，引入了模块机制，为了和 CommonJS 模块做区分，有时也成为 ES Module 或 ESM。尽管 ESM 与旧版本的 ES 标准并无语法上的冲突，但是实际上具体的运行时实现上存在困难，因此实践中一般会区分使用和不使用 ESM 的代码，以不同的模式运行：

- 在 Node.js 中使用 ESM 时，需要将目录下的`package.json`项目配置文件的`"type"`属性设置为`"module"`；
- 在浏览器中使用时，`script`标签上要附加属性`type="module"`。

ESM 例子如下：

```js
// moduleA.js
export function sqrt(x) {
  return x ** 2;
}

// main.js
import { sqrt } from "./moduleA.js";

console.log(sqrt(8));
```

使用`export`关键字，可以导出一个声明语句，这个声明语句可以是变量声明，也可以是函数声明。单一文件中，`export`关键字显然可以导出多个声明，导入时需要他们的具体名称，因此`import`时必然进行解构。

如果不想进行解构或确实只导出一个值，则可以使用`export default`关键字：

```js
// sqrt.js
function sqrt(x) {
  return x ** 2;
}

export default sqrt;

// main.js
import sqrt from "./sqrt.js"; // 事实上此处导入的名称并不限制与导出的变量名一致。

console.log(sqrt(8));
```

可以同时导入默认导出和独立导出的值：

```js
// math.js
export const pi = 3.14;
export const e = 2.71;
function sqrt(x) {
  return x ** 2;
}
export default sqrt;

// main.js
import sqrt, { pi, e } from "./math.js";
```

此外，ESM 还提供了一个`import`函数实现动态导入，这个函数会返回一个含有被导入模块成员的`Promise`实例：

```js
import("node:os").then((os) => {
  console.log(os.cpus());
});
```

> Node.js 的 CommonJS 模式也实现了`import()`函数，可以用于在 CommonJS 模式的项目中导入 ESM 格式的包。

由于 ESM 模式下支持在单个文件（亦是模块）的顶级作用域里直接使用`await`，因此也可以写成：

```js
const os = await import("node:os");

console.log(os.cpus());
```

与`import`关键字不同的是，`import`函数导入的总是一个完整的模块对象，目标文件内的默认导出`export default`只能通过模块对象上的`.default`成员来访问。例如：

```js
// sqrt.js
function sqrt(x) {
  return x ** 2;
}

export default sqrt;

// main.js
const sqrt = (await import("./sqrt.js")).default;

console.log(sqrt(8));
```

### NPM 与 Node.js 项目管理

通常，一个 Node.js 开发项目的全部文件会放到一个目录下，目录根部有一个`package.json`作为项目的主要描述文件和配置文件。

`package.json`中有下列重要的配置项：

- type：项目是否是 ESM 模式的
- dependencies：该项目依赖的软件包和版本，需要安装到 node_modules 下
- devDependencies：该项目开发过程中需要的软件包和版本，开发时需要安装到 node_modules 下，正式部署版本可以不安装
- scripts：项目的快捷命令，可以调用 node_modules 下 bin 目录下的可执行文件
- description：项目描述
- name：项目名称
- license：项目的开源协议
- ……

截止目前，Node.js 只能从本地文件系统中加载 JavaScript 文件，要使用他人编写好的 JavaScript 库，必须先下载到本地的特定目录中。为了避免记录许多路径的麻烦，Node.js 可以从当前工作目录的`node_modules`目录中自动查找到第三方模块对应的文件，要管理`node_modules`中的模块，就需要用到包管理工具：NPM。

```bash
# 初始化项目
npm init
# 安装包
npm install xxx
# 有package.json时，直接安装全部包：
npm install
# 卸载包
npm remove xxx
# 安装全局包，通常是命令行工具
npm install -g xxx
# 执行当前项目的某个命令行工具
npx xxx
```

安装后，即可使用软件包的名称进行导入。

在进行代码管理时，不应该保留`node_modules`目录，而应该保留记录了软件包状态的`package.json`，这是因为对于现代软件开发而言，依赖项目的代码量常常远大于业务代码；其次，一些关键的性能模块可能会使用 C/C++/Rust 等语言编写 Addon 模块和可执行文件，NPM 会自动选择符合操作系统和处理器架构的版本，如果同步到代码仓库中，则会干扰代码在其他平台上的运行。

### 关于 CommonJS 与 ESM 的互操作性

随着 ES2017 标准的发布，ES Module 作为现行标准已经在 Node.js 中得到了完整的支持，但 Node.js 包的维护者态度并不一致：

- 一些包仍旧使用 CommonJS 格式
- 一些包同时包含 CommonJS 和 ESM 两个版本（对于一些引用后有状态的包，这种模式会造成一些问题）
- 一些包完全抛弃了 CommonJS 改为使用 ESM

目前，ESM 模式的项目中可以直接使用`import from`关键词引用 CommonJS 格式的包，`module.exports`直接导出的对象被视为是默认导出(`export default`)、其成员属性（不在`prototype`上的）看作是导出成员(`exprot`)。

在 CommonJS 项目中，无法使用`require`导入 ESM 格式的包，只能使用`import()`函数进行动态导入。

## 面向流编程

回忆一下上面加密、解密的例子，起初我们只使用了较小的文件作为输入，无论加密或是解密都很快，也没有显著的内存消耗。

但如果我们的输入文件更大，例如 1GB，我们就会发现程序运行过程中内存占用显著上涨，如果这个加密函数是某个更加复杂的服务器应用的一部分的话，100 个请求就可能导致一台 256GB 内存的服务器内存用尽而宕机，这显然是不合理的；如果我们的输入文件超过 2GB 时，你甚至会发现这个读取过程都无法完成——Node.js 中，一个变量对应的内存空间是不能超过 2GB 的。

但是实际上，这样的数据量对于日常的业务而言并不算大，用户上传下载 10GB 以上的文件实在是正常的情形。那么，问题出在哪里呢？

我们的程序工作原理：

1. 读取文件到内存中
2. 加密这部分数据
3. 从内存中读取加密后数据保存

对应到 HTTP 服务上，会有类似的：

0. 接到客户端请求
1. 读取文件到内存中
2. 从内存中将数据发给客户端

但实际上，无论是加密或是传输，其实都并不依赖于一个文件的全部数据都在内存里。加密的每个单步过程实际上只需要从文件中读取顺序的一小部分即可；HTTP 传输更是可以以读取一点、传输一点的形式进行。

![改进后的加密和HTTP传输流程图]()

从这个流程图中，我们发现了这种改进后的模式有大量的“当 XX 时”的描述，这意味着这种模式实际上是一种事件驱动编程。

Node.js 中，能产生事件的类都继承自`EventEmitter`类，你可以使用下面函数来像事件源添加事件监听函数：

- `on(name, listener)`：当名称为`name`的事件发生时，调用`listener`
- `once(name, listener)`：当名称为`name`的事件发生时，调用`listener`，但调用过后删除掉这个监听

可以使用`removeListener`函数来移除事件响应，与网页上类似。

不过，对于涉及到大量数据处理的工作而言，这类`EventEmitter`实例上，`data`数据事件会非常频繁且连续的发生，就像是数据以流（stream）的形式喷出一样，因此称为面向流编程。

Node.js 中，设计了`EventEmitter`的子类`Stream`来进行面向流编程。几乎所有涉及到大量数据和大量数据计算的 API 都以`Stream`类为基础，而且有一个专门的 stream 模块用于进行流开发。

`Stream`类又有若干子类，分别是：

- `Readable`：可读流，可以不断从中读取数据
- `Writable`：可写流，可以不断向其中写入数据
- `Duplex`：双工流，它具有可写流和可读流特征，当向其中写入数据时，它就可以向外输出数据
- `Transform`：转换流，当向其中写入数据时，它会将数据进行变换后输出

可以通过执行`Readable`的`.on("data", listener)`开始读取数据，在没有添加这个事件监听器前，它是不会进行数据读取的；可以通过`Writable`的`.write(data)`的方式向可写流中写入数据。一个连接起来的简单方法时：

```js
rStream.on("data", (chunk) => wStream.write(chunk));
```

但实际上还需要考虑`wStream`是否能继续接受数据的写入，例如当外部设备写入很慢，大量数据积压在内存中时，`.write(chunk)`方法会返回`false`，此时应该使`rStream`暂停读取以防止内存过度占用。你可以进一步的修改这个代码来达到目的：

```js
rStream.on("data", (chunk) => {
  const writable = wStream.write(chunk);
  if (!writable) {
    rStream.pause();
    wStream.once("drain", () => {
      rStream.resume();
    });
  }
});
```

当然，除此之外还有读取/写入过程中出错等情况需要考虑，等等。不过我们显然会发现，这样的编程方式仍旧是普通的事件驱动编程，并没有利用到面向流编程的好处。

一个更好的方式是使用`Readable`上的`.pipe(Writeable)`方法，该方法会自动解决上述问题。`.pipe(Writeable)`方法会返回给它的参数，换言之，当输入的参数是一个`Duplex`或`Transform`时，返回的对象也具有`Readable`特性，可以连续的使用`pipe`：

```js
rStream.pipe(gzip).pipe(cipher).pipe(wStream);
```

此前例子中的`cipher`，`decipher`本身就是典型的`Transform`流的一种，只不过没有使用流编程的方式来使用。我们现在可以对他们进行改进，使用 fs 模块的`createReadStream`和`createWriteStream`来建立文件的读取和写入流。改进完成后，我们可以再观察内存占用的情况。

## class 与面向对象编程

绝大多数高级语言都提供了面向对象编程的能力，尽管具体的特征并不完全相同，但大多使用`class`这一关键字用于描述构建一类对象所使用的基础：类。

JavaScript 本身是一门面向函数式编程的语言， 因此其 class 关键词直到 2016 年才加入 ES6 标准，但与`class`密切相关的关键字`new`却早已是标准的一部分——当该关键词作用域一个函数调用时，该函数内的隐式变量`this`将会指向一个新的对象，函数调用结束后，`new`关键词会返回这个新建的对象。

```js
function Cat(name, age) {
  this.name = name;
  this.age = age;
}

Cat.prototype.meow = function () {
  console.log("meow");
};

Cat.prototype.getInfo = function () {
  console.log(`${this.name} is ${this.age} year(s) old`);
};

const cat = new Cat("Harry", 2);
cat.getInfo();
```

> 注意这里的 prototype（原型），JavaScript 的类提供了类似于 Java 那样的继承机制，但其原理是对这个 prototype 的继承，因此也成为基于原型链的继承。

`class`关键字提供了一个更好的类声明方法，使之更像 Java 了：

```js
class Cat {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  meow() {
    console.log("meow");
  }

  getInfo() {
    console.log(`${this.name} is ${this.age} year(s) old`);
  }
}
```

你还可以进一步的使用 setter 和 getter 语法来防止对象的值被错误的修改：

```js
class Cat {
  constructor(name, age) {
    this.name = name;
    this._age = age;
  }

  get age() {
    return this._age;
  }

  set age(value) {
    if (Number.isInteger(value) && value >= 1) {
      this._age = value;
    } else {
      throw new Error("Invalid input");
    }
  }
}

const cat = new Cat("Harry", 2);
cat.age = 3.4; // 抛出错误
```

> 使用非 class 语法构建时，也可以实现 get，set，但需要对每个实例使用`Object.defineProperty`函数实现。（例如 Vue 中，因为开发者定义的数据并非固定的类，就使用了这一方式实现数据与 UI 界面的绑定。）

可以从一个类扩展出子类，使多个类共用一些基础的方法和属性：

```js
class Animal {
  constructor(name, age) {
    this.name = name;
    this._age = age;
  }

  get age() {
    return this._age;
  }

  set age(value) {
    if (Number.isInteger(value) && value >= 1) {
      this._age = value;
    } else {
      throw new Error("Invalid input");
    }
  }
}

class Cat extends Animal {
  constructor(name, age) {
    super(name, age);
  }

  meow() {
    console.log("meow");
  }
}

class Dog extends Animal {
  constructor(name, age) {
    super(name, age);
  }

  bark() {
    console.log("bark");
  }
}
```

## Express 框架

Express.js 是一个 Node.js 框架，可以构建基础的 HTTP 服务，该框架有大量的官方和第三方中间件，能够满足几乎所有的 HTTP 服务构建任务；此外也有很多企业级框架如 Nest.js 包括后面学习的 Next.js 都使用或借鉴了 Express.js。

> Koa 框架也是流行的 Node.js 框架之一，其结构本身相比于 Express.js 更加简化，绝大多数功能依靠第三方中间件来实现。

### 什么是中间件？

一个处理的过程，一定包含一个输入端和一个输出端，例如上面的加密解密的例子中，读取流就是输入端，写入流就是输出端。对于一个 HTTP 请求处理过程而言，服务器端从客户端接到的请求流就是输入端，服务端发送到客户端的响应流就是输出端。

中间的处理过程，对于一些较为简单的过程，例如加密的例子，只需要一个核心处理过程（也就是 cipher 管道）就足够了；但对于复杂业务如 HTTP 业务而言，这个事情就会变得复杂。

例如，为了提升传输效率，减少传输时间，我们常对 HTTP 响应内容进行压缩然后再发送；但更进一步的，我们需要提前分辨客户端是否能够接受这种压缩格式，要让客户端能正确解析，我们还需要在响应头（Response Headers）中加入`Content-Encoding`头来描述使用的压缩方法。换成程序的表示方式就是：

```js
function handler(req, res) {
  const fileStream = getFileRequestStream(req);
  if (req.headers["Accept-Encoding"].includes("br")) {
    res.setHeader("Content-Encoding", "br");
    fileStream.pipe(brotilCompressor).pipe(res);
  } else if (req.headers["Accpet-Encoding"].includes("gzip")) {
    res.setHeader("Content-Encoding", "gzip");
    fileStream.pipe(gzipCompressor).pipe(res);
  } else {
    fileStream.pipe(res);
  }
}
```

对于一个实际的 HTTP 服务器而言，可能不仅有静态文件服务，也有其他多种 API 服务，每个 API 服务都有一个专门的`handler`函数来表示其逻辑，但为了能够都是用压缩功能，就不得不把这里的`if else if else`结构全部复制一份。

显然，这里的这个复杂结构并不易于通过重构一个可在`handler`内调用的`compress`函数的方法实现，我们则需要另想办法完成这一工作。不过这个例子的实现抬过复杂，我们通过另一个例子：记录处理 HTTP 响应所用时长这一任务来代替。

```js
async function handler(req, res) {
  const start = new Date().getTime();
  const internalValue = await doTask1(req);
  const result = await doTask2(internalValue);
  res.send(result);
  logger.info(`use ${new Date().getTime() - start}ms`);
}
```

要把这个功能抽离到`handler`之外，显然可以直接去掉`handler`中的计时代码，放到外面：

```js
const start = new Date().getTime();
await handler(req, res);
logger.info(`use ${new Date().getTime() - start}ms`);
```

要让这一段代码变得可被调用，需要让它变成：

```js
async function timedHandler(req, res) {
  const start = new Date().getTime();
  await handler(req, res);
  logger.info(`use ${new Date().getTime() - start}ms`);
}
```

要能够对不同的`handler`生成对应的`timedHandler`，需要一个函数来实现该功能：

```js
function timer(handler) {
  return async function (req, res) {
    const start = new Date().getTime();
    await handler(req, res);
    logger.info(`use ${new Date().getTime() - start}ms`);
  };
}
```

这样不管`handler`内部原本是什么，只需要调用`timer(handler)`就能包装出带有计时器的版本。

而如果我们要加上别的类似的功能，例如添加压缩功能，我们可以设计类似的`compress`函数，它可以直接套在`timer(handler)`的外面：`compress(timer(handler))`。

> 该功能的实现形式上是这样的，但实际的流程要复杂得多。参考[Express 的 Compression 中间件](https://github.com/expressjs/compression/)的代码

这种提供包装功能的函数，就是中间件。此时，为了能更加简便的使用中间件，我们就需要用到 Express 了。最终得到的函数实际上包含最核心的部分，也包含外层的层层包装，这种多层包装中心的结构有时被称为洋葱模型。

这是一种理论上的模式，实际上 Express.js 的具体实现细节有一定区别，例如本例中直接进行了实际的函数包装，而 Express.js 则是通过在中间件内调用`next()`函数来通过框架调用内层部分（其他中间件或处理函数）：

```js
// 普通的包装模式
function timer(handler) {
  return async function (req, res) {
    const start = new Date().getTime();
    // 例如可能填错参数
    // 也有开发者想要从handler获取返回值，但这是不可靠的
    await handler(res, req);
    logger.info(`use ${new Date().getTime() - start}ms`);
  };
}

// Express中间件
async function timerMiddleware(req, res, next) {
  const start = new Date().getTime();
  // 没有参数就不会填错，没有返回值也避免了潜在的稳定性问题
  await next();
  logger.info(`use ${new Date().getTime() - start}ms`);
}
```

### hello, world

```bash
npm install express --save
```

```js
import express from "express";

const app = express();
// 当用户GET请求/路径的内容时，发送字符串"hello, world"
app.get("/", (req, res) => res.send("hello, world"));
// 程序监听本地8080端口
app.listen(8080);
```

然后我们可编写一个中间件，用来计时：

```js
const timer = async (req, res, next) => {
  const start = new Date().getTime();
  await next();
  console.log(`Use ${new Date().getTime() - start}ms`);
};

app.get("/", timer, (req, res) => res.send("hello, world"));
```

当请求发生时，会顺序执行`timer`和后面的函数。

此时需要重启使得代码生效。反复的修改会使重启工作变得麻烦，我们可以安装一个`nodemon`工具：

```bash
# -D表示是开发阶段使用的工具，并非部署时需要的部分
npm install nodemon -D
```

向`package.json`的`"scripts"`项目中添加一项：`"dev": "nodemon index.js"`

> 注意 JSON 中的逗号分隔符

然后运行：

```bash
npm run dev
```

之后每次修改相关代码时，程序会自动重启。

我们继续添加一个新的路由，可以在路径中增加一些参数：

```js
app.get("/hello/:username", (req, res) =>
  res.send(`hello, ${req.params.username}`)
);
```

显然，我们发现`timer`计时只对`/`路径有效，要想让他能够作用于所有请求，代码需要改成这样：

```js
app.use(timer);
app.get("/", (req, res) => res.send("hello, world"));
app.get("/hello/:username", (req, res) =>
  res.send(`hello, ${req.params.username}`)
);
```

- `.use`方法意味着无视请求方法，对所有方法有效，且匹配所有子路径；
- 这一调用先于后面的调用，因此在洋葱模型的最外侧；
- 由于`timer`调用了`next`方法，所以这个请求的处理过程能够穿入到洋葱模型里层

使用同样的方式，我们还可以添加更多的中间件，可以向其中制定路径添加，也可以添加全局的。

例如`compression`和`bodyParser`(`npm install compression body-parser --save`)

```js
import express from "express";
import bodyParser from "body-parser";
import compression from "compression";

const app = express();

// timer code

app.use(compression);
app.use(timer);
app.get("/", (req, res) => res.send("hello, world"));
app.get("/hello/:username", (req, res) =>
  res.send(`hello, ${req.params.username}`)
);
app.post("/api/poster", jsonParser, (req, res) => {
  console.log(JSON.stringify(req.body));
  res.send("Received");
});
```

> 复杂请求的构建和发起可以使用 Postman 或 VSCode 中的插件如 Thunder Client 等。

现在，我们已经可以初步解析客户端发来的数据并进行处理了，接下来我们将尝试把数据记录下来，并动态的呈现给访问者。

### 简单留言板实践

在正式开始前，我们先做一些代码整理的工作。

#### 代码组织

通常，我们会将不同类别的代码放置到不同的目录下，例如我们现在的代码中有中间件、有路由绑定、有路由处理函数，考虑到路由处理函数通常和路由代码密切相关，我们暂不将他们分离，只将中间件单独拆分出来：

```js
// middlewares/timer.js
const timer = async (req, res, next) => {
  const start = new Date().getTime();
  await next();
  console.log(`Use ${new Date().getTime() - start}ms`);
};

export default timer;

// index.js
import timer from "./middlewares/timer.js";
```

如果我们后续有大量不同的中间件，就可以拆分地写到不同的文件中，而不必让`index.js`过长了。

#### 路由拆分

在 Express 的 Application 实例上，我们绑定中间件/处理函数可以使用：

- 请求方法对应的函数，例如`.get`，`.post`，`.put`，`.delete`等
- 可以适应所有请求方法的函数：`.all`
- 可以适应所有方法并匹配子路径的函数：`.use`

> `use`于`all`的区别：`use("/product", handler)`可以匹配`/product`下的所有路径，例如`/product/details`，`/product/stock`都会导致`handler`被调用，而`all("/product", handler)`只有当访问`/product`时才会被调用。

通常来说，实际应用的 HTTP 服务器大多非常复杂，包括许多动态或静态的路径，例如：

```js
app.get("/api/poster", handler1);
app.get("/api/poster/search", handler2);
app.post("/api/poster", handler3);
app.delete("/api/poster/:id", handler4);
```

如果考虑到这里的`handlers`可能时就地编写的，则这段代码显然会非常长，如果全部放到`index.js`中非常不合适，更何况`/api`下可能还会有更多的子路径例如`/api/user`、`/api/counter`等等。

我们使用 Express 提供的`Router`函数来构建路由类，实现路由的拆分。

```js
// router/api.js
import { Router } from "express";
import posterRouter from "./api/poster.js";
import userRouter from "./api/user.js";
import counterRouter from "./api/counter.js";

const apiRouter = Router();

apiRouter.use("/poster", posterRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("./counter", counterRouter);

export default apiRouter;

// index.js
import apiRouter from "./router/api.js";

app.use("/api", apiRouter);
```

#### 记录数据

最简单的记录数据的方法，是直接在内存中存储。以`poster`为例，我们可以将获得的所有`poster`放入一个数组中：

```js
// posterRouter.js
let posters = [];

postRouter.post("/", jsonParser, (req, res) => {
  posters = [...posters, req.body];
  res.send("received");
});
```

当然，出于安全性的考量，我们应该更进一步地验证传入的对象结构，可以使用名为`zod`的软件包：

```js
import z from "zod";

const posterSchema = z.object({
  email: z.string("Email must be a string").email("Email invalid"),
  content: z
    .string("Poster content must be a string")
    .min(5, "Poster too short, must longer than 5 characters")
    .max(255, "Poster too long, must shorter than 255 characters"),
});

posterRouter.post("/", jsonParser, (req, res) => {
  const validateResult = posterSchema.safeParse(req.body);
  if (validateResult.success) {
    posters = [...posters, validateResult.data];
    res.send("received");
  } else {
    res.status(400).send(validateResult.error.message);
  }
});
```

可以添加一个`GET`方法对应的路由来查看添加后的效果：

```js
posterRouter.get("/", (req, res) => {
  res.json(posters);
});
```

> 注意，修改代码后程序会重启，内存中的记录会随之消失，需要在不重启的情况下重新录入后查看

#### 数据持久化

这种重启丢失数据的情况显然很不合理，但在正式开始使用数据库前，我们可以使用一些方法来解决它：

在终端中结束程序时，我们会按下 Ctrl+C，这会向程序发出`SIGINT`信号，通常程序接到该信号时会选择立刻执行正常退出的过程。我们可以在此时将`posters`的数据以 JSON 格式保存于文件中，然后再退出

```js
// router/api/posters.js
import process from "node:process";
import { writeFile } from "node:fs/promises";

process.on("SIGINT", async () => {
  console.log("Saving posters to file");
  await writeFile("./posters.json", JSON.stringify(posters));
  console.log("Saved");
  // 当绑定了SIGINT事件后，SIGINT信号就无法使得程序自动退出了
  // 因此在这里手动退出
  process.exit(0);
});
```

当然，程序启动时也应该自动加载这个文件：

```js
import { readFile } from "node:fs/promises";
// router/api/posters.js

let posters = await readFile("./posters.json")
  .then(JSON.parse)
  .catch((e) => {
    console.log(JSON.stringify(e));
    return [];
  });
```

此外，我们需要在项目目录下指定`nodemon`所使用的退出信号是`SIGINT`，并且使之忽略我们将要保存的这个 JSON 文件：

```jsonc
// nodemon.json
{
  "signal": "SIGINT",
  "ignore": ["posters.json"]
}
```

> 要手动结束 nodemon 再重新启动才能生效

此时我们再修改代码时，就会发现程序退出时会自动建立文件，如果上传了`poster`，则会有对应的记录在其中。

#### 用户注册与有状态模块

接下来我们考虑要求用户注册登录后才能发送内容的可能性。此时我们需要一个额外的数组用来保存用户信息——显然（从代码组织的就角度看）不能放在`poster.js`中。而我们也不可能通过添加一个额外的`process.on`事件监听来解决，因为先被执行那个事件监听会结束掉进程，后面的就无法生效了。

不过我们可以建立一个动态的函数队列，当收到信号的时候事件监听函数逐个调用这一队列的所有函数，来解决这一问题。

```js
// utils/exitHook.js
import process from "node:process";

let taskQueue = [];

export function addExitHook(fn, ...args) {
  taskQueue = [...taskQueue, [fn, ...args]];
}

export function removeExitHook(toRemove) {
  taskQueue = taskQueue.filter(([fn, ...args]) => toRemove !== fn);
}

process.on("SIGINT", async () => {
  for (const task of taskQueue) {
    const [fn, ...args] = task;
    await fn(...args);
  }
  process.exit(0);
});
```

> 此处用到了数组和函数参数的解构展开语法。

在其他文件中，我们只需要调用`addExitHook`即可添加程序退出时要执行的函数

```js
// poster.js
import { addExitHook } from "utils/exitHooks.js";

addExitHook(async () => {
  console.log("Saving posters to file");
  await writeFile("./posters.json", JSON.stringify(posters));
  console.log("Saved");
});
```

经过测试我们发现，当 JavaScript 中多次使用`import`进行引用的时候，并不会每次都完整地将目标模块的代码重新执行一遍，这就使得每个模块内实际上可以形成一个相对封闭的、有状态的空间，由此实现多个模块间的状态共享等功能。

接下来我们继续构建用户注册体系的工作。这一部分非常简单，于刚才上传`poster`是基本一样的。

#### 登录，session 与 cookie

用户登录的过程需要用户发送用户名和密码并进行验证，我们可以非常容易地将注册部分的代码的基础上修改出登录功能的代码——但我们很快就会发现 HTTP 无状态的特性：下一次请求时，如何证明用户登录过了？

一个简单的方法是，用户每次请求时都带上用户名和密码进行验证，但这显然很有问题，如果让用户每次都进行一次密码输入是非常麻烦的；即使将密码保存于内存中，也无法避免安全性问题：即使使用加密传输，反复被传输的数据是容易被推测出来的。

对任意的两个 HTTP 请求，服务器端程序是无法从 TCP/IP 协议栈本身的信息中去判断发送者是否相同的：

- 链路层：服务器端实际上只能收到距离最近的一个路由的 MAC 地址，客户端的 MAC 地址无法通过传输路径上的路由节点传输过来
- 网络层：从原理上来说，IP 地址和端口号和网络上的一个应用程序是严格绑定的，但是由于 NAT 技术的存在，相同的 IP 地址和端口号可能在一段时间内被多个设备的多个应用程序使用
- 传输层和应用层协议本身不具备任何的唯一性标识，更无从谈起身份鉴别的功能

一种解决的思路是，由客户端程序持有自己的身份证明数据，而服务器具备验证该数据是否真实的能力。

其原理为：

1. 服务器端存在一个密钥`key`，可以用于加密数据
2. 客户端发起登录请求后，如果登录成功，服务器端生成一份会话信息`session=sessionId+expire`
3. 服务器端使用 hmac 算法生成加密摘要`sign=hmac(session, key)`
4. 服务器端发回`session`和`sign`
5. 下次请求时，客户端带上这两项信息，服务器端通过 hmac 检查客户端发送的`session`是否与`sign`匹配
6. 有效期内进行请求时，服务器端会定期在响应中要求发送新的`session`和`sign`来替换旧的，如果一段时间没有通信，时间过了`expire`对应的事件，就必须重新登录了
7. 通过定期更换`key`，可以防止攻击者通过大量数据分析进行攻击

`hmac`算法一般指加密`encrypt`和摘要`hash`结合的算法，其中`hash`算法可以将任意长度数据摘要为定长的、低碰撞率的数据，该算法可以保证无论加密摘要多少数据，最终的签名既唯一，又不至于过长。

这一身份验证方案有一个核心基础：必须进行安全地传输。如果`session`和`sign`同时被攻击者取得，则没有任何安全性可言。通常而言，浏览器认为的安全传输条件是指本地环路网络或 HTTPS 协议的传输。

至于客户端发送请求时携带会话信息和签名信息的方式则较为多样化，包括但不限于：

- Cookie：通过请求头中的 Cookie 项来携带：
  - 优点：是最传统的方式之一，几乎所有 Web 服务框架都能非常简单的提供支持
  - 缺点：浏览器 Cookie 通常存放于文件或嵌入式数据库中，这类数据易被恶意程序读取
- URL：通过访问路径中的参数来携带
  - 优点：没有本地存储，不存在盗取风险
  - 缺点：一些浏览器支持的 URL 长度有限制，会话和签名会占据大量长度
- Body：直接放置到 HTTP 请求主体中
  - 优点：同 URL 传递
  - 缺点：一些请求方式，如 GET、DELETE 等的 HTTP 请求主体原则上不应该有内容

此处我们通过 Express 的 session 中间件来实现登录的功能。

```js
// middleware/session.js
export const session = Session({
  cookie: {
    maxAge: 5 * 60 * 60 * 1000,
    secure: process.env["NODE_ENV"] === "production",
  },
  resave: false,
  saveUninitialized: false,
  secret: 'qujn32*(&">JFD',
});
```

可以将这个中间件置于`apiRouter`上，因为这个路径下的资源基本都需要用到`session`

```js
// router/api.js
apiRouter.use(session);
apiRouter.use("/poster", posterRouter);
apiRouter.use("/user", userRouter);
```

随后我们去改造`/api/user/login`的处理函数，使之在登录后创建会话：

```js
// router/api/user.js
// 核心部分就是一句，向session中设置用户名
req.session.username = username;
res.send("Successful login");
```

> 通过`req.session.destroy()`可以销毁一个 session，尝试实现注销功能

然后我们尝试给发留言和查看留言添加登录要求，如果没有登录，就返回一个 403 的结果。

```js
posterRouter.get("/", (req, res) => {
  if (req.session.username === undefined) {
    res.status(403).send("Must login before use this API");
  } else {
    res.send(posters);
  }
});
```

我们显然意识到这个写法不太好，可以改成中间件的形式：

```js
// middlewares/session.js

export const requireLogin = (req, res, next) => {
  if (req.session.username === undefined) {
    res.status(403).send("Must login before using this API");
  } else {
    next();
  }
};
```

然后直接在最上方`posterRouter.use(requireLogin)`即可。然后我们用客户端测试一下，Postman 和 Thunder Client 都会自动使用得到的 Cookie。

#### 如何保存密码？

撞库攻击是一种十分传统的攻击手段，它利用一切手段成功攻击服务器后，可以获得服务器上数据的访问权限，例如我们存储的`users.json`。此时，如果我们的某个注册用户在所有网站上使用相同的邮箱密码，那这个用户在互联网上就处于非常危险的境地了。

现代安全中会提到的一个重要概念是瑞士奶酪模型，其主要含义是一个复杂体系的各个防御层次都会存在一定程度上的漏洞，但在极端的情况下，原始风险可能能有效利用所有层次的漏洞转换为现实事故；换言之，每个事故都是诸多原因共同作用的结果。

![插图，瑞士奶酪模型]

对于现行互联网的数据安全，对于我们而言存在：

- 用户层次
  - 不在众多网站使用相同的密码
  - 定期修改密码
- 开发/运维层次
  - 及时发现和修复漏洞
  - 不明文存储关键信息
- 数据传输层次
  - 使用加密传输（从链路层到应用层）
  - 定期更新加密密钥

现在，我们假设一个用户层次安全完全失效（现代互联网实情）、系统中的漏洞已经被发现并利用的场景，如何防止用户密码被取得并用于攻击其他网站？

显然，明文存储密码（即使是使用数据库）是不行的，我们必须对密码做某种处理。但这种处理是有条件限制的：

- 当我们拿到密码原文时，要能够很快确认是否与处理后的结果一致
- 当攻击者拿到处理后的结果时，他不能从中恢复出原文

这样看来，简单的 Hash 算法就可以满足我们的要求，但实际上攻击者获得简单的 Hash 之后，可以通过 Hash 碰撞的方式生成一段 Hash 相同的数据，如果另一个服务器使用了同样的 Hash 算法进行密码存储，这一层防御就失效了。

针对这一问题的答案是混淆：通过向数据中的特定位置混入特定的内容（salt），再进行 Hash 时，得到的结果就会完全不同，攻击者即使碰撞出了与本服务器相同的 Hash，也不能用于攻击。

不过，考虑到现代攻击者可能真的能碰撞出混淆后的明文密码，并根据存储的 salt 信息恢复出原始密码，单层的混淆+Hash 的安全性是不够的，由此提出的 bcrypt 算法提供了更复杂的方案：

1. 原始密码(`password`)与盐(`salt`)进行多轮(轮数为 2^`cost`，`cost`至少为 4)混淆，并生成混淆后的密码(`P`)与盐(`S`)
2. 使用混淆的密码与盐对固定内容(`ctext`)进行 64 轮 ECB 加密(`encryptedCtext`)
3. 存储`cost`，`salt`和`encryptedCtext`

当获得一个新的密码`p`时，我们可以重复 1，2 步骤来检查得到的`encryptedCtext`是否一致，来确认密码是否一致，这一过程耗时基本可以接受；而反之，攻击者倒推第二步和第一步都需要非常高的计算成本，当这一计算成本高于攻击收入时，攻击者自然会放弃攻击。

我们可以改进我们的密码验证系统，使用 NPM 的`bcrypt`库。

```js
// router/api/user.js
// 注册
const hashedPassword = await bcrypt.hash(password, 8);
users = [...users, { username, password: hashedPassword }];
// 登录验证
const user = users.find((user) => user.username === username);
if (user === undefined) {
  res.status(404).send("No such user");
} else if (await bcrypt.compare(password, user.password)) {
  req.session.username = username;
  res.send("Successful login");
}
```

#### 构建前端

此时，我们的程序已经可以进行 JSON 格式的响应了，但如果对于正常使用而言，还需要一个前端页面作为界面。我们可以使用 HTML 来构建用户界面。

要让页面能够被访问到，我们需要在 Express 中添加一个静态文件服务。首先创建一个用于存放 HTML 页面的文件夹`public`。

> 将`public/*`添加到`nodemon.json`的`ignore`中，避免不必要的重启。

随后向`index.js`中加入中间件`express.static`：

```js
import { join, dirname } from "node:path";

const url = new URL(import.meta.url);
app.use(express.static(join(dirname(url.pathname), "public")));
```

解释一下这段代码：

- `import.meta.url`是当前代码文件的完整 URL，包括协议`file:`和自根目录往下的完整路径
- `new URL()`从字符串创建一个 URL 对象示例，可以从中获取 URL 的各个部分，例如我们只需要路径部分，就取出`url.pathname`
- `express.static`是`express`模块的`static`中间件构造函数，因为`static`是 JavaScript 关键字，所以一般不把这个函数作为独立的函数取出来
- `dirname`函数可以取得一段路径所指目标所在目录的路径
- `join`函数可以将一段路径的各个部分拼接起来，而不考虑 Windows/UNIX 操作系统上`/`和`\`的区别

`static`中间件有以下特性：

- 当访问路径与所选择的目录下的文件重合时，直接在响应中发送文件而不经过后续中间件
- 当访问路径与所选择目录下的目录重合，且该目录下有 index 文件时（文件名可配置，默认为`index.html`），发送 index 文件而不经过后续中间件
- 其他情况下不做任何操作，调用后续中间件。

简而言之，我们当前选择了与`index.js`同目录下的`public`目录作为静态文件路径，当我们放入文件后，可以从`localhost:3000`上直接访问到。

随后我们设计留言板的几个页面的基本内容。

- 注册
- 登录
- 浏览
- 发表

我们可以使用`fetch`函数从之前设计的 API 路径上获取数据，例如：

```js
fetch("/api/poster", {
  method: "GET",
  credentials: "same-origin",
});
```

`credentials: "same-origin"`表示发起请求时，可以携带来自同一来源下的Cookie。
