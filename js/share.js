var recorder;
var btnRecord = $("#talk_luyin");
var startTime = 0;
var recordTimer = 300,
  countDown = 10,
  countDownTimer = 0;
var url = "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=";
function share() {
  var ajax_data = {};
  $.ajax({
    url: url + "getSignPackage",
    type: "POST",
    data: { url: window.location.href },
    dataType: "json",
    success: function(res) {
      wx.config({
        appId: res.data.appId,
        timestamp: res.data.timestamp,
        nonceStr: res.data.nonceStr,
        signature: res.data.signature,
        jsApiList: [
          // 所有要调用的 API 都要加到这个列表中
          "checkJsApi",
          "onMenuShareTimeline",
          "onMenuShareAppMessage",
          "onMenuShareQQ",
          "onMenuShareWeibo",
          "hideMenuItems",
          "showMenuItems",
          "hideAllNonBaseMenuItem",
          "showAllNonBaseMenuItem",
          "translateVoice",
          "startRecord",
          "stopRecord",
          "onRecordEnd",
          "playVoice",
          "pauseVoice",
          "stopVoice",
          "uploadVoice",
          "downloadVoice",
          "chooseImage",
          "previewImage",
          "uploadImage",
          "downloadImage",
          "getNetworkType",
          "openLocation",
          "getLocation",
          "hideOptionMenu",
          "showOptionMenu",
          "closeWindow",
          "scanQRCode",
          "chooseWXPay",
          "openProductSpecificView",
          "addCard",
          "chooseCard",
          "openCard",
          "onVoicePlayEnd"
        ]
      });
      wx.ready(function() {
        btnRecord
          .on("touchstart", function(event) {
            event.preventDefault();
            $(".talk_show").addClass("live");
            $(".talk_loading").show();
            startTime = new Date().getTime();
            // 延时后录音，避免误操作
            recordTimer = setTimeout(function() {
              wx.startRecord({
                success: function() {
                  localStorage.rainAllowRecord = "true";
                  countDownTimer = setInterval(function() {
                    const newCodeCount = countDown - 1;
                    console.log(newCodeCount);
                    if (newCodeCount <= 0) {
                      countDownTimer && clearInterval(countDownTimer);
                      countDownTimer = 0;
                      countDown = newCodeCount;
                      alert("超时10秒，请重新答题");
                      wx.stopRecord({
                        success: function(res) {},
                        fail: function(res) {}
                      });
                    }
                    countDown = newCodeCount;
                  }, 1000);
                },
                cancel: function() {
                  $(".talk_show").removeClass("live");
                  $(".talk_loading").hide();
                  alert("用户拒绝了录音授权");
                }
              });
            }, 300);
          })
          .on("touchend", function(event) {
            event.preventDefault();
            $(".talk_show").removeClass("live");
            $(".talk_loading").hide();
            // 间隔太短
            if (new Date().getTime() - startTime < 300 || countDown <= 0) {
              startTime = 0;
              // 不录音
              clearTimeout(recordTimer);
            } else {
              // 松手结束录音
              wx.stopRecord({
                success: function(res) {
                  console.log(res);
                  // 上传到服务器
                  uploadVoice(res.localId);
                },
                fail: function(res) {
                  $(".talk_show").removeClass("live");
                  $(".talk_loading").hide();
                  alert(JSON.stringify(res));
                }
              });
            }
            countDownTimer && clearInterval(countDownTimer);
            countDownTimer = 0;
            countDown = 10;
          });
        //注册微信播放录音结束事件
        wx.onVoicePlayEnd({
          success: function(res) {
            stopWave();
          }
        });
        //分享
          var shareData = {};
          shareData["title"] = "BCM贺元宵对成语赢红包";
          shareData["desc"] = "元宵羊毛，非“成”勿扰";
          shareData["imgUrl"] = "https://dev170.weibanker.cn/chenjj/www/BCM/images/first.png";
          shareData["link"] =
            "https://dev170.weibanker.cn/chenjj/www/BCM/index.html";
          shareData["success"] = function() {
            $.ajax({
              url:
                "https://dev170.weibanker.cn/hongjh/www/bcm/api?url=userShare",
              type: "post",
              data: { openid: userInfo.openid },
              dataType: "json",
              success: function(data) {
                if (data.errno == "0") {
                  shareSuccess(res);
                }
              },
              error: function() {}
            });
          };
          shareData["cancel"] = function() {
            shareFail(res);
          };
          wx.onMenuShareAppMessage(shareData);
          wx.onMenuShareTimeline(shareData);
          wx.onMenuShareQQ(shareData);
          wx.onMenuShareWeibo(shareData);
          wx.onMenuShareQZone(shareData);
        });
    },
    error: function(err) {
      alert(err);
    }
  });
}
