$(document).ready(function () {
  let fullNameObj, msgObj, chatFormObj, chatItemHtml, chatContentObj;

  fullNameObj = $("input[name='fullname']");

  msgObj = $("input[name='msg']");

  chatFormObj = $(".chat form");

  chatContentObj = $(".msg-content");

  if (chatFormObj !== null) {
    chatItemHtml = `
            <div class="msg-item">
                  <label for="">{name}</label>
                  {msg}
            </div>
      `;

    if (fullNameObj !== null) {
      // Khi nhập tên vào input
      fullNameObj.change(function () {
        let fullName = $(this).val();

        if (fullName.trim() !== "") {
          sessionStorage.setItem("fullname", fullName);
        }
      });

      // Khi load trang
      if (sessionStorage.getItem("fullname") !== null) {
        fullNameObj.val(sessionStorage.getItem("fullname").trim());
      }
    }

    chatFormObj.submit(function (e) {
      e.preventDefault(); // Prevent submission

      let fullName;
      if (fullNameObj !== null) {
        fullName = fullNameObj.val();
      }

      if (msgObj !== null) {
        let msg = msgObj.val();

        if (msg.trim() === "" || fullName.trim() === "") {
          if (fullName.trim() === "") {
            alert("Vui lòng nhập tên");
          } else {
            alert("Vui lòng nhập tin nhắn");
          }
        } else {
          if (chatContentObj !== null) {
            // Thay thế tin nhắn và tên
            let chatItemHtmlNew = chatItemHtml.replace("{name}", fullName).replace("{msg}", msg);

            let sendMessage = sendMsg(fullName, msg);

            sendMessage.then((data) => {
              if (data !== "") {
                chatContentObj.append(chatItemHtmlNew);

                // Reset nội dung tin nhắn
                msgObj.val("");
                msgObj.focus();
              }
            });
          }
        }
      }
    });

    // Tự động load tin nhắn
    setInterval(() => {
      let msgContentPromise = getMsg();

      msgContentPromise.then((data) => {
        if (data !== "") {
          let dataObj = JSON.parse(data);

          let msgContent = "";

          dataObj.forEach(function (item) {
            let chatItemHtmlNew = chatItemHtml.replace("{name}", item.fullname).replace("{msg}", item.msg);

            msgContent += chatItemHtmlNew;
          });

          if (chatContentObj !== null && msgContent.trim() !== null) {
            chatContentObj.html(msgContent);
          }
        }
      });
    }, 1000);
  }

  function sendMsg(name, msg) {
    const msgPromise = new Promise((success, error) => {
      const currentDate = new Date();
      const createdAt = currentDate.getDate() + "/" + currentDate.getMonth() + 1 + "/" + currentDate.getFullYear() + " " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

      const data = {
        fullname: name,
        msg: msg,
        create: createdAt,
      };

      const dataJson = JSON.stringify(data);

      const xhttp = new XMLHttpRequest();

      const url = "http://localhost:8000/chat";

      xhttp.open("POST", url, true);

      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      xhttp.send(dataJson);

      xhttp.onload = function () {
        if (this.status == 201) {
          success(this.response);
        }
      };

      return msgPromise;
    });
  }

  function getMsg() {
    const msgPromise = new Promise((success, error) => {
      const xhttp = new XMLHttpRequest();

      const url = "http://localhost:8000/chat";

      xhttp.open("GET", url, true);

      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      xhttp.send();

      xhttp.onload = function () {
        if (this.status == 200) {
          success(this.response);
        }
      };
    });

    return msgPromise;
  }
});
