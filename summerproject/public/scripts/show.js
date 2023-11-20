// 确保DOM加载完毕后执行脚本
document.addEventListener('DOMContentLoaded', () => {
    // 使用fetch函数从服务器获取数据
    fetch('/api/post/')
      .then(response => response.json())
      .then(posts => {
        // 将获取到的数据赋值给HTML元素
        const postsContainer = document.getElementById('posts');
        let htmlContent = ''; // 创建一个空字符串用于存储拼接的HTML内容
        for (const post of posts) {
          // 每个.post元素都被放在一个.box容器中
          
            htmlContent += `<div class="post">`; // 将每个循环内容包裹在一个<div>元素中
                htmlContent += `<div class="box8">`;
            htmlContent += `<div class="box1">`;
            htmlContent += `<div>userid: ${post.userId}</div>`;
            htmlContent += '</div>';
            
            htmlContent += `<div class="box2">`;
            htmlContent += `<div>${post.title}</div>`;
            htmlContent += '</div>';

            htmlContent += `<div class="box3">`;
          htmlContent += `<div>  ${post.content}</div>`;
          htmlContent += '</div>';

          htmlContent += `<div class="box7">`;
            htmlContent += '</div>';

          htmlContent += `<div class="box4">`;
          htmlContent += `<div>creatAt: ${post.creatAt}</div>`;
          htmlContent += '</div>';

          htmlContent += `<div class="box5">`;
          htmlContent += `<div>ipAddress: ${post.ipAddress}</div>`;
          htmlContent += `<button class="delete-button" data-id="${post.userId}" onclick="del(${post.id})" >删除</button>`;
          htmlContent += '</div>';

          htmlContent += `<div class="box6">`;
            htmlContent += '</div>';
            htmlContent += '</div>';
          htmlContent += '</div>';

          postsContainer.innerHTML = htmlContent; 
        }
        
      })
      .catch(error => console.error(error));
  });

  function del(postId) {
            
    // 获取帖子的 id，这里假设你已经定义了变量 postId 作为帖子的 id 值
  
    // 构建删除请求的 URL
    const url = `/api/post/${postId}`;
  
    // 发送删除请求
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin' // 如果需要传递会话信息，确保使用相同的源
    })
    .then(response => {
      if (response.status === 200) {
        console.log(`${postId}`);
        alert("删除成功");
      } else {
        console.log("删除失败");
        alert("没有权限");
      }
    })
    .catch(error => {
      console.error("删除请求出错:", error);
      alert("删除请求成功");
    });

}