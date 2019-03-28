let userInfo,
  question,
  isQuestion = 0,
  onkey = 0,
  noclick = true;
//移动效果
goup = div => {
  var top = 0;
  var top2 = 100;
  var downscoll = setInterval(() => {
    top = top + 10;
    div.scrollTop = top;
    console.log(top);
    console.log(div.scrollHeight);
    if (top >= div.scrollHeight) {
      clearInterval(downscoll);
      setTimeout(() => {
        var talkpage = setInterval(() => {
          top2 = top2 - 1;
          let up = top2 + "%";
          console.log(top2);
          console.log(up);
          $(".index_talk").css("top", up);
          if (top2 <= 0) {
            $(".index_talk").css("top", 0);
            clearInterval(talkpage);
            $(".index_first").hide();
          }
        }, 5);
      }, 1000);
    }
  }, 5);
};
(() => {
  $(".index_first").on("click", () => {
    if (!noclick) {
      return;
    }
    noclick = false;
    $(".cloud_left").addClass("left");
    $(".cloud_right").addClass("right");
    userInfo = {
      openid: "oNRUCwLKvGtwiVDgf6A8--bFqSvA",
      headimgurl: "./images/head_user.png",
      nickname: "游客"
    };
    var div = document.getElementById("index_first");
    goup(div);
    setQuestion();
  });
})();

//出题
function setQuestion() {
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=getQuestionInfo",
    type: "post",
    dataType: "json",
    success: function(res) {
      if (res.errno == "0") {
        question = res.data;
        var str = `<div class="im_user">
          <div class="im_me_img">
              <img src="./images/head_ai.png" alt="">
          </div>
          <div class="im_me_talk">
              <div class="im_user_name">BCM Chatbot</div>
              <div class="im_user_text change_Q">包含“${res.data}”字的成语</div>
              <button class="change_question">换题</button>
          </div>
      </div>`;
        $(".index_talk_list").append(str);
        $(".change_question").on("click", () => {
          $.ajax({
            url:
              "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=getQuestionInfo",
            type: "post",
            dataType: "json",
            success: function(res) {
              if (res.errno == "0") {
                question = res.data;
                $(".change_Q").html(`包含“${res.data}”字的成语`);
              }
            },
            error: function(xhr, errorType, error) {
              layer.open({
                content: error,
                btn: "确定",
                shadeClose: false
              });
            }
          });
        });
        var div = document.getElementById("index_talk_list");
        div.scrollTop = div.scrollHeight;
      }
    },
    error: function(xhr, errorType, error) {
      layer.open({
        content: error,
        btn: "确定",
        shadeClose: false
      });
    }
  });
}
$(".answer").on("click", () => {
  uploadVoice($("#setAnswer").val());
});
//回答问题
cuonum = 0;
function uploadVoice(val) {
  $("#setAnswer").val("");
  $(".loading").show();
  onkey = onkey + 1;
  if (isQuestion != 0) {
    var str = `<div class="im_me">
                            <div class="im_me_talk">
                            <div class="im_me_name">${(userInfo &&
                              userInfo.nickname) ||
                              "小明"}</div>
                            <div class="im_me_text">${val}</div>
                        </div>
                        <div class="im_me_img">
                            <img src="${(userInfo && userInfo.headimgurl) ||
                              "./images/head_user.png"}" alt="">
                        </div>
                    </div>`;
    $(".index_talk_list").append(str);
    $.ajax({
      url:
        "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=questionAndAnswer",
      type: "post",
      data: { media_id: val, openid: userInfo.openid },
      dataType: "json",
      success: function(res) {
        var str = `<div class="im_user">
                          <div class="im_me_img">
                              <img src="./images/head_ai.png" alt="">
                          </div>
                          <div class="im_me_talk">
                              <div class="im_user_name">BCM Chatbot</div>
                              <div class="im_user_text">${res.answer}</div>
                          </div>
                      </div>`;
        $(".index_talk_list").append(str);
        var div = document.getElementById("index_talk_list");
        div.scrollTop = div.scrollHeight;
        $(".loading").hide();
      },
      error: function(res) {
        $(".loading").hide();
      }
    });
  } else {
    $.ajax({
      url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=verifyAnswer",
      type: "post",
      data: {
        media_id: val,
        question: question,
        openid: userInfo.openid
      },
      dataType: "json",
      success: function(res) {
        if (res.data == "1") {
          $(".index_talk").hide();
          $(".index_end_bg").show();
          $(".index_end").show();
        } else {
          cuonum = cuonum + 1;
          var str = `<div class="im_me">
                            <div class="im_me_talk">
                            <div class="im_me_name">${(userInfo &&
                              userInfo.nickname) ||
                              "小明"}</div>
                            <div class="im_me_text"><img class="talk_icon ${
                              res.data == "0" ? "" : "none"
                            }" src="./images/cuowu.png" alt="">${val}</div>
                        </div>
                        <div class="im_me_img">
                            <img src="${(userInfo && userInfo.headimgurl) ||
                              "./images/head_user.png"}" alt="">
                        </div>
                    </div>`;
          $(".index_talk_list").append(str);
          if (cuonum == 1) {
            var str = `<div class="im_user">
                <div class="im_me_img">
                    <img src="./images/head_ai.png" alt="">
                </div>
                <div class="im_me_talk">
                    <div class="im_user_name">BCM Chatbot</div>
                    <div class="im_user_text">不要紧，你犯了一个全人类都会犯的错，再给个答案</div>
                </div>
            </div>`;
            $(".index_talk_list").append(str);
          }
          if (cuonum == 2) {
            var str = `<div class="im_user">
                <div class="im_me_img">
                    <img src="./images/head_ai.png" alt="">
                </div>
                <div class="im_me_talk">
                    <div class="im_user_name">BCM Chatbot</div>
                    <div class="im_user_text">O__O ，该调用一下你的情商和智商了，加油</div>
                </div>
            </div>`;
            $(".index_talk_list").append(str);
          }
          if (cuonum > 2) {
            var str = `<div class="im_user">
                <div class="im_me_img">
                    <img src="./images/head_ai.png" alt="">
                </div>
                <div class="im_me_talk">
                    <div class="im_user_name">BCM Chatbot</div>
                    <div class="im_user_text">必须承认，这个成语对你来说太难了，要重新挑战还是请教一下BCM博士？</div>
                </div>
            </div>`;
            $(".index_talk_list").append(str);
            $(".change_question").remove();
            $(".talk_next").show();
          }
          var div = document.getElementById("index_talk_list");
          div.scrollTop = div.scrollHeight;
        }
        $(".loading").hide();
      },
      error: function(res) {
        $(".loading").hide();
      }
    });
  }
  var div = document.getElementById("index_talk_list");
  div.scrollTop = div.scrollHeight;
}

//提取奖励
$(".end_clickget").on("click", e => {
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=receiveAward",
    type: "post",
    data: { openid: userInfo.openid },
    dataType: "json",
    success: function(data) {
      if (data.errno == "0") {
        $(".rule_bg").show();
        $(".index_end_bg").hide();
        $(".index_end").hide();
      } else {
        alert(data.errmsg);
      }
    },
    error: function() {}
  });
});
//提交手机号码
var phone = "";
$("#getPhone").on("input", e => {
  console.log(e.target.value);
  if (e.target.value.length == 11) {
    phone = e.target.value;
  }
});
$(".getPhone_btn").on("click", () => {
  if (phone.length < 11) {
    alert("手机号码不足11位");
    return;
  }
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=userMobile",
    type: "post",
    data: { openid: userInfo.openid, mobile: phone },
    // data: { openid: 'oNRUCwLKvGtwiVDgf6A8--bFqSvA', mobile: e.target.value },
    dataType: "json",
    success: function(data) {
      if (data.errno == "0") {
        $(".index_end_bg").show();
        $(".setPhone").show();
      }
    },
    error: function(data) {
      alert(data);
    }
  });
});
$(".download_btn").on("click", () => {
  window.location.href = "https://bcm-im.com/beta_download/index.html";
});

//尬聊
$(".next_body_root").on("click", () => {
  $(".talk_next").hide();
  isQuestion = 1;
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=questionAndAnswer",
    type: "post",
    data: { media_id: "你好", openid: userInfo.openid },
    dataType: "json",
    success: function(res) {
      var str = `<div class="im_user">
                    <div class="im_me_img">
                        <img src="./images/head_ai.png" alt="">
                    </div>
                    <div class="im_me_talk">
                        <div class="im_user_name">BCM Chatbot</div>
                        <div class="im_user_text">${res.answer}</div>
                    </div>
                </div>`;
      $(".index_talk_list").append(str);
      var div = document.getElementById("index_talk_list");
      $(".loading").hide();
    },
    error: function(res) {}
  });
});
//分享按钮
$(".end_share").on("click", () => {
  $(".share_btn").show();
});
$(".share_btn").on("click", () => {
  $(".share_btn").hide();
});
//再来一次
$(".next_body_question").on("click", () => {
  $(".talk_next").hide();
  cuonum = 0;
  var str = `<div class="im_me">
              <div class="im_me_talk">
              <div class="im_me_name">${(userInfo && userInfo.nickname) ||
                "小明"}</div>
              <div class="im_me_text">重新挑战</div>
          </div>
          <div class="im_me_img">
              <img src="${(userInfo && userInfo.headimgurl) ||
                "./images/head_user.png"}" alt="">
          </div>
      </div>`;
  $(".index_talk_list").append(str);
  setQuestion();
});
