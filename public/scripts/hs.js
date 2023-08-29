import axios from 'axios';

function logout() {
    fetch('/logout', { method: 'GET' })
      .then(response => response.text())
      .then(message => {
        alert(message);  // 显示服务器返回的注销成功/失败信息
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function getProfile() {
    fetch('/profile', { method: 'GET' })
      .then(response => response.text())
      .then(message => {
          // 显示服务器返回的注销成功/失败信息
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function identity() {
    window.location.href = '/api/user/profile'; // 替换为你要跳转的页面的 URL
  }