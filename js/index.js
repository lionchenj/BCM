share();
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
          // $(".index_first").css('top',up);
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
  var is_weixin = (function() {
    return navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1;
  })();
  if (is_weixin) {
    //微信浏览器
    $(function() {
      var url = location.search; //获取url中"?"符后的字串
      var theRequest = new Object();
      if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
          theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
      }
      //判断是否已授权
      if (
        !theRequest.code ||
        theRequest.code == window.localStorage.getItem("code")
      ) {
        window.location.href =
          "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3707459bb86392f8&redirect_uri=https://dev170.weibanker.cn/chenjj/www/BCM/index.html&response_type=code&scope=snsapi_userinfo#wechat_redirect";
      } else {
        window.localStorage.setItem("code", theRequest.code);
        $(".index_first").on("click", () => {
          if (!noclick) {
            return;
          }
          noclick = false;
          $(".cloud_left").addClass("left");
          $(".cloud_right").addClass("right");
          $.ajax({
            url:
              "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=wechatLogin",
            type: "post",
            data: { code: theRequest.code },
            dataType: "json",
            success: function(res) {
              if (res.errno == "0") {
                userInfo = res.data;
                var div = document.getElementById("index_first");
                goup(div);
                setQuestion();
              } else {
                alert(res.errmsg);
                window.location.reload();
              }
            },
            error: function(error) {
              layer.open({
                content: error,
                btn: "确定",
                shadeClose: false
              });
            }
          });
        });
      }
    });
  } else {
    //不是微信浏览器
    window.location.href = "https://dev170.weibanker.cn/chenjj/www/BCMt/index.html"
  }
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

//回答问题
var localIds,
  cuonum = 0;
function uploadVoice(localId) {
  $(".loading").show();
  //调用微信的上传录音接口把本地录音先上传到微信的服务器
  //不过，微信只保留3天，而我们需要长期保存，我们需要把资源从微信服务器下载到自己的服务器
  localIds = localId;
  wx.translateVoice({
    localId: localIds, // 需要识别的音频的本地Id，由录音相关接口获得
    isShowProgressTips: 1, // 默认为1，显示进度提示
    success: function(res) {
      var translateResult = res.translateResult;
      translateResult = translateResult.replace("。", "");
      translateResult = translateResult.replace("，", "");
      onkey = onkey + 1;
      if (isQuestion != 0) {
        var str = `<div class="im_me">
                            <div class="im_me_talk">
                            <div class="im_me_name">${(userInfo &&
                              userInfo.nickname) ||
                              "小明"}</div>
                            <div class="im_me_text"><div data-localId="${localId}" id="${onkey}">
                                <img class="playend" id="playend${onkey}" src="./images/play.png">${translateResult}
                            </div></div>
                        </div>
                        <div class="im_me_img">
                            <img src="${(userInfo && userInfo.headimgurl) ||
                              "./images/head_user.png"}" alt="">
                        </div>
                    </div>`;
        $(".index_talk_list").append(str);
        $("#" + onkey).on("click", function(e) {
          if ($("#playend" + e.target.id).attr("src") == "./images/play.png") {
            $("#playend" + e.target.id).attr("src", "./images/stop.png");
            wx.playVoice({
              localId: e.currentTarget.dataset.localid // 需要播放的音频的本地ID，由stopRecord接口获得
            });
          } else {
            $("#playend" + e.target.id).attr("src", "./images/play.png");
            wx.stopVoice({
              localId: e.currentTarget.dataset.localid // 需要停止的音频的本地ID，由stopRecord接口获得
            });
          }
        });
        $.ajax({
          url:
            "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=questionAndAnswer",
          type: "post",
          data: { media_id: res.translateResult, openid: userInfo.openid },
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
          url:
            "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=verifyAnswer",
          type: "post",
          data: {
            media_id: translateResult,
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
                            }" src="./images/cuowu.png" alt=""><div data-localId="${localId}" id="${onkey}">
                                <img class="playend" id="playend${onkey}" src="./images/play.png">   ${translateResult}
                            </div></div>
                        </div>
                        <div class="im_me_img">
                            <img src="${(userInfo && userInfo.headimgurl) ||
                              "./images/head_user.png"}" alt="">
                        </div>
                    </div>`;
              $(".index_talk_list").append(str);
              $("#" + onkey).on("click", function(e) {
                if (
                  $("#playend" + e.target.id).attr("src") == "./images/play.png"
                ) {
                  $("#playend" + e.target.id).attr("src", "./images/stop.png");
                  wx.playVoice({
                    localId: e.currentTarget.dataset.localid // 需要播放的音频的本地ID，由stopRecord接口获得
                  });
                } else {
                  $("#playend" + e.target.id).attr("src", "./images/play.png");
                  wx.stopVoice({
                    localId: e.currentTarget.dataset.localid // 需要停止的音频的本地ID，由stopRecord接口获得
                  });
                }
              });
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
    },
    fail: function(res) {
      $(".loading").hide();
      alert("微信暂时耳聋了，请再说一遍");
    }
  });
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
