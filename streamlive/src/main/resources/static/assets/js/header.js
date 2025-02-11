document.addEventListener('DOMContentLoaded', function(){
    const userId = localStorage.getItem("userId");

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    document.querySelector('.header-logo').addEventListener('click',function (){
        window.location.href="index.html";
    });



    if(localStorage.getItem("userId")){
        // 登入顯示當前用戶名字
        document.getElementById('user-name').textContent="嗨,"+localStorage.getItem("userName");
        // 載入當前使用者的頭像
        const userImage = localStorage.getItem("userImage");
        if (!userImage || userImage === 'null') {
            document.querySelector('.icon-user').src = "https://seanproject.s3.ap-northeast-1.amazonaws.com/user.png";
        } else {
            document.querySelector('.icon-user').src = userImage;
        }
        // 使用者頭像綁定監聽事件(顯示隱藏視窗)
        document.querySelector('.icon-user').addEventListener('click', function() {
            var infoWindow = document.querySelector('header .user-info .info-window');
            if (infoWindow.style.display === 'block') {
                infoWindow.style.display = 'none';
            } else {
                infoWindow.style.display = 'block';
            }
        });
        // 合約紀錄
        document.getElementById('my-contract-btn').addEventListener('click',function (){
            window.location.href = "my-contract.html";
        });
        // 直播紀錄
        document.getElementById('my-livestream-btn').addEventListener('click',function (){
            window.location.href = "live-stream-records.html";
        });
        // 我的商品
        document.getElementById('my-products-btn').addEventListener('click',function (){
            window.location.href = "my-products.html";
        });
        // 個人檔案
        document.getElementById('my-profile-btn').addEventListener('click',function (){
            window.location.href = `profile.html?userId=${localStorage.getItem("userId")}`;
        });
        // 我的訂單
        document.getElementById('my-order-btn').addEventListener('click',function (){
            window.location.href = 'order.html';
        });
        // 綁定登出功能
        document.getElementById('logout-btn').addEventListener('click',function (){
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userId");
            localStorage.removeItem("userImage");
            localStorage.removeItem("userName");
            localStorage.removeItem("UserImage");
            window.location.href="login.html";
        });

    }else{
        document.querySelector('.user-actions').innerHTML = "<a class = 'log-in-btn'>登入</a>";
        document.querySelector('.floating-circle').style.display = "none";
        document.querySelector('.user-actions').addEventListener('click',function (){
            window.location.href="login.html";
        });
    }
});