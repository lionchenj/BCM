share();
let userInfo,
  question,
  isQuestion = 0,
  onkey = 0;
(() => {
  var url = location.search; //获取url中"?"符后的字串
  var theRequest = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  if (
    !theRequest.code ||
    theRequest.code == window.localStorage.getItem("code")
  ) {
    window.location.href =
      "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3707459bb86392f8&redirect_uri=https://dev170.weibanker.cn/chenjj/www/BCM/index.html&response_type=code&scope=snsapi_userinfo#wechat_redirect";
  } else {
    window.localStorage.setItem("code", theRequest.code);
    $(".index_first").on("click", () => {
      $(".index_first").hide();
      $(".index_start").show();
      $.ajax({
        url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=wechatLogin",
        type: "post",
        data: { code: theRequest.code },
        dataType: "json",
        success: function(res) {
          if (res.errno == "0") {
            $(".index_start").hide();
            userInfo = res.data;
            if (userInfo.is_get == "1") {
              $(".index_end_bg").show();
              $(".index_end").show();
            } else {
              $(".index_talk").show();
              setQuestion();
            }
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
})();

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
              <div class="im_user_name">Root</div>
              <div class="im_user_text">以“${res.data}”字猜一成语？</div>
          </div>
      </div>`;
        $(".index_talk_list").append(str);
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

//上传录音
var localIds,
  cuonum = 0;
function uploadVoice(localId) {
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
            console.log(e.target.id);
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
          data: { media_id: res.translateResult },
          dataType: "json",
          success: function(res) {
            var str = `<div class="im_user">
                          <div class="im_me_img">
                              <img src="./images/head_ai.png" alt="">
                          </div>
                          <div class="im_me_talk">
                              <div class="im_user_name">Root</div>
                              <div class="im_user_text">${res.answer}</div>
                          </div>
                      </div>`;
            $(".index_talk_list").append(str);
            var div = document.getElementById("index_talk_list");
            div.scrollTop = div.scrollHeight;
          },
          error: function(res) {}
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
              var play = true;
              $("#" + onkey).on("click", function(e) {
                console.log(e.target.id);
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
              if (cuonum > 2) {
                $(".talk_next").show();
              }
              var div = document.getElementById("index_talk_list");
              div.scrollTop = div.scrollHeight;
            }
          },
          error: function(res) {}
        });
      }

      var div = document.getElementById("index_talk_list");
      div.scrollTop = div.scrollHeight;
    }
  });
}

$(".end_clickget").on("click", e => {
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=receiveAward",
    type: "post",
    data: { openid: userInfo.openid },
    dataType: "json",
    success: function(data) {
      if (data.errno == "0") {
        $(".setPhone").show();
      } else {
        alert(data.errmsg);
      }
    },
    error: function() {}
  });
});
$(".getPhone_btn").on("click", () => {
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=userMobile",
    type: "post",
    data: { openid: userInfo.openid, mobile: $(".getPhone").value() },
    dataType: "json",
    success: function(data) {
      if (data.errno == "0") {
        alert("已提交");
        $(".setPhone").hide();
      }
    },
    error: function(data) {
      alert(data);
    }
  });
});
$(".end_share").on("click", () => {
  var shareData = {};
  shareData["title"] = "“成”攻薅羊毛";
  shareData["desc"] = "“成”攻薅羊毛";
  shareData["imgUrl"] = "../images/first.png";
  shareData["success"] = function(res) {
    shareSuccess(res);
    $.ajax({
      url: "https://dev170.weibanker.cn/chenjj/www/BCM/index.html",
      type: "post",
      data: { openid: userInfo.openid },
      dataType: "json",
      success: function(data) {
        if (data.errno == "0") {
          alert("分享成功");
        }
      },
      error: function() {}
    });
  };
  shareData["cancel"] = function(res) {
    shareFail(res);
  };
  wx.onMenuShareAppMessage(shareData);
  wx.onMenuShareTimeline(shareData);
  wx.onMenuShareQQ(shareData);
  wx.onMenuShareWeibo(shareData);
  wx.onMenuShareQZone(shareData);
});
$(".next_body_root").on("click", () => {
  $(".talk_next").hide();
  isQuestion = 1;
  $.ajax({
    url: "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=questionAndAnswer",
    type: "post",
    data: { media_id: "你好" },
    dataType: "json",
    success: function(res) {
      var str = `<div class="im_user">
                    <div class="im_me_img">
                        <img src="./images/head_ai.png" alt="">
                    </div>
                    <div class="im_me_talk">
                        <div class="im_user_name">Root</div>
                        <div class="im_user_text">${res.answer}</div>
                    </div>
                </div>`;
      $(".index_talk_list").append(str);
      var div = document.getElementById("index_talk_list");
      div.scrollTop = div.scrollHeight;
    },
    error: function(res) {}
  });
});
$(".next_body_question").on("click", () => {
  $(".talk_next").hide();
  cuonum = 0;
  setQuestion();
});
